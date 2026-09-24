export default function handler(req, res) {

    const rawPath = req.url.split("?")[0];
    const query = req.query || {};
    const endpoint = query.endpoint || "";

    // Normalize: treat /smarttool-api/index1.php as /smarttool-api/
    let path = rawPath;
    if (rawPath === "/smarttool-api/index1.php") {
        path = "/smarttool-api/";
    }

    console.log("METHOD:", req.method);
    console.log("RAW PATH:", rawPath);
    console.log("NORMALIZED PATH:", path);
    console.log("ENDPOINT:", endpoint);
    console.log("BODY:", req.body);

    // Helper: is this a SMARTTOOL request? (either prefix)
    const isSmarttool =
        rawPath === "/smarttool-api/" ||
        rawPath === "/smarttool-api/index1.php" ||
        rawPath.startsWith("/smarttool-api/") ||
        rawPath.startsWith("/smarttool-api/index1.php");

    // ============================================
    // SMARTTOOL API ROUTES
    // ============================================

    // GET /smarttool-api/?endpoint=status
    if (isSmarttool && endpoint === "status" && req.method === "GET") {
        const now = new Date();
        return res.status(200).json({
            success: true,
            timestamp: Math.floor(now.getTime() / 1000),
            server: "knox-sigma.vercel.app",
            data: {
                status: "online",
                server_time: now.toISOString().replace("T", " ").substring(0, 19),
                server: "knox-sigma.vercel.app",
                database: "connected",
                version: "2.1",
                endpoints: [
                    "/smarttool-api/?endpoint=status",
                    "/smarttool-api/?endpoint=validate",
                    "/smarttool-api/?endpoint=login",
                    "/smarttool-api/?endpoint=system_update",
                    "/smarttool-api/?endpoint=check_binding",
                    "/smarttool-api/?endpoint=create_binding",
                    "/smarttool-api/?endpoint=log_activity",
                    "/smarttool-api/?endpoint=stats",
                    "/smarttool-api/?endpoint=get-licenses",
                    "/smarttool-api/?endpoint=create-license",
                    "/smarttool-api/?endpoint=get_user_info",
                    "/smarttool-api/?endpoint=get_user_profile",
                    "/smarttool-api/?endpoint=get_user_credits",
                    "/smarttool-api/index1.php?endpoint=get_user_info",
                    "/smarttool-api/index1.php?endpoint=status",
                    "/smarttool-api/index1.php?endpoint=login",
                    "/smarttool-api/index1.php?endpoint=system_update"
                ]
            }
        });
    }

    // POST /smarttool-api/?endpoint=system_update
    if (isSmarttool && endpoint === "system_update" && req.method === "POST") {
        const now = new Date();
        const clientVersion = req.body?.client_version || "26.5.0";
        const latestVersion = "26.5.0";
        const minVersion = "26.5.0";
        const updateRequired = clientVersion < minVersion;

        return res.status(200).json({
            success: true,
            timestamp: Math.floor(now.getTime() / 1000),
            server: "knox-sigma.vercel.app",
            data: {
                update_required: updateRequired,
                blocking_update: false,
                min_version_required: minVersion,
                latest_version: latestVersion,
                update_urgency: "critical",
                maintenance_mode: false,
                message: "🔥Smarttool v26.5.0🔥\r\n\r\nDIAG MODE ADDED READ AND WRITE and UNLOCK BL VIA DIAG\r\n GOOD DAY\r\n\r\n",
                update_url: "https://knox-sigma.vercel.app/update.php",
                block_old_versions: true,
                client_version: clientVersion,
                server_checked: true,
                explanation: updateRequired
                    ? `Your version (v${clientVersion}) is below the minimum requirement (v${minVersion}).`
                    : `Your version (v${clientVersion}) meets the minimum requirement (v${minVersion}).`
            }
        });
    }

    // POST /smarttool-api/?endpoint=login
    if (isSmarttool && endpoint === "login" && req.method === "POST") {
        const now = new Date();
        const username = req.body?.username || "unknown";
        const fingerprint = generateUUID().replace(/-/g, "");

        return res.status(200).json({
            success: true,
            timestamp: Math.floor(now.getTime() / 1000),
            server: "smarttool.top",
            data: {
                user_id: "12345",
                username: username,
                email: `${username}@smarttool.top`,
                user_type: "premium",
                session_token: `sess_${generateUUID().replace(/-/g, "")}`,
                credits: 280,
                balance: 280,
                expire_date: "2027-12-31",
                days_remaining: 365,
                computer_fingerprint: fingerprint,
                binding_allowed: true
            }
        });
    }

    // POST /smarttool-api/?endpoint=check_binding
    if (isSmarttool && endpoint === "check_binding" && req.method === "POST") {
        return res.status(200).json({
            success: true,
            timestamp: Math.floor(Date.now() / 1000),
            server: "knox-sigma.vercel.app",
            data: {
                binding_allowed: true,
                can_login: true,
                requires_binding: false,
                fingerprint: req.body?.computer_fingerprint || generateUUID().replace(/-/g, "")
            }
        });
    }

    // POST /smarttool-api/?endpoint=create_binding
    if (isSmarttool && endpoint === "create_binding" && req.method === "POST") {
        const now = new Date();
        return res.status(200).json({
            success: true,
            timestamp: Math.floor(now.getTime() / 1000),
            server: "knox-sigma.vercel.app",
            data: {
                binding_created: true,
                fingerprint: req.body?.computer_fingerprint || generateUUID().replace(/-/g, ""),
                bound_at: now.toISOString().replace("T", " ").substring(0, 19)
            }
        });
    }

    // POST /smarttool-api/?endpoint=validate
    if (isSmarttool && endpoint === "validate" && req.method === "POST") {
        return res.status(200).json({
            success: true,
            timestamp: Math.floor(Date.now() / 1000),
            server: "knox-sigma.vercel.app",
            data: {
                valid: true,
                license_valid: true,
                message: "License valid"
            }
        });
    }

    // POST /smarttool-api/?endpoint=log_activity
    if (isSmarttool && endpoint === "log_activity" && req.method === "POST") {
        return res.status(200).json({
            success: true,
            timestamp: Math.floor(Date.now() / 1000),
            server: "knox-sigma.vercel.app",
            data: {
                logged: true
            }
        });
    }

    // POST /smarttool-api/?endpoint=create-license
    if (isSmarttool && endpoint === "create-license" && req.method === "POST") {
        return res.status(200).json({
            success: true,
            timestamp: Math.floor(Date.now() / 1000),
            server: "knox-sigma.vercel.app",
            data: {
                license_created: true,
                license_key: generateUUID().toUpperCase(),
                expire_date: "2027-12-31"
            }
        });
    }

    // ============================================
    // GET /smarttool-api/index1.php?endpoint=get_user_info&username=
    // (and also /smarttool-api/?endpoint=get_user_info | get_user_profile | get-licenses)
    // ============================================
    if (
        isSmarttool &&
        (endpoint === "get_user_info" || endpoint === "get_user_profile" || endpoint === "get-licenses") &&
        req.method === "GET"
    ) {
        const username = query.username || "ibrahimnet";
        return res.status(200).json({
            success: true,
            data: {
                user_id: "1337",
                username: username,
                email: `${username}@smarttool.top`,
                user_type: "user",
                credits: 185,
                balance: 185,
                expire_date: "2030-12-31",
                days_remaining: 999
            }
        });
    }

    // GET /smarttool-api/?endpoint=stats | get_user_credits
    if (
        isSmarttool &&
        (endpoint === "stats" || endpoint === "get_user_credits") &&
        req.method === "GET"
    ) {
        return res.status(200).json({
            success: true,
            timestamp: Math.floor(Date.now() / 1000),
            server: "knox-sigma.vercel.app",
            data: {
                credits: 185,
                balance: 185
            }
        });
    }

    // ============================================
    // SMARTTOOL CATCH-ALL FALLBACK (must be AFTER all specific smarttool endpoints)
    // ============================================
    if (isSmarttool) {
        return res.status(200).json({
            success: true,
            timestamp: Math.floor(Date.now() / 1000),
            server: "knox-sigma.vercel.app",
            data: {
                credits: 185,
                balance: 185
            }
        });
    }

    // ============================================
    // /360/version
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

    // ============================================
    // /360/login12
    // ============================================
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

    // ============================================
    // /360/login13 (alias to login12)
    // ============================================
    if (path === "/360/login13" && req.method === "POST") {
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
    // LEGACY / GENERIC FALLBACKS
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
}

// ============================================
// HELPER FUNCTION
// ============================================
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
