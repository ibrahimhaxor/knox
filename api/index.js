// ============================================
// LOGIN & AUTHENTICATION SYSTEM
// Vercel Serverless Handler
// ============================================

// In-memory store (resets on cold start — replace with Upstash/DB in prod)
const USERS = {
    // demo / demo1234  →  credits: 100
    demo: {
        id: "user_demo_001",
        username: "demo",
        password: "demo1234",
        email: "demo@oumse.local",
        subscription: "pro",
        subscription_expires: "2099-01-01T00:00:00.000Z",
        credits: 100,
        is_admin: false
    }
};

const SESSIONS = {};        // token -> { user_id, expires_at }
const HWIDS = {};           // user_id -> { hwid: device_id }
const TRANSACTIONS = [];    // audit log

const OPERATIONS = [
    { id: "spd_patch",           device: "mtk",      cost_credits: 5, label: "SPD Patch (MTK)" },
    { id: "frp_unlock",          device: "qualcomm", cost_credits: 3, label: "FRP Unlock" },
    { id: "bootloader_unlock",   device: "mtk",      cost_credits: 8, label: "Bootloader Unlock" },
    { id: "meta_fix_blackscreen",device: "mtk",      cost_credits: 2, label: "Meta Fix Blackscreen" }
];

const SESSION_TTL_SECONDS = 18000;  // 5 hours

