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

  const discordId = match[1];

  const { data } = await supabase
    .from("keys")
    .select("expires_at")
    .eq("discord_id", discordId)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!data) {
    return { statusCode: 403, body: "No access" };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ access: true })
  };
};
