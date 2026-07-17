// Step 2: GitHub redirects back here with a code. Exchange it for a token and hand it
// to the Decap CMS window via the postMessage handshake it expects.
exports.handler = async (event) => {
  const provider = "github";
  const code = (event.queryStringParameters || {}).code;
  if (!code) return page(provider, "error", { error: "Missing authorization code." });

  try {
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const data = await r.json();
    if (data.access_token) {
      return page(provider, "success", { token: data.access_token, provider });
    }
    return page(provider, "error", { error: data.error_description || data.error || "No access token returned." });
  } catch (e) {
    return page(provider, "error", { error: String(e && e.message ? e.message : e) });
  }
};

function page(provider, status, content) {
  const payload = JSON.stringify(content);
  const body = `<!doctype html><html><body><script>
  (function () {
    function receive(e) {
      window.opener.postMessage('authorization:${provider}:${status}:${payload}', e.origin);
      window.removeEventListener('message', receive, false);
    }
    window.addEventListener('message', receive, false);
    if (window.opener) window.opener.postMessage('authorizing:${provider}', '*');
  })();
  </script></body></html>`;
  return { statusCode: 200, headers: { "Content-Type": "text/html" }, body };
}
