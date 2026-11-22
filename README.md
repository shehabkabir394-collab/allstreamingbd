# AllStreamingBD

Premium black + red liquid-glass streaming catalog powered by the CinePulse API.

## Project files
- `index.html` — responsive site UI
- `app.js` — CinePulse endpoint controls, catalog, search, details, related/comments and playback wiring
- `worker.js` — secure server-side CinePulse API gateway
- `player.js` — MP4/HLS player with episode and WebVTT caption support
- `wrangler.toml` — Cloudflare Worker + static assets configuration

## Deploy
1. Connect this repository to Cloudflare Workers (Wrangler configuration is included).
2. Add a Worker Secret named `CINEPULSE_API_KEY` containing the current CinePulse API key. Never put the key in HTML, JavaScript, GitHub files, or URL query strings.
3. Deploy with `npx wrangler deploy` or the Cloudflare Git deployment configured for this Worker.
4. Open `/api/health`. It should report `apiKeyConfigured: true`.
5. Open the site and use the **All API Services** panel to test each endpoint.

## CinePulse endpoints enabled by the gateway
- `home`, `reels`, `categories`, `catalog`
- `search`, `suggest`, `updates-24h`, `details`
- `stream`, `captions`, `related`, `comments`, `staff`
- `trending`, `ranking`, `hot-search`, `filter`, `filter-options`
- `platform`, `upcoming`
- `sports/matches`, `sports/leagues`
- `bottom-tabs`, `app-info`, `status`

The gateway serves these through `/api/cinepulse/v1/<endpoint>` and keeps the API key on the server. The UI defaults catalog requests to `source=all`; the home feed requests Hindi (`lang=hi`) first.

## Playback
The player accepts the provider's returned authorized MP4/HLS URLs and WebVTT caption URLs. Stream and caption JSON is forwarded by the Worker; the Worker does not download, rehost, or proxy the media bytes. Actual playback depends on the provider's response schema, URL validity, browser codec support, and source CORS policy.

## Security
- Keep `CINEPULSE_API_KEY` as a Cloudflare Worker Secret.
- Rotate the key if it has ever been pasted into a chat, public issue, source file, or browser console.
- Only use streams and captions that you own or are authorized to distribute.
