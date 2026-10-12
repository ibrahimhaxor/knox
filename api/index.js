import crypto from "crypto";

const AES_B64 = "PhkZ63IS9xWOQP5/nN0IXAUM4d0C8DfS2iM3U1GEMwQ=";
const ALLOWED = "ibrahimnet@360";

function decryptUser(enc) {
  try {
    if (!enc || typeof enc !== "string") return null;
    const raw = Buffer.from(enc, "base64");
    if (raw.length < 29) return null;
    const iv = raw.subarray(0, 12);
    const ct = raw.subarray(12);
    const tag = ct.subarray(ct.length - 16);
    const data = ct.subarray(0, ct.length - 16);
    const d = crypto.createDecipheriv("aes-256-gcm", Buffer.from(AES_B64, "base64"), iv);
    d.setAuthTag(tag);
    return d.update(data, null, "utf8") + d.final("utf8");
  } catch { return null; }
}
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random()*16|0; return (c==='x'?r:(r&0x3|0x8)).toString(16);
  });
}

export default function handler(req, res) {
  const path = (req.url || "").split("?")[0];
  console.log("METHOD:", req.method, "PATH:", path);

  if (path === "/360/version" && req.method === "GET") {
    return res.status(200).json({
      version: "1.1.8",
      url: "https://www.mediafire.com/file/rqr0wr8uc4zq0op/360-tool-v1.2.1_fixed.zip/file"
    });
  }

  if (path === "/360/credit1234567" && (req.method === "GET" || req.method === "POST")) {
    const operation = req.body?.operation || "spd";
    const request_id = req.body?.request_id || generateUUID();
    const cost = req.body?.cost || 2;
    const now = new Date();
    const t = now.toISOString().replace("T"," ").substring(0,19);
    const base = {
      success:true, message:"Operation successful", operation, request_id, cost,
      credits_used: cost, credits_left:248, balance:248, confirmed_balance:248,
      new_balance:248, credits:248, license_expiry:"2099-01-01 00:00:00",
      lock_expiry:"2099-01-01 00:00:00", server_time_utc:now.toISOString(),
      server_time:t, auth_check_interval:3600, server_time_offset:0, login_time:t
    };
    if (operation==="spd") base.message="SPD operation successful";
    else if (operation==="mtk") base.message="MTK operation successful";
    else if (operation==="meta_fix_blackscreen") {
      base.message="Meta fix blackscreen operation successful";
      base.meta_status="fixed"; base.blackscreen_fix="applied";
    }
    return res.status(200).json(base);
  }

  if ((path === "/360/login12" || path === "/360/login13") && req.method === "GET") {
    return res.status(200).send("SUCCESS|732|2028-06-08");
  }

  if ((path === "/360/login12" || path === "/360/login13") && req.method === "POST") {
    const b = req.body || {};
    const username = b.username || decryptUser(b.username_enc||"") || "";
    if (!b.username && !b.username_enc)
      return res.status(400).json({success:false,message:"Missing security parameters"});
    if (username !== ALLOWED)
      return res.status(403).json({success:false,message:"Incorrect password"});
    const now = new Date();
    const time = now.toISOString().replace("T"," ").substring(0,19);
    return res.status(200).json({
      success:true, message:"Login successful!", username,
      machine_id:b.machine_id||b.machine_id_enc||"unknown-machine-id",
      server_time_utc:now.toISOString(), server_time:time,
      server_time_offset:0, auth_check_interval:3600,
      lock_expiry:"2099-01-01 00:00:00", login_time:time,
      license_expiry:"2099-01-01 00:00:00",
      credits:250, credits_left:250, balance:250
    });
  }

  let action="";
  try { if (req.body?.action) action=req.body.action; } catch {}
  if (action==="get_patch_algorithms"||req.url.includes("algorithms"))
    return res.status(200).json({status:"SUCCESS",algorithms:[]});
  if (action==="get_secure_logic"||req.url.includes("secure"))
    return res.status(200).json({status:"SUCCESS",data:"License valid"});
  if (req.url.includes("check_update"))
    return res.status(200).send("0.7.93");

  return res.status(200).send("SUCCESS|732|2028-06-08");
}
