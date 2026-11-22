// Cloudflare Pages Function: /api/cinepulse/*
const BASE = "https://okay-891h.onrender.com";
const ALLOWED = new Set([
  "/api/v1/home", "/api/v1/reels", "/api/v1/categories", "/api/v1/catalog",
  "/api/v1/search", "/api/v1/suggest", "/api/v1/updates-24h", "/api/v1/details",
  "/api/v1/stream", "/api/v1/captions", "/api/v1/related", "/api/v1/comments",
  "/api/v1/staff", "/api/v1/trending", "/api/v1/ranking", "/api/v1/hot-search",
  "/api/v1/filter", "/api/v1/filter-options", "/api/v1/platform", "/api/v1/upcoming",
  "/api/v1/sports/matches", "/api/v1/sports/leagues", "/api/v1/bottom-tabs",
  "/api/v1/app-info", "/api/v1/status"
]);
const SOURCE_DEFAULT = new Set([
  "/api/v1/home", "/api/v1/catalog", "/api/v1/search", "/api/v1/suggest",
  "/api/v1/updates-24h", "/api/v1/trending", "/api/v1/ranking",
  "/api/v1/filter", "/api/v1/platform"
]);
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8",
  "Vary": "Origin"
};
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: cors });

export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "GET") return json({ ok: false, error: "Only GET is allowed" }, 405);
  if (!env.CINEPULSE_API_KEY) {
    return json({ ok: false, error: "CINEPULSE_API_KEY Pages Secret is not configured" }, 503);
  }

  const rawPath = params.path;
  const suffix = Array.isArray(rawPath) ? rawPath.join("/") : String(rawPath || "");
  const path = ("/api/" + suffix).replace(/\/{2,}/g, "/");
  if (!ALLOWED.has(path)) {
    return json({ ok: false, error: "Unknown CinePulse endpoint", requested: path, available: [...ALLOWED] }, 404);
  }

  const target = new URL(BASE + path);
  for (const [key, value] of url.searchParams) target.searchParams.set(key, value);
  if (!target.searchParams.has("source") && SOURCE_DEFAULT.has(path)) {
    target.searchParams.set("source", "all");
  }

  try {
    const upstream = await fetch(target, {
      headers: {
        "Accept": "application/json",
        "x-api-key": env.CINEPULSE_API_KEY,
        "User-Agent": "AllStreamingBD/1.0"
      }
    });
    const body = await upstream.text();
    const contentType = upstream.headers.get("content-type") || "";
    if (!contentType.includes("json")) {
      return json({ ok: false, error: "Provider returned non-JSON", upstreamStatus: upstream.status, endpoint: path }, 502);
    }
    return new Response(body, {
      status: upstream.status,
      headers: {
        ...cors,
        "Cache-Control": path.includes("/stream") || path.includes("/captions") ? "no-store" : "public, max-age=30"
      }
    });
  } catch {
    return json({ ok: false, error: "CinePulse request failed", endpoint: path }, 502);
  }
}
