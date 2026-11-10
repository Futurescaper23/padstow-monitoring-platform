import { available, nextAvailable, describeInterval, validateReviewManifest, progressiveShadow, reviewPixels, contiguousHistory, footprintRowBounds, rotatedFootprintBounds, fitFootprint } from "./animation-model.mjs";

const registry = await fetch("/public/projects/padstow-estuary/trend-animation/areas.json", {cache:"no-store"}).then(r => {
  if (!r.ok) throw new Error("Review area registry unavailable"); return r.json();
});
const cache = new Map();
async function loadArea(areaId) {
  if(cache.has(areaId))return cache.get(areaId);
  const url=registry.areas?.[areaId];
  if(typeof url!=="string" || !url.startsWith("/public/projects/padstow-estuary/trend-animation/manifests/")) return null;
  const manifest=await fetch(url,{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("Review manifest unavailable");return r.json()});
  if(!validateReviewManifest(manifest,areaId)) throw new Error("Invalid review manifest");
  const decoded=await Promise.all(manifest.frames.map(async f=>{
    if(!available(f))return null;
    if(!f.image.startsWith("/public/projects/padstow-estuary/trend-animation/"))throw new Error("Invalid image reference");
    const image=new Image();image.src=f.image;await image.decode();
    if(image.naturalWidth!==manifest.grid.width || image.naturalHeight!==manifest.grid.height)throw new Error("Review frame grid mismatch");
    const canvas=document.createElement("canvas");canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const ctx=canvas.getContext("2d",{willReadFrequently:true});ctx.drawImage(image,0,0);
    const raw=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    const pixels=reviewPixels(raw,manifest.colourEncoding||"red-positive");
    ctx.putImageData(new ImageData(pixels.display,canvas.width,canvas.height),0,0);
    return {raw:pixels.raw,display:canvas.toDataURL("image/png")};
  }));
  const result={manifest,decoded};cache.set(areaId,result);return result;
}
const style = document.createElement("style");
style.textContent = `
  .trend-review{margin:18px 0;padding:20px;border:1px solid #456a93;border-radius:16px;background:#142845;color:#edf6ff}
  .trend-review h3,.trend-review p{margin:0 0 10px}.trend-review p{color:#c4d5eb;line-height:1.45}
  .trend-review__warning{font-size:.9rem}
  .trend-review__bar,.trend-review__controls,.trend-review__legend,.trend-review__shadow{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px}
  .trend-review button,.trend-review select{background:#24466c;color:#edf6ff;border:1px solid #557aa3;border-radius:8px;padding:8px 12px;cursor:pointer;font:inherit}
  .trend-review button[aria-current=true],.trend-review .play{background:#4dc8f8;color:#071a31;font-weight:700}
  .trend-review button.unavailable{border-style:dashed;color:#bdc9d9}
  .trend-review__stage{height:min(60vh,540px);min-height:260px;background:#0b192d;border-radius:10px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
  .trend-review__map{position:absolute;left:0;top:0;transform-origin:0 0}
  .trend-review__north{position:absolute;right:14px;top:12px;color:#fff;background:#142845d9;border:1px solid #7290ad;border-radius:7px;padding:5px 8px;text-align:center;font-size:12px;z-index:2;pointer-events:none}.trend-review__north span{display:block;font-size:22px;line-height:1}
  .trend-review__map img,.trend-review__map canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:fill}
  .trend-review__map .fade{pointer-events:none}.trend-review__map .progressive{pointer-events:none}
  .trend-review__missing{position:absolute;text-align:center;padding:20px;max-width:500px}
  .trend-review__legend{font-size:.82rem}.trend-review__dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px}
  .trend-review input[type=range]{accent-color:#4cc9ff}.trend-review__timeline{flex:1;min-width:140px}
  .trend-review__controls label,.trend-review__shadow label{display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap}
  .trend-review input[type=checkbox]{width:auto;margin:0}
  .trend-review__meta{font-size:.84rem;color:#bbcee5}.trend-review__periods{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:6px;margin-top:12px}
  .trend-review__periods button{padding:8px 3px;font-size:.8rem}.trend-review__periods small{display:block;font-size:.7rem}
  .trend-review__summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:14px 0}
  .trend-review__summary div{background:#1e395b;border:1px solid #45668a;border-radius:9px;padding:10px;font-size:.83rem}
  .trend-review__summary strong{display:block;font-size:1.05rem;color:#fff;margin-top:4px}
  .trend-review-history{margin:14px 0;padding:12px;border:1px solid #45668a;border-radius:9px;color:#c4d5eb}.trend-review-history summary{cursor:pointer;color:#d9efff;font-weight:700}.trend-review-history>p{margin:8px 0}
  .trend-review details{margin-top:12px;padding:10px 12px;border:1px solid #45668a;border-radius:9px;font-size:.86rem}
  .trend-review details summary{cursor:pointer;color:#d9efff;font-weight:700}.trend-review details p{margin:8px 0 0}
  @media(max-width:720px){.trend-review__periods{grid-template-columns:repeat(2,minmax(0,1fr))}.trend-review__summary{grid-template-columns:repeat(2,minmax(0,1fr))}.trend-review__stage{height:420px}}
  @media(prefers-reduced-motion:reduce){.trend-review__map .fade{display:none}}
`;
document.head.append(style);
let mounted = null;
let ticker = null;
let legacyHistory = null;
let stageObserver = null;
// Clockwise display rotation, selected against all available occupied cells.
const rotations={area1:-74,area2:-103,area3:-82,area4:-60,area8:-15};
function unmount(){
  if (ticker) clearInterval(ticker); ticker=null; stageObserver?.disconnect();stageObserver=null; mounted?.remove(); mounted=null;
  if(legacyHistory){
    const {intro,priorDisplay,wrapper,body,guideWrapper,guide}=legacyHistory;
    if(guideWrapper?.isConnected && guide?.parentNode===guideWrapper)guideWrapper.before(guide);
    guideWrapper?.remove();
    if(wrapper.isConnected && body.parentNode===wrapper) wrapper.before(body);
    wrapper.remove(); if(intro)intro.style.display=priorDisplay;
    legacyHistory=null;
  }
}
function mount(panel,manifest,decoded,standalone=false){
  if(!manifest.frames.length){
    const empty=document.createElement("section");empty.className="trend-review";empty.setAttribute("aria-label",manifest.areaId+" sediment change animation");
    const title=document.createElement("h3");title.textContent="Sediment comparisons awaiting review";
    const note=document.createElement("p");note.textContent="No verified sediment comparisons are registered for this area. Survey gaps and dates will be shown when their evidence is available.";
    empty.append(title,note);panel.insertBefore(empty,document.getElementById("volumeTrendBody"));mounted=empty;return;
  }
  const root=document.createElement("section");
  root.className="trend-review"; root.setAttribute("aria-label",`${manifest.areaId} sediment change animation`);
  root.innerHTML=`
    <div class="eyebrow area-label"></div>
    <h3>Sediment Change Analysis</h3>

    <p class="zone-note" hidden></p><p class="zone-links" hidden></p>
    <button class="inspect-areas" type="button" hidden>Inspect the three individual review zones</button>
    <p>Compare available survey intervals, including any explicitly labelled gaps. The previous footprint is a visual reference, not a sediment transport path. Shared 1 m cells do not prove the same sub-cell locations were measured.</p>
    <div class="trend-review__stage"><div class="trend-review__map"><img class="base" alt="Elevation change map"><canvas class="progressive" aria-hidden="true" hidden></canvas><img class="fade" alt="" aria-hidden="true" hidden></div><div class="trend-review__missing" hidden></div><div class="trend-review__north" aria-label="Geographic north direction">N<span>↑</span></div></div>
    <div class="trend-review__legend"><span><i class="trend-review__dot" style="background:#2465bf"></i>Higher / deposition</span><span><i class="trend-review__dot" style="background:#d32e2d"></i>Lower / erosion</span><span><i class="trend-review__dot" style="background:#bdbdbd"></i>Within ±0.05 m</span><span><i class="trend-review__dot" style="background:#f8d567"></i>Previous higher</span><span><i class="trend-review__dot" style="background:#d48af8"></i>Previous lower</span></div>
    <p class="trend-review__meta">Blue = higher, red = lower, matching the existing 3D viewer. The measurement values have not been inverted.</p>
    <div class="trend-review__controls"><button class="previous" aria-label="Previous period">◀</button><button class="play">▶ Play</button><button class="next" aria-label="Next period">▶</button><label>Speed <select class="speed"><option value="3000">Slow</option><option value="1800" selected>Normal</option><option value="900">Fast</option></select></label><label><input type="checkbox" class="loop" checked> Loop</label></div>
    <div class="trend-review__controls"><label for="trend-review-slider">Timeline</label><input class="trend-review__timeline" id="trend-review-slider" type="range" min="0" step="1"><strong class="selected"></strong></div>
    <div class="trend-review__periods"></div><p class="trend-review__meta status" aria-live="polite"></p>
    <div class="trend-review__shadow"><label><input type="checkbox" class="shadow-toggle" checked> Show historical shadow</label><label>Shadow mode <select class="shadow-mode"><option value="single">Previous comparison</option><option value="progressive">Progressive fading</option></select></label><label>Shadow strength <input type="range" class="opacity" min="0" max="100" value="100"></label><span class="opacity-value"></span></div>
    <p class="trend-review__meta">Progressive fading shows earlier footprints more faintly; shadows are limited to the current occupied cells. Colours briefly crossfade between recorded frames for display only—no intermediate measurements are calculated.</p>
    <div class="trend-review__summary" aria-label="Current interval summary"><div>Higher ≥ 0.05 m<strong class="increase">—</strong>occupied 1 m cells</div><div>Lower ≤ −0.05 m<strong class="decrease">—</strong>occupied 1 m cells</div><div>Coverage<strong class="occupied">—</strong>occupied 1 m cells</div><div>Data status<strong class="quality">—</strong>see evidence below</div></div>
    <p class="trend-review__meta">These counts describe 1 m cell averages, not fully measured area. No independently validated volume figures are available for this review.</p>
    <details><summary>Evidence and limitations</summary><p class="trend-review__warning"><strong>Review data: check the status of each interval.</strong> These frames show 1 m means of measured Relative height, with no gap interpolation. A coloured cell may have incomplete coverage within it. Registration, datum and survey uncertainty require independent review; no volume figures are implied.</p><p class="evidence"></p><p>Survey co-registration and uncertainty need independent review. CloudCompare's original 0.1 m reports use a different calculation from these 1 m display cells. Shadows indicate prior change footprints, not sediment transport.</p></details>
    <p class="trend-review__meta coverage-note"></p>
    <p class="trend-review__meta coverage-map" hidden><a href="/public/projects/padstow-estuary/trend-animation/coverage.png" target="_blank" rel="noopener" style="color:#8edbff">Open Area 3 coverage comparison map (separate north-up report)</a> · grey: both periods; yellow: only 4→5; purple: only 5→6. An occupied 1 m cell can contain unmeasured gaps.</p>
    <p class="trend-review__meta">Playback cycles the available frames only. Missing periods remain unavailable. Fixed ±0.5 m display scale; ±0.05 m reporting threshold.</p>
  `;
  if(manifest.warning){
    root.querySelector('.trend-review__warning').textContent=manifest.warning;
    root.querySelector('.trend-review__legend').innerHTML='<span><i class="trend-review__dot" style="background:#2465bf"></i>Later surface higher</span><span><i class="trend-review__dot" style="background:#d32e2d"></i>Later surface lower</span><span><i class="trend-review__dot" style="background:#bdbdbd"></i>Within ±0.05 m</span><span><i class="trend-review__dot" style="background:#f8d567"></i>Previous higher</span><span><i class="trend-review__dot" style="background:#d48af8"></i>Previous lower</span>';
  }
  if(standalone && manifest.areaId!=="area8"){
    panel.append(root);mounted=root;
    const n=root.querySelector(".zone-note");n.hidden=false;n.textContent="Transparent areas have no reviewed measurements; candidate zones and exposed sediment are not yet verified. Shared cells between zones are withheld.";
    const body=document.getElementById('volumeTrendBody'),intro=document.getElementById('volumeTrendIntro');
    if(body?.parentNode){const wrapper=document.createElement('details');wrapper.className='trend-review-history';const title=document.createElement('summary');title.textContent='Earlier trend record — historical context, review required';const note=document.createElement('p');note.textContent='This preserved earlier trend record is separate from the experimental animation and is not a validated six-survey analysis.';wrapper.append(title,note);body.before(wrapper);wrapper.append(body);const priorDisplay=intro?.style.display||'';if(intro)intro.style.display='none';legacyHistory={intro,priorDisplay,wrapper,body};}
  } else if(standalone){
    panel.append(root);mounted=root;
    root.querySelector(".trend-review__warning").textContent=manifest.warning;
    const zoneNote=root.querySelector(".zone-note");zoneNote.hidden=false;zoneNote.textContent="The view places the three candidate zones in one map without averaging across zones; any 1 m cell assigned to more than one zone is withheld. The historical estuary-labelled scope refers to Padstow-named inputs, not the whole estuary.";
    root.querySelector(".trend-review__legend").innerHTML='<span><i class="trend-review__dot" style="background:#2465bf"></i>Later surface higher</span><span><i class="trend-review__dot" style="background:#d32e2d"></i>Later surface lower</span><span><i class="trend-review__dot" style="background:#bdbdbd"></i>Within ±0.05 m</span><span><i class="trend-review__dot" style="background:#f8d567"></i>Previous higher</span><span><i class="trend-review__dot" style="background:#d48af8"></i>Previous lower</span>';
    const inspect=root.querySelector(".inspect-areas");inspect.hidden=false;inspect.onclick=()=>{const d=root.querySelector(".zone-links");if(d)d.scrollIntoView({behavior:"smooth",block:"start"});};
  } else {
  const body=document.getElementById("volumeTrendBody"), intro=document.getElementById("volumeTrendIntro");
  if(!body || body.parentNode!==panel)throw new Error("Legacy trend section unavailable");
  const wrapper=document.createElement("details");wrapper.className="trend-review-history";
  const summary=document.createElement("summary");summary.textContent="Earlier trend record — historical context, review required";
  const note=document.createElement("p");note.textContent="This is the original historical record. Its periods and area descriptions may differ from the animation; it has not been verified as a six-survey analysis.";
  wrapper.append(summary,note);panel.insertBefore(root,body);panel.insertBefore(wrapper,body);wrapper.append(body);
  const priorDisplay=intro?.style.display||"";if(intro)intro.style.display="none";
  const guide=document.getElementById("volumeGuidancePanels");let guideWrapper=null;
  if(guide?.parentNode){guideWrapper=document.createElement("details");guideWrapper.className="trend-review-history";
    const guideSummary=document.createElement("summary");guideSummary.textContent="Earlier site interpretation — historical context, review required";
    const guideNote=document.createElement("p");guideNote.textContent="The preserved guidance refers to the earlier trend record and has not been verified against this animation.";
    guideWrapper.append(guideSummary,guideNote);guide.before(guideWrapper);guideWrapper.append(guide);}
  legacyHistory={intro,priorDisplay,wrapper,body,guideWrapper,guide};mounted=root;
  }
  const q=(s)=>root.querySelector(s);
  q(".area-label").textContent=(manifest.label||manifest.areaId).toUpperCase()+" · PRELIMINARY ANALYSIS";
  q(".evidence").textContent=manifest.evidence || "EPSG:27700 is declared by survey cloud headers and project configuration; difference LAS files lack embedded CRS. ODN/OSGM15 is declared for later source clouds and configuration; historical datum evidence remains incomplete. Survey B's exact date is unresolved.";
  q(".coverage-map").hidden=!manifest.coverageImage;
  if(manifest.coverageImage)q(".coverage-map a").href=manifest.coverageImage;
  const angle=rotations[manifest.areaId]??0, map=q(".trend-review__map"), stage=q(".trend-review__stage");
  const bounds=rotatedFootprintBounds(footprintRowBounds(decoded.map(x=>x?.raw),manifest.grid.width,manifest.grid.height),angle);
  map.style.width=manifest.grid.width+"px";map.style.height=manifest.grid.height+"px";
  q(".trend-review__north span").style.transform=`rotate(${angle}deg)`;
  function updateFit(){if(!bounds || !stage.clientWidth || !stage.clientHeight)return;const {scale,tx,ty}=fitFootprint(bounds,stage.clientWidth,stage.clientHeight);const r=angle*Math.PI/180,c=Math.cos(r)*scale,s=Math.sin(r)*scale;map.style.transform=`matrix(${c},${s},${-s},${c},${tx},${ty})`;}
  stageObserver=new ResizeObserver(updateFit);stageObserver.observe(stage);updateFit();
  q(".progressive").width=manifest.grid.width;q(".progressive").height=manifest.grid.height;
  q(".trend-review__timeline").max=String(manifest.frames.length-1);
  let index=Number.isInteger(manifest.initialIndex) && manifest.initialIndex>=0 && manifest.initialIndex<manifest.frames.length && available(manifest.frames[manifest.initialIndex]) ? manifest.initialIndex : Math.max(0,manifest.frames.findIndex(available)), renderedIndex=-1, fadeAnimation=null;
  const buttons=q(".trend-review__periods");
  buttons.innerHTML=manifest.frames.map((f,i)=>`<button data-index="${i}" class="${available(f)?"":"unavailable"}" aria-current="false">${f.pair}<small>${available(f)?(f.coverageLabel||f.status):"Unavailable"}</small></button>`).join("");
  function stop(){if(ticker)clearInterval(ticker);ticker=null;q(".play").textContent="▶ Play"}
  function draw(){
    const f=manifest.frames[index], has=available(f), progressive=q(".shadow-mode").value==="progressive";
    const history=contiguousHistory(manifest.frames,index);
    const hasShadow=has && history.length>0;
    q(".selected").textContent=f.label+(f.coverageLabel?" · "+f.coverageLabel:"");
    q(".trend-review__timeline").value=String(index);
    q(".trend-review__map").hidden=!has;
    q(".trend-review__missing").hidden=has;
    q(".trend-review__missing").textContent=has?"":f.label+" — unavailable. "+(f.reason||"No reviewed frame.");
    if(has && renderedIndex!==index){
      const old=q(".base").getAttribute("src"), fade=q(".fade");
      if(fadeAnimation)fadeAnimation.cancel();
      q(".base").src=decoded[index].display; fade.hidden=true;
      if(old && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
        fade.src=old; fade.hidden=false; fadeAnimation=fade.animate([{opacity:1},{opacity:0}],{duration:320,easing:"ease-out"});
        const active=fadeAnimation; active.onfinish=()=>{if(fadeAnimation===active)fade.hidden=true};
      }
      renderedIndex=index;
    } else if(!has){renderedIndex=-1; q(".fade").hidden=true;}
    const enabled=hasShadow && q(".shadow-toggle").checked;
    q(".progressive").hidden=!enabled;
    if(enabled){
      const earlier=(progressive?history:history.slice(0,1)).map(i=>decoded[i].raw);
      const canvas=q(".progressive"), ctx=canvas.getContext("2d");
      ctx.putImageData(new ImageData(progressiveShadow(decoded[index].raw,earlier,Number(q(".opacity").value)/100,progressive?.12:.22),manifest.grid.width,manifest.grid.height),0,0);
    }
    q(".opacity").disabled=!hasShadow || !q(".shadow-toggle").checked;
    q(".opacity-value").textContent=hasShadow?"Maximum blend: "+(Number(q(".opacity").value)*(progressive?.225:.22)).toFixed(0)+"%":"No preceding reviewed frame";
    for(const [selector,key] of [[".increase","increaseCells"],[".decrease","decreaseCells"],[".occupied","occupiedCells"]]) q(selector).textContent=has && Number.isFinite(f.summary?.[key]) ? f.summary[key].toLocaleString() : "Unavailable";
    q(".quality").textContent=has?f.status:"Unavailable";
    q(".status").textContent=has?describeInterval(f):(f.reason||"No reviewed frame.")+(f.skippedSurveys?.length?" · "+describeInterval(f):"");
    const zoneLinks=q('.zone-links');zoneLinks.replaceChildren();zoneLinks.hidden=!has || !f.zoneImages?.length;
    if(!zoneLinks.hidden){zoneLinks.append('Inspect individual candidate zones (separate north-up reports): ');for(const z of f.zoneImages){if(typeof z.label!=='string'||typeof z.url!=='string'||!z.url.startsWith('/public/projects/padstow-estuary/trend-animation/'))continue;const a=document.createElement('a');a.href=z.url;a.target='_blank';a.rel='noopener';a.style.color='#8edbff';a.textContent=z.label;zoneLinks.append(a,'  ');}}
    q(".coverage-note").textContent=f.coverageNote || (has && Number.isFinite(f.summary?.matchingPercent)?`CloudCompare report: ${f.summary.matchingPercent}% matching cells on its original 0.1 m grid.`:f.note||"");
    for(const b of buttons.querySelectorAll("button"))b.setAttribute("aria-current",String(Number(b.dataset.index)===index));
  }
  function select(i){stop();index=Math.max(0,Math.min(manifest.frames.length-1,i));draw()}
  function start(){stop();q(".play").textContent="❚❚ Pause";ticker=setInterval(()=>{
    const next=nextAvailable(manifest.frames,index);
    if(next<0 || (!q(".loop").checked && next<=index)){stop();return}
    index=next;draw();
  },Number(q(".speed").value))}
  q(".play").onclick=()=>ticker?stop():start();
  q(".previous").onclick=()=>select(index-1);q(".next").onclick=()=>select(index+1);
  q(".trend-review__timeline").oninput=(e)=>select(Number(e.target.value));
  buttons.onclick=(e)=>{const b=e.target.closest("button[data-index]");if(b)select(Number(b.dataset.index))};
  q(".speed").onchange=()=>{if(ticker)start()};
  q(".shadow-toggle").onchange=draw;q(".shadow-mode").onchange=draw;q(".opacity").oninput=draw;
  draw();
}
let currentArea=null, loadingArea=null, generation=0;
function reconcile(){
  const area=document.getElementById("areaSelect")?.value;
  for(const id of ["area2","area4"]){const el=document.getElementById("local-"+id+"-animation");if(el)el.hidden=area!==id;}
  const standalone=(area==="area8" && document.documentElement.dataset.localVolumeSafety==="area8");
  const panel=document.getElementById(standalone?"local-"+area+"-animation":"volumeTrendPanel");
  if(!panel || (!standalone && panel.classList.contains("is-hidden")) || !registry.areas?.[area]){
    if(mounted || loadingArea){generation++;unmount();currentArea=null;loadingArea=null;} return;
  }
  if(currentArea===area && mounted?.isConnected)return;
  if(loadingArea===area)return;
  unmount();currentArea=null;loadingArea=area;const token=++generation;
  loadArea(area).then(result=>{
    if(token!==generation)return;
    loadingArea=null;
    if(area!==document.getElementById("areaSelect")?.value || !panel.isConnected){reconcile();return}
    if(result){currentArea=area;mount(panel,result.manifest,result.decoded,standalone)}
  }).catch(err=>{if(token===generation){loadingArea=null;console.error("Trend review unavailable",err)}});
}
new MutationObserver(reconcile).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
document.addEventListener("change",e=>{if(e.target?.id==="areaSelect")setTimeout(reconcile,0)});
reconcile();




