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
    // SHARED PAYLOAD BUILDER
    // All expiry aliases + credits + balance + nested user object
    // ============================================
    function buildUserPayload(username, userId, userType) {
        const credits = 280;
        const balance = 280;

        // Real future expiry (10 years from now)
        const now = new Date();
        const expireDate = new Date(now.getTime());
        expireDate.setFullYear(expireDate.getFullYear() + 10);
        const expireDateOnly = expireDate.toISOString().substring(0, 10);
        const expireStr = expireDate.toISOString().replace("T", " ").substring(0, 19);
        const expireISO = expireDate.toISOString();
        const expireTimestamp = Math.floor(expireDate.getTime() / 1000);
        const daysRemaining = Math.floor((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Shared expiry block (every alias we can think of)
        const expiryBlock = {
            expire_date: expireDateOnly,
            expiry_date: expireDateOnly,
            expiration_date: expireDateOnly,
            expire_at: expireStr,
            expired_at: expireStr,
            expire_iso: expireISO,
            expiry_iso: expireISO,
            license_expiry: expireStr,
            license_expire_date: expireStr,
            license_expiration: expireStr,
            expire_timestamp: expireTimestamp,
            expire_ts: expireTimestamp,
            expiry_timestamp: expireTimestamp,
            expiration_timestamp: expireTimestamp,
            expire_days: daysRemaining,
            license_days: daysRemaining,
            days_until_expiry: daysRemaining,
            days_to_expire: daysRemaining,
            subscription_days: daysRemaining,
            validity_days: daysRemaining,
            valid_days: daysRemaining,
            expiry_days: daysRemaining,
            period_remaining: daysRemaining,
            days_remaining: daysRemaining,
            days_left: daysRemaining,
            remaining_days: daysRemaining,
            days: daysRemaining
        };

        const nestedBlocks = {
            subscription: {
                days_remaining: daysRemaining,
                days_left: daysRemaining,
                remaining_days: daysRemaining,
                expire_date: expireDateOnly,
                expire_timestamp: expireTimestamp,
                active: true,
                status: "active",
                valid: true
            },
            license: {
                days_remaining: daysRemaining,
                days_left: daysRemaining,
                remaining_days: daysRemaining,
                expire_date: expireDateOnly,
                expire_timestamp: expireTimestamp,
                valid: true,
                status: "active",
                active: true
            }
        };

        return {
            // Identity
            user_id: userId,
            id: userId,
            username: username,
            email: `${username}@smarttool.top`,
            user_type: userType,

            // Credits / balance
            credits: credits,
            balance: balance,
            confirmed_balance: balance,
            new_balance: balance,
            credits_left: credits,
            credits_used: 0,

            // Expiry (all aliases)
            ...expiryBlock,

            // Nested blocks
            ...nestedBlocks,

            // Nested user object (for current_user.json)
            user: {
                id: userId,
                user_id: userId,
                username: username,
                email: `${username}@smarttool.top`,
                user_type: userType,
                credits: credits,
                balance: balance,
                ...expiryBlock,
                ...nestedBlocks
            }
        };
    }

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

    // ============================================
    // POST /smarttool-api/?endpoint=login
    // ============================================
    if (isSmarttool && endpoint === "login" && req.method === "POST") {
        const now = new Date();
        const username = req.body?.username || "unknown";
        const sessionToken = `sess_${generateUUID().replace(/-/g, "")}`;
        const userId = "12345";
        const fingerprint = generateUUID().replace(/-/g, "");

        const payload = buildUserPayload(username, userId, "premium");

        return res.status(200).json({
            success: true,
            timestamp: Math.floor(now.getTime() / 1000),
            server: "smarttool.top",
            data: {
                ...payload,
                session_token: sessionToken,
                computer_fingerprint: fingerprint,
                binding_allowed: true
            }
        });
    }

    // ============================================
    // POST /smarttool-api/?endpoint=check_binding
    // ============================================
    if (isSmarttool && endpoint === "check_binding" && req.method === "POST") {
        const userId =
            req.body?.user_id ||
            req.body?.user?.id ||
            req.body?.user?.user_id ||
            "12345";
        const username =
            req.body?.username ||
            req.body?.user?.username ||
            "ibrahim";
        const fingerprint =
            req.body?.computer_fingerprint ||
            generateUUID().replace(/-/g, "");

        const payload = buildUserPayload(username, userId, "premium");

        return res.status(200).json({
            success: true,
            timestamp: Math.floor(Date.now() / 1000),
            server: "knox-sigma.vercel.app",
            data: {
                ...payload,
                binding_allowed: true,
                can_login: true,
                requires_binding: false,
                fingerprint: fingerprint
            }
        });
    }

    // POST /smarttool-api/?endpoint=create_binding
    if (isSmarttool && endpoint === "create_binding" && req.method === "POST") {
        const now = new Date();
        const userId =
            req.body?.user_id ||
            req.body?.user?.id ||
            "12345";
        const username =
            req.body?.username ||
            req.body?.user?.username ||
            "ibrahim";
        const fingerprint =
            req.body?.computer_fingerprint ||
            generateUUID().replace(/-/g, "");

        const payload = buildUserPayload(username, userId, "premium");

        return res.status(200).json({
            success: true,
            timestamp: Math.floor(now.getTime() / 1000),
            server: "knox-sigma.vercel.app",
            data: {
                ...payload,
                binding_created: true,
                fingerprint: fingerprint,
                bound_at: now.toISOString().replace("T", " ").substring(0, 19)
            }
        });
    }

    // POST /smarttool-api/?endpoint=validate
    if (isSmarttool && endpoint === "validate" && req.method === "POST") {
        const username = req.body?.username || "ibrahim";
        const userId = req.body?.user_id || "12345";
        const payload = buildUserPayload(username, userId, "premium");

        return res.status(200).json({
            success: true,
            timestamp: Math.floor(Date.now() / 1000),
            server: "knox-sigma.vercel.app",
            data: {
                ...payload,
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
        const username = req.body?.username || "ibrahim";
        const userId = req.body?.user_id || "12345";
        const payload = buildUserPayload(username, userId, "premium");

        return res.status(200).json({
            success: true,
            timestamp: Math.floor(Date.now() / 1000),
            server: "knox-sigma.vercel.app",
            data: {
                ...payload,
                license_created: true,
                license_key: generateUUID().toUpperCase()
            }
        });
    }

    // ============================================
    // GET /smarttool-api/index1.php?endpoint=get_user_info&username=
    // ============================================
    if (
        isSmarttool &&
        (endpoint === "get_user_info" || endpoint === "get_user_profile" || endpoint === "get-licenses") &&
        req.method === "GET"
    ) {
        const username = query.username || "ibrahimnet";
        const userId = "1337";
        const payload = buildUserPayload(username, userId, "user");

        return res.status(200).json({
            success: true,
            data: payload
        });
    }

    // GET /smarttool-api/?endpoint=stats | get_user_credits
    if (
        isSmarttool &&
        (endpoint === "stats" || endpoint === "get_user_credits") &&
        req.method === "GET"
    ) {
        const username = query.username || "ibrahim";
        const userId = "12345";
        const payload = buildUserPayload(username, userId, "premium");

        return res.status(200).json({
            success: true,
            timestamp: Math.floor(Date.now() / 1000),
            server: "knox-sigma.vercel.app",
            data: payload
        });
    }

    // ============================================
    // SMARTTOOL CATCH-ALL FALLBACK
    // ============================================
    if (isSmarttool) {
        const username = query.username || "ibrahim";
        const userId = "12345";
        const payload = buildUserPayload(username, userId, "premium");

        return res.status(200).json({
            success: true,
            timestamp: Math.floor(Date.now() / 1000),
            server: "knox-sigma.vercel.app",
            data: payload
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
