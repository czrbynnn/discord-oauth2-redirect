const express = require("express");
const fetch = require("node-fetch");
const app = express();

const CLIENT_ID = "1311403506800001075";
const CLIENT_SECRET = "Smz2sS2nzlJcGsYL9q0-Dhn_DxWHhv2y";
const REDIRECT_URI = 'https://redirect-lijs.onrender.com/oauth2/callback';

// Add this basic root route
app.get("/", (req, res) => {
  res.send("OAuth2 service is running!");
});

app.get("/oauth2/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code");

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
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

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = await userResponse.json();

    res.send(`Hello ${userData.username}#${userData.discriminator}, your email is: ${userData.email}`);
  } catch (err) {
    res.status(500).send("Error during OAuth2 process: " + err.message);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
