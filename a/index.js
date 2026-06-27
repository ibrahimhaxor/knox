// Simple working Vercel function
module.exports = (req, res) => {
    res.json({ 
        status: 'success', 
        message: 'API is working',
        path: req.url,
        method: req.method
    });
};           theme: 'dark',
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
};
