const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const cookie = event.headers.cookie || "";
  const match = cookie.match(/discord_id=([^;]+)/);
  if (!match) {
    return { statusCode: 401, body: "Not logged in" };
  }

  const { key } = JSON.parse(event.body || "{}");
  if (!key) {
    return { statusCode: 400, body: "Missing key" };
  }

  const { data, error } = await supabase
    .from("keys")
    .select("*")
    .eq("key", key)
    .eq("redeemed", false)
    .single();

  if (!data || error) {
    return { statusCode: 403, body: "Invalid key" };
  }

  const expires = new Date();
  expires.setDate(expires.getDate() + data.duration_days);

  await supabase
    .from("keys")
    .update({
      redeemed: true,
      discord_id: match[1],
      redeemed_at: new Date().toISOString(),
      expires_at: expires.toISOString()
    })
    .eq("key", key);

  return {
    statusCode: 200,
    body: "Key redeemed"
  };
};