// ============================================
// MAIN HANDLER
// ============================================
export default async function handler(req, res) {

    const path = req.url.split("?")[0];
    const body = await readBody(req);

    console.log("METHOD:", req.method);
    console.log("PATH:",   path);
    console.log("BODY:",   body);

    // Allow the custom client UA only
    const ua = (req.headers["user-agent"] || "");
    const fromClient = ua.includes("OumseGsmToolPro/");

    // --------------------------------------------------------------
    // POST /api/login
    // --------------------------------------------------------------
    if (path === "/api/login" && req.method === "POST") {
        const { username, password, remember_me, hwid } = body || {};

        if (!username || !password) {
            return res.status(400).json({ error: "Missing credentials" });
        }

        const user = USERS[username.toLowerCase()];
        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        if (user.subscription_expires &&
            new Date(user.subscription_expires).getTime() < Date.now()) {
            return res.status(403).json({
                error: "Subscription expired. Re-login required after renewal."
            });
        }

        const access_token  = makeToken(user.id, "access");
        const refresh_token = makeToken(user.id, "refresh");
        const now = new Date();

        SESSIONS[access_token] = {
            user_id: user.id,
            expires_at: new Date(now.getTime() + SESSION_TTL_SECONDS * 1000).toISOString()
        };

        // Auto-register HWID on login if sent
        if (hwid) {
            registerHwid(user.id, hwid, "AUTO");
        }

        return res.status(200).json({
            access_token,
            refresh_token,
            token_type: "Bearer",
            expires_in: SESSION_TTL_SECONDS,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                subscription: user.subscription,
                subscription_expires: user.subscription_expires,
                credits: user.credits,
                is_admin: user.is_admin
            }
        });
    }

    // --------------------------------------------------------------
    // GET /api/me
    // --------------------------------------------------------------
    if (path === "/api/me" && req.method === "GET") {
        const auth = requireAuth(req, res, SESSIONS);
        if (!auth) return;

        const user = getUserById(auth.user_id);
        if (!user) return res.status(404).json({ error: "User not found" });

        return res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            subscription: user.subscription,
            subscription_expires: user.subscription_expires,
            credits: user.credits,
            is_admin: user.is_admin
        });
    }

    // --------------------------------------------------------------
    // POST /api/heartbeat
    // --------------------------------------------------------------
    if (path === "/api/heartbeat" && req.method === "POST") {
        const auth = requireAuth(req, res, SESSIONS);
        if (!auth) return;

        // Refresh expiry (5h window)
        const newExpiry = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
        SESSIONS[auth.token].expires_at = newExpiry;

        // 426 → force update
        const clientVersion = req.headers["x-client-version"];
        const minVersion    = "1.1.8";
        if (clientVersion && compareVersions(clientVersion, minVersion) < 0) {
            return res.status(426).json({
                error: "Mise a jour requise (heartbeat 426)",
                min_version: minVersion
            });
        }

        return res.status(200).json({
            status: "ok",
            session_expires: newExpiry
        });
    }

    // --------------------------------------------------------------
    // GET /api/operations
    // --------------------------------------------------------------
    if (path === "/api/operations" && req.method === "GET") {
        const auth = requireAuth(req, res, SESSIONS);
        if (!auth) return;

        return res.status(200).json({ operations: OPERATIONS });
    }

    // --------------------------------------------------------------
    // POST /api/check_op
    // --------------------------------------------------------------
    if (path === "/api/check_op" && req.method === "POST") {
        const auth = requireAuth(req, res, SESSIONS);
        if (!auth) return;

        const { operation, device } = body || {};
        const op = OPERATIONS.find(o => o.id === operation);
        if (!op) {
            return res.status(400).json({ allowed: false, error: "Unknown operation" });
        }

        const user = getUserById(auth.user_id);
        if (!user) return res.status(404).json({ error: "User not found" });

        return res.status(200).json({
            allowed: user.credits >= op.cost_credits,
            cost_credits: op.cost_credits,
            subscription_covers: false,
            remaining: user.credits,
            operation,
            device: device || op.device
        });
    }

    // --------------------------------------------------------------
    // POST /api/consume_op
    // --------------------------------------------------------------
    if (path === "/api/consume_op" && req.method === "POST") {
        const auth = requireAuth(req, res, SESSIONS);
        if (!auth) return;

        const { operation, device, confirm } = body || {};
        if (!confirm) {
            return res.status(400).json({ error: "Not confirmed" });
        }

        const op = OPERATIONS.find(o => o.id === operation);
        if (!op) return res.status(400).json({ error: "Unknown operation" });

        const user = getUserById(auth.user_id);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (user.credits < op.cost_credits) {
            return res.status(402).json({
                error: `Credits insuffisants. Tu as ${user.credits}, il faut ${op.cost_credits}.`
            });
        }

        user.credits -= op.cost_credits;
        const transaction_id = "txn_" + generateUUID();

        TRANSACTIONS.push({
            transaction_id,
            user_id: user.id,
            operation,
            device: device || op.device,
            cost: op.cost_credits,
            remaining: user.credits,
            at: new Date().toISOString()
        });

        return res.status(200).json({
            success: true,
            remaining_credits: user.credits,
            transaction_id
        });
    }

    // --------------------------------------------------------------
    // POST /api/flag_hwid
    // --------------------------------------------------------------
    if (path === "/api/flag_hwid" && req.method === "POST") {
        const auth = requireAuth(req, res, SESSIONS);
        if (!auth) return;

        const { hwid, device_name } = body || {};
        if (!hwid) return res.status(400).json({ error: "Missing hwid" });

        const device_id = registerHwid(auth.user_id, hwid, device_name || "UNKNOWN");
        return res.status(200).json({ registered: true, device_id });
    }

    // --------------------------------------------------------------
    // POST /api/logout
    // --------------------------------------------------------------
    if (path === "/api/logout" && req.method === "POST") {
        const auth = requireAuth(req, res, SESSIONS);
        if (!auth) return res.status(200).json({ ok: true }); // idempotent

        delete SESSIONS[auth.token];
        return res.status(200).json({ ok: true });
    }

    // --------------------------------------------------------------
    // POST /api/run_spd
    // --------------------------------------------------------------
    if (path === "/api/run_spd" && req.method === "POST") {
        const auth = requireAuth(req, res, SESSIONS);
        if (!auth) return;

        const { prodnv } = body || {};
        if (!prodnv) return res.status(400).json({ error: "Missing prodnv" });

        // TODO: real SPD patcher
        const fakeHash = Buffer.from(String(prodnv)).toString("base64").slice(0, 16);
        return res.status(200).json({
            success: true,
            patched: true,
            hash: fakeHash
        });
    }

    // --------------------------------------------------------------
    // GET /api/get_algo
    // --------------------------------------------------------------
    if (path === "/api/get_algo" && req.method === "GET") {
        const auth = requireAuth(req, res, SESSIONS);
        if (!auth) return;

        return res.status(200).json({
            algorithm: "aes-256-gcm",
            iv: "000000000000000000000000",
            version: 1
        });
    }

    // --------------------------------------------------------------
    // /api/dwmapi (unknown)
    // --------------------------------------------------------------
    if (path === "/api/dwmapi") {
        return res.status(501).json({ error: "Not implemented" });
    }

    // --------------------------------------------------------------
    // LEGACY 360 TOOL ROUTES (kept from your original index.js)
    // --------------------------------------------------------------
    if (path === "/360/version" && req.method === "GET") {
        return res.status(200).json({
            version: "1.1.8",
            url: "https://www.mediafire.com/file/rqr0wr8uc4zq0op/360-tool-v1.2.1_fixed.zip/file"
        });
    }

    if (path === "/360/credit1234567" && (req.method === "GET" || req.method === "POST")) {
        const operation  = body?.operation  || "spd";
        const request_id = body?.request_id || generateUUID();
        const cost       = body?.cost       || 2;
        const now        = new Date();

        const response = {
            success: true,
            message: "OK",
            operation,
            request_id,
            cost,
            credits_used: cost,
            credits_left: 248,
            balance: 248,
            confirmed_balance: 248,
            new_balance: 248,
            credits: 248,
            license_expiry: "2099-01-01 00:00:00",
            lock_expiry: "2099-01-01 00:00:00",
            server_time_utc: now.toISOString(),
            server_time: now.toISOString().replace("T", " ").substring(0, 19),
            auth_check_interval: 3600,
            server_time_offset: 0,
            login_time: now.toISOString().replace("T", " ").substring(0, 19)
        };

        if (operation === "spd") {
            response.message = "SPD operation successful";
        } else if (operation === "mtk") {
            response.message = "MTK operation successful";
        } else if (operation === "meta_fix_blackscreen") {
            response.message = "Meta fix blackscreen operation successful";
            response.meta_status = "fixed";
            response.blackscreen_fix = "applied";
        } else {
            response.message = "Operation successful";
        }

        return res.status(200).json(response);
    }

    if (path === "/360/login12" && req.method === "POST") {
        const now = new Date();
        const time = now.toISOString().replace("T", " ").substring(0, 19);

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            server_time_utc: now.toISOString(),
            server_time: time,
            server_time_offset: 0,
            auth_check_interval: 3600,
            lock_expiry: "2099-01-01 00:00:00",
            login_time: time,
            license_expiry: "2099-01-01 00:00:00",
            credits: 250
        });
    }

    // ---- YOUR EXISTING FALLBACKS ----
    let action = "";
    try { action = body?.action || ""; } catch (e) {}

    if (action === "get_patch_algorithms" || req.url.includes("algorithms")) {
        return res.status(200).json({ status: "SUCCESS", algorithms: [] });
    }
    if (action === "get_secure_logic" || req.url.includes("secure")) {
        return res.status(200).json({ status: "SUCCESS", data: "License valid" });
    }
    if (req.url.includes("check_update")) {
        return res.status(200).send("0.7.93");
    }

    // OLD FALLBACK
    return res.status(200).send("SUCCESS|732|2028-06-08");
}

