// api/login.js
export default async function handler(req, res) {
  // Enable CORS for your app
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Allow both GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      status: 'error',
      message: 'Method not allowed. Use GET or POST.'
    });
  }

  // Get credentials from query (GET) or body (POST)
  let email, password;
  
  if (req.method === 'GET') {
    // For GET requests, get from query parameters
    email = req.query.email;
    password = req.query.password;
  } else {
    // For POST requests, get from body
    email = req.body.email;
    password = req.body.password;
  }

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Please enter both Email and Password.'
    });
  }

  // =============================================
  // SUCCESSFUL LOGIN FOR ANY CREDENTIALS
  // Always returns success regardless of email/password
  // =============================================
  return res.status(200).json({
    success: true,
    message: 'Access Granted!',
    status: 'active',
    user: {
      email: email,
      name: 'User',
      // Add any other user data here
    }
  });
}
