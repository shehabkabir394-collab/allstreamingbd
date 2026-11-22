# AllStreamingBD

Premium black + red liquid-glass entertainment catalog starter.

## Files
- `index.html` — responsive landing page and catalog preview
- `worker.js` — Cloudflare Worker catalog adapter
- `wrangler.toml` — Cloudflare configuration

## Deploy
1. Connect this repository to Cloudflare Pages or deploy the Worker with Wrangler.
2. For a static Pages deployment, set the build output directory to `/` and no build command.
3. To deploy the Worker adapter, run `npx wrangler deploy`.
4. Test `/api/health`.

## API and content safety
The Worker allowlists catalog metadata endpoints only. It does not expose stream extraction, media proxying, or caption endpoints. Connect only a provider and media sources you are authorized to use. The sample homepage titles are preview placeholders, not a live catalog.

## Next
Configure a verified, authorized catalog provider and then connect its metadata response to the homepage. Add playback only for licensed/owned media with the provider's approved playback method.
