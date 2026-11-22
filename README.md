# AllStreamingBD

Premium black + red liquid-glass streaming catalog powered by the CinePulse API.

## Project files
- `index.html` — responsive site UI
- `app.js` — CinePulse endpoint controls, catalog, search, details, related/comments and playback wiring
- `functions/api/cinepulse/[[path]].js` — secure Cloudflare Pages API gateway
- `functions/api/health.js` — gateway health check
- `worker.js` — legacy Workers entry; Pages deployment uses the Functions files above
- `player.js` — MP4/HLS player with episode and WebVTT caption support

## Deploy on Cloudflare Pages
1. In Cloudflare, open **Workers & Pages → Create → Pages → Connect to Git** and select `shehabkabir394-collab/allstreamingbd`.
2. Framework preset: **None**.
3. Build command: leave blank.
4. Build output directory: `.` (repository root).
5. Root directory: `/` (default).
6. In Pages project **Settings → Variables and Secrets**, add `CINEPULSE_API_KEY` as an encrypted **Secret** for Production (and Preview if needed).
7. Deploy. Pages automatically detects the root `functions/` directory.
8. Test `/api/health`; it should report `apiKeyConfigured: true`.

## CinePulse endpoints enabled
- `home`, `reels`, `categories`, `catalog`
- `search`, `suggest`, `updates-24h`, `details`
- `stream`, `captions`, `related`, `comments`, `staff`
- `trending`, `ranking`, `hot-search`, `filter`, `filter-options`
- `platform`, `upcoming`
- `sports/matches`, `sports/leagues`
- `bottom-tabs`, `app-info`, `status`

The gateway exposes these through `/api/cinepulse/v1/<endpoint>` and keeps the API key server-side. The UI defaults catalog requests to `source=all`; the home feed requests Hindi (`lang=hi`) first.

## Playback
The player accepts provider-returned authorized MP4/HLS URLs and WebVTT caption URLs. Stream and caption JSON is forwarded by the Pages Function; the function does not download, rehost, or proxy media bytes. Actual playback depends on the provider response schema, URL validity, browser codec support, and source CORS policy.

## Security
- Keep `CINEPULSE_API_KEY` as a Cloudflare Pages encrypted Secret.
- Rotate the key if it has ever been pasted into a chat, public issue, source file, or browser console.
- Only use streams and captions that you own or are authorized to distribute.
