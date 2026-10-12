import * as crypto from "crypto";

const ALLOWED = "ibrahimnet@360";

function b64key() {
    // Vercel env AES_KEY_B64 (32-byte base64). No hardcoded secrets.
    const s = process.env.AES_KEY_B64 || "";
    try { const b = Buffer.from(s, "base64"); return b.length === 32 ? b : null; }
    catch { return null; }
}

function decryptGCM(enc, key) {
    const raw = Buffer.from(enc, "base64");
    if (raw.length < 29) return null;
    const iv = raw.subarray(0, 12);
    const data = raw.subarray(12, raw.length - 16);
    const tag = raw.subarray(raw.length - 16);
    const d = crypto.createDecipheriv("aes-256-gcm", key, iv);
    d.setAuthTag(tag);
    return d.update(data, null, "utf8") + d.final("utf8");
}

function decryptFernet(enc, key) {
    // Python Fernet: ver(0x80) + ts(8) + iv(16) + ct + hmac-sha256(32);
    // key = signing[0:16] + encryption[16:32]
    const raw = Buffer.from(enc, "base64");
    if (raw.length < 57 || raw[0] !== 0x80) return null;
    const body = raw.subarray(0, raw.length - 32);
    const mac = raw.subarray(raw.length - 32);
    const signing = key.subarray(0, 16), encK = key.subarray(16, 32);
    const good = crypto.createHmac("sha256", signing).update(body).digest();
    if (good.length !== mac.length || !crypto.timingSafeEqual(good, mac)) return null;
    const iv = raw.subarray(9, 25), ct = raw.subarray(25, raw.length - 32);
    const d = crypto.createDecipheriv("aes-128-cbc", encK, iv);
    return d.update(ct, null, "utf8") + d.final("utf8");
}

function decryptUser(enc) {
    try {
        if (!enc || typeof enc !== "string") return null;
        const key = b64key();
        if (!key) return null;
        try { return decryptGCM(enc, key); } catch {}
        return decryptFernet(enc, key);
    } catch { return null; }
}

export default function handler(req, res) {

    const path = req.url.split("?")[0];

    console.log("METHOD:", req.method);
    console.log("PATH:", path);
    console.log("BODY:", req.body);

    // GET /360/version
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

        // Get operation from request body
        const operation = req.body?.operation || 'spd';
        const request_id = req.body?.request_id || generateUUID();
        const cost = req.body?.cost || 2;
        const now = new Date();

        // Base response
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

        // ============================================
        // OPERATION ROUTING: SPD, MTK, META
        // ============================================
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
            // Default fallback for any other operation
            response.message = "Operation successful";
            response.operation = operation;
        }

        return res.status(200).json(response);
    }

    // GET /360/login12 (legacy)
    if (path === "/360/login12" && req.method === "GET") {
        return res.status(200).send("SUCCESS|732|2028-06-08");
    }

    // POST /360/login12 - validated, allowlist-only, always HTTP 200
    if (path === "/360/login12" && req.method === "POST") {
        let b = req.body;
        if (typeof b === "string") {
            try { b = JSON.parse(b); }
            catch { try { b = Object.fromEntries(new URLSearchParams(b)); } catch { b = {}; } }
        }
        if (Buffer.isBuffer(b)) {
            try { b = JSON.parse(b.toString("utf8")); } catch { b = {}; }
        }
        if (!b || typeof b !== "object") b = {};
        const q = req.query || {};
        const rawUser = b.username ?? b.user ?? q.username ?? "";
        const username = rawUser || decryptUser(b.username_enc || q.username_enc || "") || "";
        const hwid = b.hwid ?? b.machine_id ?? q.hwid ?? "";

        const now = new Date();
        const time = now.toISOString().replace("T", " ").substring(0, 19);
        const base = {
            success: false,
            message: "Invalid username or password",
            operation: "login",
            request_id: b.request_id || generateUUID(),
            cost: 0,
            credits_used: 0,
            credits_left: 0,
            balance: 0,
            confirmed_balance: 0,
            new_balance: 0,
            credits: 0,
            license_expiry: "2099-01-01 00:00:00",
            lock_expiry: "2099-01-01 00:00:00",
            server_time_utc: now.toISOString(),
            server_time: time,
            server_time_offset: 0,
            auth_check_interval: 3600,
            login_time: time,
            username: username,
            hwid: hwid,
            machine_id: b.machine_id || "unknown-machine-id",
        };

        if (!username) {
            return res.status(200).json({ ...base, message: "Missing credentials" });
        }
        if (String(username).trim().toLowerCase() !== ALLOWED) {
            return res.status(200).json(base);
        }
        return res.status(200).json({
            ...base,
            success: true,
            message: "Login successful!",
            credits_used: 0,
            credits_left: 250,
            balance: 250,
            confirmed_balance: 250,
            new_balance: 250,
            credits: 250,
            session: generateUUID(),
        });
    }

    // ---- YOUR EXISTING CODE BELOW ----

    let action = "";

    try {
        if (req.body && req.body.action) {
            action = req.body.action;
        }
    } catch(e) {}

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
}

// ============================================
// HELPER FUNCTION
// ============================================
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
