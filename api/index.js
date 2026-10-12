import { createHash, timingSafeEqual, createDecipheriv, createHmac } from "crypto";

const ALLOWED = "ibrahimnet@360";

function b64key() {
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
    const d = createDecipheriv("aes-256-gcm", key, iv);
    d.setAuthTag(tag);
    return d.update(data, null, "utf8") + d.final("utf8");
}

function decryptFernet(enc, key) {
    const raw = Buffer.from(enc, "base64");
    if (raw.length < 57 || raw[0] !== 0x80) return null;
    const body = raw.subarray(0, raw.length - 32);
    const mac = raw.subarray(raw.length - 32);
    const good = createHmac("sha256", key.subarray(0, 16)).update(body).digest();
    if (good.length !== mac.length || !timingSafeEqual(good, mac)) return null;
    const d = createDecipheriv("aes-128-cbc", key.subarray(16, 32), raw.subarray(9, 25));
    return d.update(raw.subarray(25, raw.length - 32), null, "utf8") + d.final("utf8");
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

async function readBody(req) {
    if (req.body !== undefined) return req.body;
    try {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const raw = Buffer.concat(chunks).toString("utf8");
        try { return JSON.parse(raw); } catch { return raw; }
    } catch { return {}; }
}

function loginShape(o) {
    return {
        success: false,
        message: "Invalid username or password",
        operation: "login",
        request_id: o.request_id || generateUUID(),
        cost: 0,
        credits_used: 0,
        credits_left: 0,
        balance: 0,
        confirmed_balance: 0,
        new_balance: 0,
        credits: 0,
        license_expiry: "2099-01-01 00:00:00",
        lock_expiry: "2099-01-01 00:00:00",
        server_time_utc: o.now,
        server_time: o.time,
        server_time_offset: 0,
        auth_check_interval: 3600,
        login_time: o.time,
        username: o.username || "",
        hwid: o.hwid || "",
        machine_id: o.machine_id || "unknown-machine-id",
    };
}

export default async function handler(req, res) {
    try {
        const path = String(req.url || "").split("?")[0];

        console.log("METHOD:", req.method);
        console.log("PATH:", path);

        // GET /360/version
        if (path === "/360/version" && req.method === "GET") {
            return res.status(200).json({
                version: "1.1.8",
                url: "https://www.mediafire.com/file/rqr0wr8uc4zq0op/360-tool-v1.2.1_fixed.zip/file"
            });
        }

        // /360/credit1234567 (unchanged)
        if (path === "/360/credit1234567" && (req.method === "GET" || req.method === "POST")) {
            const bb = await readBody(req);
            const bbb = (bb && typeof bb === "object") ? bb : {};
            const operation = bbb.operation || "spd";
            const request_id = bbb.request_id || generateUUID();
            const cost = bbb.cost || 2;
            const now = new Date();
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

        // GET /360/login12 (legacy)
        if (path === "/360/login12" && req.method === "GET") {
            return res.status(200).send("SUCCESS|732|2028-06-08");
        }

        // POST /360/login12
        if (path === "/360/login12" && req.method === "POST") {
            let b = await readBody(req);
            console.log("BODY:", b);
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
            const ctx = {
                request_id: b.request_id, now: now.toISOString(), time,
                username, hwid, machine_id: b.machine_id,
            };
            if (!username) {
                return res.status(200).json({ ...loginShape(ctx), message: "Missing credentials" });
            }
            if (String(username).trim().toLowerCase() !== ALLOWED) {
                return res.status(200).json(loginShape(ctx));
            }
            return res.status(200).json({
                ...loginShape(ctx),
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

        // ---- existing fallbacks ----
        let action = "";
        try {
            const bb = await readBody(req);
            if (bb && bb.action) action = bb.action;
        } catch {}
        if (action === "get_patch_algorithms" || req.url.includes("algorithms")) {
            return res.status(200).json({ status: "SUCCESS", algorithms: [] });
        }
        if (action === "get_secure_logic" || req.url.includes("secure")) {
            return res.status(200).json({ status: "SUCCESS", data: "License valid" });
        }
        if (req.url.includes("check_update")) {
            return res.status(200).send("0.7.93");
        }
        return res.status(200).send("SUCCESS|732|2028-06-08");
    } catch (e) {
        console.error("HANDLER-ERROR:", e && e.stack ? e.stack : e);
        try {
            return res.status(200).json({ success: false, message: "Server error", operation: "login" });
        } catch {
            try { res.statusCode = 200; res.end('{"success":false,"message":"Server error"}'); }
            catch {}
            return;
        }
    }
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
