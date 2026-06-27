
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

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: 'error',
      message: 'Method not allowed'
    });
  }

  const { email, password } = req.body;

  // Basic validation - just check if fields exist
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
      // You can add any other user data here
    }
  });
}
