/** AllStreamingBD — secure CinePulse metadata gateway. Set CINEPULSE_API_KEY as Worker Secret. */
const BASE="https://okay-891h.onrender.com";
const ALLOWED=new Set(["/api/v1/home","/api/v1/reels","/api/v1/categories","/api/v1/catalog","/api/v1/search","/api/v1/suggest","/api/v1/updates-24h","/api/v1/details","/api/v1/related","/api/v1/comments","/api/v1/staff","/api/v1/trending","/api/v1/ranking","/api/v1/hot-search","/api/v1/filter","/api/v1/filter-options","/api/v1/platform","/api/v1/upcoming","/api/v1/sports/matches","/api/v1/sports/leagues","/api/v1/bottom-tabs","/api/v1/app-info","/api/v1/status"]);
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,OPTIONS","Access-Control-Allow-Headers":"Content-Type","Content-Type":"application/json; charset=utf-8"};
const json=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:cors});
export default {async fetch(request,env){const u=new URL(request.url);
if(u.pathname==="/api/health")return json({ok:true,service:"AllStreamingBD",provider:"CinePulse",metadata:true,sources:["moviebox","movielinkbd","all"],apiKeyConfigured:!!env.CINEPULSE_API_KEY,playback:"authorized-media-only"});
if(!u.pathname.startsWith("/api/"))return env.ASSETS?env.ASSETS.fetch(request):new Response("Assets binding missing",{status:500});
if(request.method==="OPTIONS")return new Response(null,{headers:cors});
if(request.method!=="GET")return json({ok:false,error:"Only GET is allowed"},405);
if(!env.CINEPULSE_API_KEY)return json({ok:false,error:"CINEPULSE_API_KEY Worker Secret is not configured"},503);
const path=u.pathname.replace(/^\/api\/cinepulse/,"/api");
if(!ALLOWED.has(path))return json({ok:false,error:"Endpoint not enabled; third-party stream/caption extraction is unavailable"},404);
const target=new URL(BASE+path);for(const [k,v] of u.searchParams)target.searchParams.set(k,v);
if(!target.searchParams.has("source")&&["/api/v1/home","/api/v1/reels","/api/v1/catalog","/api/v1/search","/api/v1/suggest","/api/v1/updates-24h","/api/v1/trending","/api/v1/ranking","/api/v1/filter"].includes(path))target.searchParams.set("source","all");
try{const r=await fetch(target,{headers:{Accept:"application/json","x-api-key":env.CINEPULSE_API_KEY,"User-Agent":"AllStreamingBD/1.0"}});const body=await r.text();if(!(r.headers.get("content-type")||"").includes("json"))return json({ok:false,error:"Provider returned non-JSON",upstreamStatus:r.status},502);return new Response(body,{status:r.status,headers:{...cors,"Cache-Control":"public, max-age=45"}})}catch(e){return json({ok:false,error:"CinePulse request failed"},502)}
}};