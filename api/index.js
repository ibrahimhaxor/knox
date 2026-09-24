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

        // Every date format the client could possibly parse
        const yyyy = expireDate.getUTCFullYear();
        const mm = String(expireDate.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(expireDate.getUTCDate()).padStart(2, "0");
        const hh = String(expireDate.getUTCHours()).padStart(2, "0");
        const mi = String(expireDate.getUTCMinutes()).padStart(2, "0");
        const ss = String(expireDate.getUTCSeconds()).padStart(2, "0");

        const expireDateOnly = `${yyyy}-${mm}-${dd}`;           // "2036-09-24"
        const expireDateSlash = `${yyyy}/${mm}/${dd}`;          // "2036/09/24"
        const expireDateDMY = `${dd}-${mm}-${yyyy}`;            // "24-09-2036"
        const expireDateDMYSlash = `${dd}/${mm}/${yyyy}`;       // "24/09/2036"
        const expireDateMDY = `${mm}-${dd}-${yyyy}`;            // "09-24-2036"
        const expireDateMDYSlash = `${mm}/${dd}/${yyyy}`;       // "09/24/2036"
        const expireStr = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;   // "2036-09-24 12:00:00"
        const expireISO = expireDate.toISOString();             // "2036-09-24T12:00:00.000Z"
        const expireRFC = expireDate.toUTCString();             // "Wed, 24 Sep 2036 12:00:00 GMT"
        const expireTimestamp = Math.floor(expireDate.getTime() / 1000);
        const expireTimestampMs = expireDate.getTime();

        // Days: computed multiple ways so any formula works
        const daysRemaining = Math.floor((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemainingRounded = Math.round((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemainingCeil = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Shared expiry block (every alias we can think of)
        const expiryBlock = {
            // Date-only (all common formats)
            expire_date: expireDateOnly,
            expiry_date: expireDateOnly,
            expiration_date: expireDateOnly,
            expire_date_iso: expireISO,
            expire_date_slash: expireDateSlash,
            expire_date_dmy: expireDateDMY,
            expire_date_dmy_slash: expireDateDMYSlash,
            expire_date_mdy: expireDateMDY,
            expire_date_mdy_slash: expireDateMDYSlash,
            expire_date_formatted: expireDateOnly,

            // Full datetime
            expire_at: expireStr,
            expired_at: expireStr,
            expire_datetime: expireStr,
            license_expiry: expireStr,
            license_expire_date: expireStr,
            license_expiration: expireStr,
            valid_until: expireStr,
            valid_to: expireStr,

            // ISO / RFC
            expire_iso: expireISO,
            expiry_iso: expireISO,
            expire_rfc: expireRFC,

            // Unix timestamps
            expire_timestamp: expireTimestamp,
            expire_ts: expireTimestamp,
            expiry_timestamp: expireTimestamp,
            expiration_timestamp: expireTimestamp,
            expire_unix: expireTimestamp,
            expire_timestamp_ms: expireTimestampMs,
            expire_ms: expireTimestampMs,

            // Days (every alias + every rounding)
            days_remaining: daysRemaining,
            days_left: daysRemaining,
            remaining_days: daysRemaining,
            days: daysRemaining,
            expire_days: daysRemaining,
            license_days: daysRemaining,
            days_until_expiry: daysRemaining,
            days_to_expire: daysRemaining,
            subscription_days: daysRemaining,
            validity_days: daysRemaining,
            valid_days: daysRemaining,
            expiry_days: daysRemaining,
            period_remaining: daysRemaining,
            days_remaining_rounded: daysRemainingRounded,
            days_remaining_ceil: daysRemainingCeil,

            // Status flags
            is_expired: false,
            expired: false,
            is_valid: true,
            valid: true,
            active: true,
            status: "active",
            account_status: "active",
            license_status: "active",
            subscription_status: "active"
        };

        const nestedBlocks = {
            subscription: {
                days_remaining: daysRemaining,
                days_left: daysRemaining,
                remaining_days: daysRemaining,
                expire_date: expireDateOnly,
                expire_timestamp: expireTimestamp,
                active: true,
                is_active: true,
                status: "active",
                valid: true,
                is_expired: false
            },
            license: {
                days_remaining: daysRemaining,
                days_left: daysRemaining,
                remaining_days: daysRemaining,
                expire_date: expireDateOnly,
                expire_timestamp: expireTimestamp,
                valid: true,
                is_valid: true,
                status: "active",
                active: true,
                is_expired: false
            },
            expiry: {
                days_remaining: daysRemaining,
                days_left: daysRemaining,
                remaining_days: daysRemaining,
                expire_date: expireDateOnly,
                expire_timestamp: expireTimestamp,
                is_expired: false,
                expired: false
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
