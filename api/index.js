// ============================================
// OUMSE GSM TOOL PRO — Vercel Serverless Handler
// CJS export (required for "builds" in vercel.json)
// ============================================
module.exports = function handler(req, res) {

    // ============================================
    // CORS + PREFLIGHT
    // ============================================
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const path = req.url.split("?")[0];

    console.log("METHOD:", req.method);
    console.log("PATH:", path);
    console.log("BODY:", req.body);
    console.log("CONTENT-TYPE:", req.headers["content-type"]);

    // ============================================
    // GET /360/version
    // ============================================
    if (path === "/360/version" && req.method === "GET") {
        return res.status(200).json({
            version: "1.1.8",
            url: "https://www.mediafire.com/file/rqr0wr8uc4zq0op/360-tool-v1.2.1_fixed.zip/file"
        });
    }

    // ============================================
    // /360/credit1234567 - SPD, MTK, META_FIX_BLACKSCREEN
    // ============================================
    if (path === "/360/credit1234567" && (req.method === "GET" || req.method === "POST")) {
        return creditResponse(res, req.body);
    }

    // ============================================
    // POST /360/login12 — WITH CREDENTIAL VALIDATION
    // ============================================
    if (path === "/360/login12" && req.method === "POST") {
        return login360(req, res);
    }

    // ============================================
    // POST /360/login13 — alias of login12
    // ============================================
    if (path === "/360/login13" && req.method === "POST") {
        return login360(req, res);
    }

    // ============================================
    // /smarttool-api/*  (NEW)
    // ============================================
    if (path.startsWith("/smarttool-api/")) {
        const sub = path.slice("/smarttool-api/".length);

        if (sub === "version" && req.method === "GET") {
            return res.status(200).json({
                version: "1.1.8",
                url: "https://www.mediafire.com/file/rqr0wr8uc4zq0op/360-tool-v1.2.1_fixed.zip/file"
            });
        }

        if ((sub === "login" || sub === "login12" || sub === "login13") && req.method === "POST") {
            return login360(req, res);
        }

        if ((sub === "credit" || sub === "credit1234567") &&
            (req.method === "GET" || req.method === "POST")) {
            return creditResponse(res, req.body);
        }

        return res.status(200).send("SUCCESS|732|2028-06-08");
    }

    // ============================================
    // /api/*  (LOGIN & AUTH SYSTEM)
    // ============================================
    if (path.startsWith("/api/")) {
        return handleApi(path, req, res);
    }

    // ============================================
    // EXISTING FALLBACKS
    // ============================================
    let action = "";
    try {
        if (req.body && req.body.action) {
            action = req.body.action;
        }
    } catch (e) {}

    if (action === "get_patch_algorithms" || req.url.includes("algorithms")) {
        return res.status(200).json({
            status: "SUCCESS",
            algorithms: []
        });
    }

    if (action === "get_secure_logic" || req.url.includes("secure")) {
        return res.status(200).json({
            status: "SUCCESS",
            data: "License valid"
        });
    }

    if (req.url.includes("check_update")) {
        return res.status(200).send("0.7.93");
    }

    // OLD FALLBACK
    return res.status(200).send("SUCCESS|732|2028-06-08");
};

