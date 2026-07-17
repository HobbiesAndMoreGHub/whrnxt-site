// Step 1 of the Decap → GitHub OAuth flow: send the editor to GitHub to authorize.
const crypto = require("crypto");

exports.handler = async (event) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return { statusCode: 500, body: "Missing GITHUB_CLIENT_ID env var." };

  const host = event.headers.host;
  const redirectUri = `https://${host}/.netlify/functions/callback`;
  const state = crypto.randomBytes(12).toString("hex");

  const url =
    "https://github.com/login/oauth/authorize" +
    "?client_id=" + encodeURIComponent(clientId) +
    "&redirect_uri=" + encodeURIComponent(redirectUri) +
    "&scope=repo" +
    "&state=" + state;

  return { statusCode: 302, headers: { Location: url } };
};
