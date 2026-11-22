export async function onRequest({ env }) {
  return new Response(JSON.stringify({
    ok: true,
    service: "AllStreamingBD",
    provider: "CinePulse",
    apiKeyConfigured: !!env.CINEPULSE_API_KEY,
    gateway: "/api/cinepulse/v1/*"
  }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