// ============================================
// /360/login12 + login13 IMPLEMENTATION
// ============================================
function login360(req, res) {

    // ---- Parse body (JSON, form-encoded, or raw string) ----
    let body = req.body;

    if (typeof body === "string") {
        try {
            const parsed = Object.fromEntries(new URLSearchParams(body));
            if (Object.keys(parsed).length > 0) body = parsed;
        } catch (e) { /* ignore */ }
    }

    body = body || {};

    // ---- Pull credentials from any common field name ----
    const urlObj = new URL(req.url, "http://localhost");

    let username =
        body.username || body.user || body.login || body.email || body.name ||
        urlObj.searchParams.get("username") ||
        urlObj.searchParams.get("user") ||
        urlObj.searchParams.get("login") ||
        "";

    let password =
        body.password || body.pass || body.pwd || body.passwd ||
        urlObj.searchParams.get("password") ||
        urlObj.searchParams.get("pass") ||
        urlObj.searchParams.get("pwd") ||
        "";

    // ---- Normalize (decode, strip quotes, trim) ----
    username = decodeURIComponent(String(username)).replace(/^"|"$/g, "").trim();
    password = decodeURIComponent(String(password)).replace(/^"|"$/g, "").trim();

    // ---- DEBUG LOG ----
    console.log("LOGIN ATTEMPT → username:", JSON.stringify(username));
    console.log("LOGIN ATTEMPT → password:", JSON.stringify(password));
    console.log("LOGIN RAW BODY:", JSON.stringify(req.body));

    // ---- Validate credentials ----
    const validUser = username.toLowerCase() === "ibrahimnet";
    const validPass = password === "ibrahim@360";

    if (!validUser || !validPass) {
        // 200 so client shows the message instead of "network error"
        return res.status(200).json({
            success: false,
            message: "Incorrect username or password"
        });
    }

    // ---- Success response ----
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

// ============================================
// /360/credit1234567 IMPLEMENTATION
// ============================================
function creditResponse(res, rawBody) {
    const body = rawBody || {};

    const operation  = body.operation  || "spd";
    const request_id = body.request_id || generateUUID();
    const cost       = body.cost       || 2;
    const now        = new Date();

    const response = {
        success: true,
        message: "OK",
        operation: operation,
        request_id: request_id,
        cost: cost,
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
        response.operation = "spd";
    } else if (operation === "mtk") {
        response.message = "MTK operation successful";
        response.operation = "mtk";
    } else if (operation === "meta_fix_blackscreen") {
        response.message = "Meta fix blackscreen operation successful";
        response.operation = "meta_fix_blackscreen";
        response.meta_status = "fixed";
        response.blackscreen_fix = "applied";
    } else {
        response.message = "Operation successful";
        response.operation = operation;
    }

    return res.status(200).json(response);
}

// ============================================
// /api/* — LOGIN & AUTH SYSTEM
// ============================================
const USERS = {
    "ibrahimnet@360": {
        id: "user_ibrahimnet_001",
        username: "ibrahimnet@360",
        email: "ibrahimnet@360",
        subscription: "pro",
        subscription_expires: "2099-01-01T00:00:00.000Z",
        credits: 100,
        is_admin: false
    }
};

const SESSIONS = {};
const HWIDS = {};

const OPERATIONS = [
    { id: "spd_patch",            device: "mtk",      cost_credits: 5, label: "SPD Patch (MTK)" },
    { id: "frp_unlock",           device: "qualcomm", cost_credits: 3, label: "FRP Unlock" },
    { id: "bootloader_unlock",    device: "mtk",      cost_credits: 8, label: "Bootloader Unlock" },
    { id: "meta_fix_blackscreen", device: "mtk",      cost_credits: 2, label: "Meta Fix Blackscreen" }
];

const SESSION_TTL_SECONDS = 18000;

function handleApi(path, req, res) {

    const body = req.body || {};

    // ---- POST /api/login ----
    if (path === "/api/login" && req.method === "POST") {
        const { username, password, hwid } = body;

        if (!username) {
            return res.status(400).json({ error: "Missing credentials" });
        }

        // Only ibrahimnet@360 is allowed
        if (String(username).toLowerCase() !== "ibrahimnet@360") {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        if (!password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = USERS["ibrahimnet@360"];
        const access_token  = makeToken(user.id, "access");
        const refresh_token = makeToken(user.id, "refresh");

        SESSIONS[access_token] = {
            user_id: user.id,
            expires_at: new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString()
        };

        if (hwid) {
            if (!HWIDS[user.id]) HWIDS[user.id] = {};
            if (!HWIDS[user.id][hwid]) HWIDS[user.id][hwid] = "dev_" + generateUUID();
        }

        return res.status(200).json({
            access_token,
            refresh_token,
            token_type: "Bearer",
            expires_in: SESSION_TTL_SECONDS,
            user
        });
    }

    // ---- GET /api/me ----
    if (path === "/api/me" && req.method === "GET") {
        const auth = requireAuth(req, res);
        if (!auth) return;
        const user = Object.values(USERS).find(u => u.id === auth.user_id);
        if (!user) return res.status(404).json({ error: "User not found" });
        return res.status(200).json(user);
    }

    // ---- POST /api/heartbeat ----
    if (path === "/api/heartbeat" && req.method === "POST") {
        const auth = requireAuth(req, res);
        if (!auth) return;

        const newExpiry = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
        SESSIONS[auth.token].expires_at = newExpiry;

        const clientVersion = req.headers["x-client-version"];
        const minVersion = "1.1.8";
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

    // ---- GET /api/operations ----
    if (path === "/api/operations" && req.method === "GET") {
        const auth = requireAuth(req, res);
        if (!auth) return;
        return res.status(200).json({ operations: OPERATIONS });
    }

    // ---- POST /api/check_op ----
    if (path === "/api/check_op" && req.method === "POST") {
        const auth = requireAuth(req, res);
        if (!auth) return;

        const { operation, device } = body;
        const op = OPERATIONS.find(o => o.id === operation);
        if (!op) {
            return res.status(400).json({ allowed: false, error: "Unknown operation" });
        }

        const user = Object.values(USERS).find(u => u.id === auth.user_id);
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

    // ---- POST /api/consume_op ----
    if (path === "/api/consume_op" && req.method === "POST") {
        const auth = requireAuth(req, res);
        if (!auth) return;

        const { operation, device, confirm } = body;
        if (!confirm) return res.status(400).json({ error: "Not confirmed" });

        const op = OPERATIONS.find(o => o.id === operation);
        if (!op) return res.status(400).json({ error: "Unknown operation" });

        const user = Object.values(USERS).find(u => u.id === auth.user_id);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (user.credits < op.cost_credits) {
            return res.status(402).json({
                error: `Credits insuffisants. Tu as ${user.credits}, il faut ${op.cost_credits}.`
            });
        }

        user.credits -= op.cost_credits;
        const transaction_id = "txn_" + generateUUID();

        return res.status(200).json({
            success: true,
            remaining_credits: user.credits,
            transaction_id
        });
    }

    // ---- POST /api/flag_hwid ----
    if (path === "/api/flag_hwid" && req.method === "POST") {
        const auth = requireAuth(req, res);
        if (!auth) return;

        const { hwid, device_name } = body;
        if (!hwid) return res.status(400).json({ error: "Missing hwid" });

        if (!HWIDS[auth.user_id]) HWIDS[auth.user_id] = {};
        if (!HWIDS[auth.user_id][hwid]) {
            HWIDS[auth.user_id][hwid] = "dev_" + generateUUID();
        }

        return res.status(200).json({
            registered: true,
            device_id: HWIDS[auth.user_id][hwid],
            device_name: device_name || "UNKNOWN"
        });
    }

    // ---- POST /api/logout ----
    if (path === "/api/logout" && req.method === "POST") {
        const auth = requireAuth(req, res);
        if (!auth) return res.status(200).json({ ok: true });
        delete SESSIONS[auth.token];
        return res.status(200).json({ ok: true });
    }

    // ---- POST /api/run_spd ----
    if (path === "/api/run_spd" && req.method === "POST") {
        const auth = requireAuth(req, res);
        if (!auth) return;

        const { prodnv } = body;
        if (!prodnv) return res.status(400).json({ error: "Missing prodnv" });

        const fakeHash = Buffer.from(String(prodnv)).toString("base64").slice(0, 16);
        return res.status(200).json({ success: true, patched: true, hash: fakeHash });
    }

    // ---- GET /api/get_algo ----
    if (path === "/api/get_algo" && req.method === "GET") {
        const auth = requireAuth(req, res);
        if (!auth) return;
        return res.status(200).json({
            algorithm: "aes-256-gcm",
            iv: "000000000000000000000000",
            version: 1
        });
    }

    // ---- /api/dwmapi ----
    if (path === "/api/dwmapi") {
        return res.status(501).json({ error: "Not implemented" });
    }

    return res.status(404).json({ error: "Not found" });
}

function requireAuth(req, res) {
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

// ============================================
// HELPERS
// ============================================
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function makeToken(user_id, kind) {
    return `${kind}_${user_id}_${generateUUID()}`;
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
