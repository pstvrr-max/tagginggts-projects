const fetch = require("node-fetch");

exports.handler = async (event) => {
  const code = event.queryStringParameters.code;
  if (!code) {
    return { statusCode: 400, body: "Missing code" };
  }

  // Exchange code for token
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI
    })
  });

  const tokenData = await tokenRes.json();

  // Get user info
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  const user = await userRes.json();

  return {
    statusCode: 302,
    headers: {
      "Set-Cookie": `discord_id=${user.id}; Path=/; HttpOnly; Secure; SameSite=Lax`,
      Location: "/"
    }
  };
};
