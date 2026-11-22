/* AllStreamingBD authorized media player.
 * Accepts only direct media URLs supplied by the site owner/content provider.
 * API: ASBPlayer.open({title, seasons:[{name,episodes:[{title,url,type,captions:[{label,url}]}]}]})
 * or ASBPlayer.open({title,url,type,captions:[...]})
 */
(()=> {
 const css=`
 #asb-player{position:fixed;inset:0;z-index:9999;background:#050509ed;display:none;overflow:auto;padding:18px;font-family:Arial,sans-serif;color:#fff}
 #asb-player.open{display:block}#asb-player .wrap{max-width:980px;margin:3vh auto;background:#14141d;border:1px solid #ffffff20;border-radius:20px;padding:18px;box-shadow:0 20px 80px #000}
 #asb-player .top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}#asb-player h2{font-size:20px;margin:0}
 #asb-player button,#asb-player select,#asb-player input{font:inherit;border-radius:10px;border:1px solid #ffffff25;background:#242430;color:#fff;padding:10px}
 #asb-player button{cursor:pointer}#asb-player .close{background:#a9002e}#asb-player video{width:100%;max-height:65vh;background:#000;border-radius:14px}
 #asb-player .controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:12px 0}
 #asb-player .controls input{min-width:0;width:100%}#asb-player .row{display:flex;gap:9px;flex-wrap:wrap;margin:10px 0}
 #asb-player .hint{color:#aaa;font-size:12px;line-height:1.5}#asb-player .download{background:linear-gradient(120deg,#ff3156,#a9002e);border:0}
 @media(max-width:600px){#asb-player{padding:8px}#asb-player .wrap{margin:0 auto;padding:12px}#asb-player .controls{grid-template-columns:1fr}#asb-player video{max-height:48vh}}
 `;
 const style=document.createElement('style');style.textContent=css;document.head.append(style);
 const root=document.createElement('section');root.id='asb-player';root.innerHTML=`
 <div class="wrap"><div class="top"><h2 id="asb-title">Authorized Video Player</h2><button class="close" id="asb-close">✕ Close</button></div>
 <video id="asb-video" controls playsinline preload="metadata"></video>
 <div class="row"><select id="asb-season" aria-label="Season"></select><select id="asb-episode" aria-label="Episode"></select><select id="asb-caption" aria-label="Subtitle"><option value="">Subtitles: Off</option></select><button id="asb-download" class="download">⬇ Download</button></div>
 <div class="controls"><input id="asb-url" type="url" placeholder="Paste authorized MP4 or HLS (.m3u8) URL"><input id="asb-suburl" type="url" placeholder="Optional WebVTT (.vtt) subtitle URL"></div>
 <div class="row"><button id="asb-load">Load video</button><button id="asb-loadsub">Load subtitle</button></div>
 <p class="hint">Use only video and subtitle URLs you own or are licensed to stream/download. Cross-origin downloads depend on the media host's CORS and download policy.</p></div>`;
 document.body.append(root);
 const $=id=>document.getElementById(id), video=$('asb-video');
 let state={title:'',seasons:[],current:null,hls:null};
 function stop(){if(state.hls){state.hls.destroy();state.hls=null}video.pause();video.removeAttribute('src');video.load();video.querySelectorAll('track').forEach(t=>t.remove())}
 function setCaption(list){$('asb-caption').innerHTML='<option value="">Subtitles: Off</option>';(list||[]).forEach((c,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=c.label||c.language||('Subtitle '+(i+1));$('asb-caption').append(o)})}
 function loadCaption(url,label){video.querySelectorAll('track').forEach(t=>t.remove());if(!url)return;const t=document.createElement('track');t.kind='subtitles';t.label=label||'Subtitle';t.srclang='und';t.src=url;t.default=true;video.append(t)}
 function play(ep){if(!ep)return;state.current=ep;stop();const url=ep.url||'';$('asb-url').value=url;$('asb-title').textContent=(state.title?state.title+' — ':'')+(ep.title||'Now Playing');setCaption(ep.captions||[]);$('asb-suburl').value='';if(ep.captionUrl){$('asb-suburl').value=ep.captionUrl;loadCaption(ep.captionUrl,'Subtitle')}
  if(!url)return;
  if(/\.m3u8(?:$|\?)/i.test(url)&&window.Hls&&Hls.isSupported()){state.hls=new Hls();state.hls.loadSource(url);state.hls.attachMedia(video)}
  else if(/\.m3u8(?:$|\?)/i.test(url)&&!video.canPlayType('application/vnd.apple.mpegurl')){alert('এই ব্রাউজারে HLS চালাতে সমস্যা হচ্ছে। MP4 URL বা HLS-compatible browser ব্যবহার করুন।');return}
  else video.src=url;
  video.play().catch(()=>{});
 }
 function currentEpisode(){return state.current||{url:$('asb-url').value,title:state.title,captions:[]}}
 function fill(){const seasons=state.seasons.length?state.seasons:[{name:'Video',episodes:[state.current||{title:'Video',url:''}]}];$('asb-season').innerHTML='';seasons.forEach((s,i)=>{const o=document.createElement('option');o.value=i;o.textContent=s.name||('Season '+(i+1));$('asb-season').append(o)});fillEpisodes(0)}
 function fillEpisodes(si){const eps=state.seasons[si]?.episodes||[state.current||{title:'Video',url:''}];$('asb-episode').innerHTML='';eps.forEach((ep,i)=>{const o=document.createElement('option');o.value=i;o.textContent=ep.title||('Episode '+(i+1));$('asb-episode').append(o)});if(eps[0])play(eps[0])}
 window.ASBPlayer={open(config={}){state.title=config.title||'Authorized Video';state.seasons=Array.isArray(config.seasons)?config.seasons:[];state.current={title:config.title||'Video',url:config.url||'',captions:config.captions||[],captionUrl:config.captionUrl||''};$('asb-title').textContent=state.title;root.classList.add('open');if(state.seasons.length)fill();else{fill();play(state.current)}},close(){root.classList.remove('open');stop()}};
 $('asb-close').onclick=()=>window.ASBPlayer.close();
 $('asb-season').onchange=e=>fillEpisodes(Number(e.target.value));
 $('asb-episode').onchange=e=>{const eps=state.seasons[Number($('asb-season').value)]?.episodes||[];play(eps[Number(e.target.value)])};
 $('asb-load').onclick=()=>play({...currentEpisode(),url:$('asb-url').value});
 $('asb-loadsub').onclick=()=>loadCaption($('asb-suburl').value,'External subtitle');
 $('asb-caption').onchange=e=>{const c=currentEpisode().captions?.[Number(e.target.value)];loadCaption(e.target.value===''?'':c?.url,c?.label)};
 $('asb-download').onclick=()=>{const url=$('asb-url').value.trim();if(!url){alert('আগে একটি authorized video URL দিন।');return}const a=document.createElement('a');a.href=url;a.download=(state.title||'video').replace(/[^a-z0-9-_]/gi,'_');a.rel='noopener';document.body.append(a);a.click();a.remove()};
 const h=document.createElement('script');h.src='https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';h.defer=true;document.head.append(h);
})();