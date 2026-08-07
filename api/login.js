export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  const now = new Date();
  const serverTime = now.toISOString()
    .replace("T", " ")
    .substring(0, 19);

  res.status(200).json({
    success: true,
    message: "Mock login successful!",
    server_time_utc: now.toISOString(),
    server_time: serverTime,
    server_time_offset: 0,
    auth_check_interval: 3600,
    lock_expiry: "2099-01-01 00:00:00",
    login_time: serverTime,
    license_expiry: "2099-01-01 00:00:00",
    credits: 999999
  });
}
