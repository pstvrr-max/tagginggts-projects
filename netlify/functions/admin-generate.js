const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const secretFromUrl = params.secret;

  // 🔎 DEBUG: show what Netlify actually sees
  if (params.debug === "1") {
    return {
      statusCode: 200,
      body: JSON.stringify({
        urlSecret: secretFromUrl || null,
        envSecret: process.env.ADMIN_SECRET || null,
        supabaseUrlExists: !!process.env.SUPABASE_URL,
        serviceRoleExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }, null, 2)
    };
  }

  // 🔐 Admin protection
  if (!secretFromUrl || secretFromUrl !== process.env.ADMIN_SECRET) {
    return {
      statusCode: 403,
      body: "Forbidden"
    };
  }

  // Safety checks
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      statusCode: 500,
      body: "Missing Supabase environment variables"
    };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const days = parseInt(params.days || "7", 10);
  const key = "TGTS-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const expiresAt = new Date(Date.now() + days * 86400000).toISOString();

  const { error } = await supabase.from("keys").insert({
    key,
    duration_days: days,
    redeemed: false,
    expires_at: expiresAt
  });

  if (error) {
    return {
      statusCode: 500,
      body: error.message
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ key, days }, null, 2)
  };
};