// ============================================
// HELPERS
// ============================================

function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function makeToken(user_id, kind) {
    return `${kind}_${user_id}_${generateUUID()}`;
}

function getUserById(id) {
    return Object.values(USERS).find(u => u.id === id) || null;
}

function registerHwid(user_id, hwid, device_name) {
    if (!HWIDS[user_id]) HWIDS[user_id] = {};
    if (!HWIDS[user_id][hwid]) {
        HWIDS[user_id][hwid] = "dev_" + generateUUID();
    }
    return HWIDS[user_id][hwid];
}

function requireAuth(req, res, SESSIONS) {
    const header = req.headers["authorization"] || "";
    const m = header.match(/^Bearer\s+(.+)$/i);
    if (!m) {
        res.status(401).json({ error: "Unauthorized" });
        return null;
    }
    const token = m[1];
    const session = SESSIONS[token];
    if (!session) {
        res.status(401).json({ error: "Unauthorized" });
        return null;
    }
    if (new Date(session.expires_at).getTime() < Date.now()) {
        delete SESSIONS[token];
        res.status(401).json({ error: "Unauthorized" });
        return null;
    }
    return { ...session, token };
}

function compareVersions(a, b) {
    const pa = String(a).split(".").map(Number);
    const pb = String(b).split(".").map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const d = (pa[i] || 0) - (pb[i] || 0);
        if (d !== 0) return d;
    }
    return 0;
}

// Safe body reader — works whether Vercel parsed it or not
async function readBody(req) {
    if (req.body && typeof req.body === "object") return req.body;
    if (typeof req.body === "string") {
        try { return JSON.parse(req.body); } catch { return {}; }
    }
    return await new Promise((resolve) => {
        let data = "";
        req.on("data", c => (data += c));
        req.on("end", () => {
            try { resolve(JSON.parse(data)); } catch { resolve({}); }
        });
        req.on("error", () => resolve({}));
    });
}
