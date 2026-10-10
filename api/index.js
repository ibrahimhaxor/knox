export default function handler(req, res) {

    const path = req.url.split("?")[0];

    console.log("METHOD:", req.method);
    console.log("PATH:", path);
    console.log("BODY:", req.body);

    // GET /360/versions
    if (path === "/360/versions" && req.method === "GET") {
        return res.status(200).json({
            version: "2.1.4",
            url: "https://www.mediafire.com/file/31eh6p920josgel/360_TOOL_PRO_V1.2_bootloder_fixed.zip/file",
            response_signature: "MZs8CI7yWa+KjagsoN/Wvf8ZyzlgYMazmCfY8cbq6aIHPDkgr/rAyrWeKCdREUQlLs3gShRyMMFYOMLcYbwjcGr+hVIKBt2CqrlN4vxHJaM6/PpjDB4k0sVph7j1Ls7QK2ZsyQ6MP8DsCjh3Mczctrp62xm4FtkmCfLwagCtbFoGhwz6r1s2fBkP6p9r9cY09hM8W8JBfcPoZedq28k9es2F8IZps560h2Tw9jI5M67hx+uJKYnsyHVUqCNNbZtxXMHgmPo5ZlG5h2mMskpytURGU6F75u2pkhdM495brg/d/eWJm4wIX5A6/5wANCkdP2xDe8RkiXTDlSpnBSSK9g=="
        });
    }

    // ============================================
    // /360/credit1234567 - SPD, MTK, META_FIX_BLACKSCREEN
    // ============================================
    if (path === "/360/credit1234567" && (req.method === "GET" || req.method === "POST")) {

        const operation = req.body?.operation || 'spd';
        const request_id = req.body?.request_id || generateUUID();
        const cost = req.body?.cost || 2;
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

    // POST /login1
    if (path === "/login1" && req.method === "POST") {

        const now = new Date();
        const isoUtc = now.toISOString();                              // 2026-10-10T12:00:00.000Z
        const time = isoUtc.replace("T", " ").substring(0, 19);        // 2026-10-10 12:00:00

        return res.status(200).json({
            success: true,
            message: "✓ Login successful!",
            username: "ctf",
            server_time_utc: isoUtc,           // proper UTC ISO
            server_time: time,
            echo_nonce: "x",
            login_time: time,
            login_time_str: time,
            lock_expiry: "2099-01-01 00:00:00",
            lock_expiry_str: "2099-01-01 00:00:00",
            auth_check_interval: 999999,
            license_expiry: "2099-01-01 00:00:00",
            expiry_time: "2099-01-01 00:00:00",
            credits: 9999,
            user_credits: 9999,
            server_machine_id: "ANY",
            server_synced_now: time,
            server_time_offset: 0,
            response_signature: "MZs8CI7yWa+KjagsoN/Wvf8ZyzlgYMazmCfY8cbq6aIHPDkgr/rAyrWeKCdREUQlLs3gShRyMMFYOMLcYbwjcGr+hVIKBt2CqrlN4vxHJaM6/PpjDB4k0sVph7j1Ls7QK2ZsyQ6MP8DsCjh3Mczctrp62xm4FtkmCfLwagCtbFoGhwz6r1s2fBkP6p9r9cY09hM8W8JBfcPoZedq28k9es2F8IZps560h2Tw9jI5M67hx+uJKYnsyHVUqCNNbZtxXMHgmPo5ZlG5h2mMskpytURGU6F75u2pkhdM495brg/d/eWJm4wIX5A6/5wANCkdP2xDe8RkiXTDlSpnBSSK9g=="
        });
    }

    // ---- YOUR EXISTING CODE BELOW ----

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
