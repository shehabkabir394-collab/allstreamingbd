/**
 * AllStreamingBD Cloudflare Worker
 * Catalog-only adapter. Playback/media extraction is intentionally not proxied.
 */
const UPSTREAM = "https://h5-api.aoneroom.com";
const ALLOWED = new Set([
  "/wefeed-h5api-bff/home",
  "/wefeed-h5api-bff/subject/trending",
  "/wefeed-h5api-bff/subject/search",
  "/wefeed-h5api-bff/subject/search-suggest",
  "/wefeed-h5api-bff/subject/everyone-search",
  "/wefeed-h5api-bff/subject/filter",
  "/wefeed-h5api-bff/filter",
  "/wefeed-h5api-bff/subject/detail-rec",
  "/wefeed-h5api-bff/upcoming-subject-list",
  "/wefeed-h5api-bff/tab/get-bottom-tab-list"
]);
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8"
};
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:cors})}
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==="/api/health") return json({ok:true,service:"AllStreamingBD catalog API",mode:"catalog-only"});
  if(!url.pathname.startsWith("/api/")){
   return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Static assets binding is not configured",{status:500});
  }
  if(request.method==="OPTIONS") return new Response(null,{headers:cors});
  const path=url.pathname.slice(4);
  if(!ALLOWED.has(path)) return json({ok:false,error:"Endpoint is not enabled. Media playback endpoints are not proxied."},404);
  if(!["GET","POST"].includes(request.method)) return json({ok:false,error:"Method not allowed"},405);
  const upstreamUrl=new URL(UPSTREAM+path);
  for(const [k,v] of url.searchParams) upstreamUrl.searchParams.set(k,v);
  const headers={
   "Accept":"application/json","Content-Type":"application/json",
   "Referer":"https://moviebox01.com/",
   "X-Client-Info":JSON.stringify({timezone:"Asia/Dhaka"}),
   "X-Vip-Restrict":"0","X-No-High-Risk-Restrict":"1","X-Request-Lang":"en",
   "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36"
  };
  try{
   const init={method:request.method,headers};
   if(request.method==="POST"){
    const body=await request.text();
    if(body.length>12000) return json({ok:false,error:"Request body too large"},413);
    init.body=body;
   }
   const upstream=await fetch(upstreamUrl.toString(),init);
   const type=upstream.headers.get("content-type")||"";
   if(!type.includes("application/json")) return json({ok:false,error:"Catalog provider returned a non-JSON response",upstreamStatus:upstream.status},502);
   return new Response(await upstream.text(),{status:upstream.status,headers:{...cors,"Cache-Control":"public, max-age=60"}});
  }catch(e){return json({ok:false,error:"Catalog provider request failed"},502)}
 }
};