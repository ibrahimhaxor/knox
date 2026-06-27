// api/index.js - Universal handler for ALL applications
export default async function handler(req, res) {
    // Enable CORS for all requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Log request for debugging
    console.log('📥 Method:', req.method);
    console.log('📍 URL:', req.url);
    console.log('📦 Body:', req.body || 'N/A');
    console.log('🔍 Query:', req.query || 'N/A');

    // =============================================
    // EXTRACT DATA FROM ALL SOURCES
    // =============================================
    let email = '';
    let password = '';
    let action = '';
    let username = '';
    let token = '';
    
    // Get from body (POST, PUT, PATCH)
    if (req.body) {
        email = req.body.email || req.body.Email || req.body.EMAIL || '';
        password = req.body.password || req.body.Password || req.body.PASSWORD || '';
        action = req.body.action || req.body.Action || req.body.ACTION || '';
        username = req.body.username || req.body.Username || req.body.USERNAME || '';
        token = req.body.token || req.body.Token || req.body.TOKEN || '';
    }
    
    // Get from query parameters (GET, DELETE)
    if (req.query) {
        email = email || req.query.email || req.query.Email || req.query.EMAIL || '';
        password = password || req.query.password || req.query.Password || req.query.PASSWORD || '';
        action = action || req.query.action || req.query.Action || req.query.ACTION || '';
        username = username || req.query.username || req.query.Username || req.query.USERNAME || '';
        token = token || req.query.token || req.query.Token || req.query.TOKEN || '';
    }

    // Get from headers
    const authHeader = req.headers.authorization || '';
    const contentType = req.headers['content-type'] || '';
    const userAgent = req.headers['user-agent'] || '';

    // =============================================
    // DETECT REQUEST TYPE
    // =============================================
    const url = req.url || '';
    const method = req.method || '';

    // Check what the request is asking for
    const isLogin = /login|signin|auth|authenticate/i.test(url) || 
                    /login|signin|auth|authenticate/i.test(action) ||
                    (email && password) || (username && password);

    const isRegister = /register|signup|create/i.test(url) || 
                       /register|signup|create/i.test(action);

    const isLogout = /logout|signout/i.test(url) || 
                     /logout|signout/i.test(action);

    const isProfile = /profile|user|me|account/i.test(url) || 
                      /profile|user|me|account/i.test(action);

    const isData = /data|info|details|get/i.test(url) || 
                   /data|info|details|get/i.test(action);

    const isUpdate = /update|edit|change|modify/i.test(url) || 
                     /update|edit|change|modify/i.test(action);

    const isDelete = /delete|remove/i.test(url) || 
                     /delete|remove/i.test(action);

    const isList = /list|all|items|collection/i.test(url) || 
                   /list|all|items|collection/i.test(action);

    const isUpload = /upload|file|image|media/i.test(url) || 
                     /upload|file|image|media/i.test(action);

    const isDownload = /download|getfile|stream/i.test(url) || 
                       /download|getfile|stream/i.test(action);

    const isSearch = /search|find|query/i.test(url) || 
                     /search|find|query/i.test(action);

    const isHealth = /health|status|ping|alive/i.test(url) || 
                     /health|status|ping|alive/i.test(action);

    const isVersion = /version|check|update|latest/i.test(url) || 
                      /version|check|update|latest/i.test(action);

    const isConfig = /config|settings|preferences/i.test(url) || 
                     /config|settings|preferences/i.test(action);

    const isPayment = /payment|pay|checkout|subscribe/i.test(url) || 
                      /payment|pay|checkout|subscribe/i.test(action);

    const isNotification = /notify|notification|alert/i.test(url) || 
                           /notify|notification|alert/i.test(action);

    // =============================================
    // GENERIC SUCCESS RESPONSES BY TYPE
    // =============================================

    // 1. LOGIN / AUTHENTICATION
    if (isLogin) {
        return res.status(200).json({
            success: true,
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    id: 1,
                    email: email || username || 'user@example.com',
                    username: username || email || 'user',
                    name: 'User',
                    created_at: new Date().toISOString()
                },
                token: 'bearer_token_' + Date.now(),
                expires_in: 86400
            }
        });
    }

    // 2. REGISTER / SIGNUP
    if (isRegister) {
        return res.status(201).json({
            success: true,
            status: 'success',
            message: 'Registration successful',
            data: {
                user: {
                    id: 1,
                    email: email || username || 'user@example.com',
                    username: username || 'user',
                    created_at: new Date().toISOString()
                },
                token: 'bearer_token_' + Date.now()
            }
        });
    }

    // 3. LOGOUT
    if (isLogout) {
        return res.status(200).json({
            success: true,
            status: 'success',
            message: 'Logout successful'
        });
    }

    // 4. GET PROFILE / USER DATA
    if (isProfile) {
        return res.status(200).json({
            success: true,
            status: 'success',
            data: {
                id: 1,
                email: email || 'user@example.com',
                username: username || 'user',
                name: 'User',
                role: 'user',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                settings: {
                    theme: 'dark',
                    notifications: true
                }
            }
        });
    }

    // 5. GET DATA / INFO
    if (isData) {
        return res.status(200).json({
            success: true,
            status: 'success',
            data: {
                items: [],
                total: 0,
                page: 1,
                limit: 10,
                message: 'Data retrieved successfully'
            }
        });
    }

    // 6. UPDATE / MODIFY
    if (isUpdate) {
        return res.status(200).json({
            success: true,
            status: 'success',
            message: 'Update successful',
            data: {
                updated: true,
                timestamp: new Date().toISOString()
            }
        });
    }

    // 7. DELETE / REMOVE
    if (isDelete) {
        return res.status(200).json({
            success: true,
            status: 'success',
            message: 'Deletion successful',
            data: {
                deleted: true,
                timestamp: new Date().toISOString()
            }
        });
    }

    // 8. LIST / COLLECTION
    if (isList) {
        return res.status(200).json({
            success: true,
            status: 'success',
            data: {
                items: [],
                total: 0,
                page: 1,
                limit: 10,
                total_pages: 0
            }
        });
    }

    // 9. UPLOAD
    if (isUpload) {
        return res.status(200).json({
            success: true,
            status: 'success',
            message: 'Upload successful',
            data: {
                file_id: 'file_' + Date.now(),
                url: 'https://example.com/files/' + Date.now(),
                size: 1024,
                type: 'image/png'
            }
        });
    }

    // 10. DOWNLOAD
    if (isDownload) {
        return res.status(200).json({
            success: true,
            status: 'success',
            data: {
                url: 'https://example.com/downloads/' + Date.now(),
                filename: 'file_' + Date.now() + '.txt',
                size: 1024
            }
        });
    }

    // 11. SEARCH
    if (isSearch) {
        return res.status(200).json({
            success: true,
            status: 'success',
            data: {
                results: [],
                total: 0,
                query: req.query.q || '',
                took: 0.1
            }
        });
    }

    // 12. HEALTH / STATUS
    if (isHealth) {
        return res.status(200).json({
            status: 'healthy',
            message: 'Server is running',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: '1.0.0'
        });
    }

    // 13. VERSION / UPDATE CHECK
    if (isVersion) {
        return res.status(200).json({
            status: 'success',
            data: {
                version: '1.0.0',
                latest: '1.0.0',
                update_available: false,
                release_date: new Date().toISOString(),
                changelog: 'Initial release'
            }
        });
    }

    // 14. CONFIG / SETTINGS
    if (isConfig) {
        return res.status(200).json({
            success: true,
            status: 'success',
            data: {
                settings: {
                    theme: 'dark',
                    language: 'en',
                    notifications: true,
                    privacy: 'public'
                }
            }
        });
    }

    // 15. PAYMENT
    if (isPayment) {
        return res.status(200).json({
            success: true,
            status: 'success',
            message: 'Payment processed',
            data: {
                transaction_id: 'txn_' + Date.now(),
                amount: 0,
                currency: 'USD',
                status: 'completed'
            }
        });
    }

    // 16. NOTIFICATION
    if (isNotification) {
        return res.status(200).json({
            success: true,
            status: 'success',
            message: 'Notification sent',
            data: {
                id: 'notif_' + Date.now(),
                read: false,
                timestamp: new Date().toISOString()
            }
        });
    }

    // =============================================
    // DEFAULT UNIVERSAL RESPONSE
    // Catches ANY request not handled above
    // =============================================
    return res.status(200).json({
        success: true,
        status: 'success',
        message: 'Request processed successfully',
        data: {
            method: method,
            url: url,
            action: action || 'default',
            email: email || null,
            username: username || null,
            timestamp: new Date().toISOString()
        }
    });
      }
