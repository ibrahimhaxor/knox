export default function handler(req, res) {

    const path = req.url.split("?")[0];

    console.log("METHOD:", req.method);
    console.log("PATH:", path);


    // GET /360/v
    if (path === "/360/version" && req.method === "GET") {
        return res.status(200).json({
            version: "1.1.8",
            url: "https://www.mediafire.com/file/rqr0wr8uc4zq0op/360-tool-v1.2.1_fixed.zip/file"
        });
    }
// /360/credit1234567
if (
    path === "/360/credit1234567" &&
    (req.method === "GET" || req.method === "POST")
) {
    return res.status(200).json({
     "success": true,
  "message": "OK",
  "operation": "spd",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "cost": 2,
  "credits_used": 2,
  "credits_left": 248,
  "balance": 248,
  "confirmed_balance": 248,
  "new_balance": 248,
  "credits": 248,
  "license_expiry": "2099-01-01 00:00:00",
  "lock_expiry": "2099-01-01 00:00:00",
  "server_time_utc": "2026-08-10T12:00:00+00:00",
  "server_time": "2026-08-10 12:00:00",
  "auth_check_interval": 3600,
  "server_time_offset": 0,
  "login_time": "2026-08-10 12:00:00"
    });
}

    // POST /360/l
    if (path === "/360/login12" && req.method === "POST") {

        const now = new Date();
        const time = now.toISOString()
            .replace("T", " ")
            .substring(0, 19);

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
