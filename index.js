const express = require("express");
const fetch = require("node-fetch");
const app = express();

const CLIENT_ID = process.env.CLIENT_ID || "1311403506800001075";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "Smz2sS2nzlJcGsYL9q0-Dhn_DxWHhv2y";
const REDIRECT_URI = process.env.REDIRECT_URI || "https://redirect-lijs.onrender.com/oauth2/callback";
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "https://discordapp.com/api/webhooks/1375567193668063274/WjDBaTA5MRsrGTnIiAkRhQ2dzOsoRlt5TLa7uRdNUHr7n9Qih5ighYR0cp8cn4Te9LyM";

// Root route for testing server is up
app.get("/", (req, res) => {
  res.send("OAuth2 service is running!");
});

app.get("/oauth2/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code");

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        scope: "email identify",
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      return res.status(400).json(tokenData);
    }

    const accessToken = tokenData.access_token;

    // Fetch user info (including email)
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userData = await userResponse.json();

    // Send user info to your Discord webhook
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `New OAuth2 login:\nUsername: ${userData.username}#${userData.discriminator}\nEmail: ${userData.email}`,
      }),
    });

    // Respond to user with a simple message
    res.send("Thanks for logging in! Your email was recorded.");
  } catch (err) {
    res.status(500).send("Error during OAuth2 process: " + err.message);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
