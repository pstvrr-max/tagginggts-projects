const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// CHANGE THIS
const ADMIN_SECRET = "CHANGE_THIS_SECRET";

exports.handler = async (event) => {
  const { secret, days } = event.queryStringParameters || {};

  if (secret !== ADMIN_SECRET || !days) {
    return { statusCode: 403, body: "Forbidden" };
  }

  const key =
    "TGTS-" + crypto.randomBytes(4).toString("hex").toUpperCase();

  await supabase.from("keys").insert({
    key,
    duration_days: parseInt(days),
    redeemed: false
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ key, days })
  };
};
