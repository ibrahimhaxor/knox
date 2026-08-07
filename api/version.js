export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  res.status(200).json({
    version: "1.1.8",
    url: "https://www.mediafire.com/file/rqr0wr8uc4zq0op/360-tool-v1.2.1_fixed.zip/file"
  });
}
