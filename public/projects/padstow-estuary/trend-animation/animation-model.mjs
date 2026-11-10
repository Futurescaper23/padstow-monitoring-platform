export function available(frame) {
  return !!frame && ["provisional", "validated", "experimental"].includes(frame.status) && typeof frame.image === "string" && frame.image.length > 0;
}
export function nextAvailable(frames, index) {
  for (let step = 1; step <= frames.length; step++) {
    const candidate = (index + step) % frames.length;
    if (available(frames[candidate])) return candidate;
  }
  return -1;
}
// A missing interval breaks the historical chain; never carry a shadow across it.
export function contiguousHistory(frames,index,max=4) {
  if(!Array.isArray(frames)||!Number.isInteger(index)||index<0||index>=frames.length||!Number.isInteger(max)||max<0) throw new Error("Invalid history");
  const out=[];for(let i=index-1;i>=0&&out.length<max;i--){if(!available(frames[i]))break;out.push(i)}return out;
}
export function daysBetween(a, b) {
  const valid = d => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isFinite(Date.parse(d+"T00:00:00Z")) && new Date(d+"T00:00:00Z").toISOString().slice(0,10)===d;
  if (!valid(a) || !valid(b)) return null;
  const start=Date.parse(a+"T00:00:00Z"), end=Date.parse(b+"T00:00:00Z");
  return end>=start ? (end-start)/86400000 : null;
}
// Gaps are supplied explicitly by evidence; no gap or measurement is inferred.
export function describeInterval(frame) {
  const days=daysBetween(frame.fromDate,frame.toDate);
  const dates=days===null?"Exact survey dates require confirmation":frame.fromDate+" to "+frame.toDate+" · "+days+" days";
  const reasons={unusable:"unusable", "not-observed":"not observed", "not-included":"not included", unknown:"status unconfirmed"};
  if(frame.skippedSurveys!==undefined && !Array.isArray(frame.skippedSurveys)) throw new Error("Invalid skipped-survey list");
  const gaps=Array.isArray(frame.skippedSurveys)?frame.skippedSurveys.map(x=>{
    if(!x || typeof x.survey!=="string" || !x.survey.trim() || !Object.hasOwn(reasons,x.status)) throw new Error("Invalid skipped-survey record");
    return x.survey+" ("+reasons[x.status]+")";
  }):[];
  return dates+(gaps.length?" · Skipped: "+gaps.join(", "):"")+" · "+frame.status;
}
export function validateReviewManifest(manifest,areaId){
  if(!manifest || manifest.areaId!==areaId || !Array.isArray(manifest.frames) || manifest.frames.length>100) return false;
  if(!manifest.frames.length) return manifest.state==="awaiting-verified-comparisons";
  if (manifest.colourEncoding!==undefined && !["red-positive","blue-positive"].includes(manifest.colourEncoding)) return false;
  if (manifest.frames.some(f=>f?.status==="experimental") && (typeof manifest.warning!=="string" || !manifest.warning.includes("EXPERIMENTAL"))) return false;
  const g=manifest.grid;
  if(!g || !Number.isInteger(g.width) || !Number.isInteger(g.height) || g.width<=0 || g.height<=0 || g.width*g.height>4000000) return false;
  try { for(const frame of manifest.frames){if(!frame || typeof frame.pair!=="string" || typeof frame.label!=="string" || !["provisional","validated","experimental","unavailable"].includes(frame.status))return false; describeInterval(frame);} } catch {return false}
  return true;
}

// RGBA visualization only: history is clipped to current occupied pixels.
// Total overlay alpha never exceeds 22.5%; earlier intervals fade by half.
export function progressiveShadow(current, preceding, strength = 1, firstWeight = 0.12) {
  if (!current || current.length % 4 || !Number.isFinite(strength) || strength < 0 || strength > 1 ||
      !Number.isFinite(firstWeight) || firstWeight < 0 || firstWeight > 0.22 ||
      preceding.length > 4 || firstWeight * (2 - 2 * Math.pow(0.5,preceding.length)) > 0.225000001 ||
      preceding.some(p => !p || p.length !== current.length)) throw new Error("Invalid shadow input");
  const output = new Uint8ClampedArray(current.length);
  const up = [[248,213,103],[231,174,76],[194,139,61],[155,105,48]];
  const down = [[212,138,248],[176,112,220],[139,87,184],[107,68,147]];
  for (let i=0; i<current.length; i+=4) {
    if (!current[i+3]) continue;
    let weight=0, red=0, green=0, blue=0;
    for (let age=0; age<preceding.length; age++) {
      const p=preceding[age]; if (!p[i+3] || p[i]===p[i+2]) continue;
      const col=(p[i]>p[i+2]?up:down)[Math.min(age,3)];
      const w=firstWeight*Math.pow(0.5,age)*strength;
      red+=col[0]*w; green+=col[1]*w; blue+=col[2]*w; weight+=w;
    }
    if(weight){ output[i]=red/weight; output[i+1]=green/weight; output[i+2]=blue/weight; output[i+3]=Math.round(255*weight); }
  }
  return output;
}

// The saved review PNGs encode the earlier red-positive palette. Remap only
// presentation pixels: positive -> blue, negative -> red, no-data unchanged.
export function viewerColours(source) {
  if (!source || source.length % 4) throw new Error("Invalid review pixels");
  const out=new Uint8ClampedArray(source);
  for(let i=0;i<source.length;i+=4){
    const r=source[i], b=source[i+2];
    if(!source[i+3] || r===b) continue;
    const positive=r>b, k=Math.min(1, Math.abs(r-b)/(positive?166:155));
    const target=positive?[36,101,191]:[211,46,45];
    for(let c=0;c<3;c++) out[i+c]=Math.round(235+(target[c]-235)*k);
  }
  return out;
}

// Convert only presentation and shadow classification; never change stored measurements.
export function reviewPixels(source,encoding="red-positive") {
  if(!source || source.length%4 || !["red-positive","blue-positive"].includes(encoding)) throw new Error("Invalid pixel encoding");
  const raw=new Uint8ClampedArray(source);
  if(encoding==="blue-positive") {for(let i=0;i<raw.length;i+=4){const red=raw[i];raw[i]=raw[i+2];raw[i+2]=red;} return {raw,display:new Uint8ClampedArray(source)};}
  return {raw,display:viewerColours(source)};
}
export function footprintRowBounds(frames,width,height){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<=0||height<=0||!Array.isArray(frames))throw new Error('Invalid footprint grid');
 const lo=new Int32Array(height).fill(width), hi=new Int32Array(height).fill(-1);
 for(const raw of frames){if(!raw)continue;if(raw.length!==width*height*4)throw new Error('Frame grid mismatch');
  for(let y=0;y<height;y++){let left=width,right=-1;const start=y*width*4;for(let x=0;x<width;x++)if(raw[start+x*4+3]){left=Math.min(left,x);right=x}if(right>=0){lo[y]=Math.min(lo[y],left);hi[y]=Math.max(hi[y],right)}}}
 return {lo,hi,width,height};
}
export function rotatedFootprintBounds(rows,angle){
 if(!rows||!Number.isFinite(angle))throw new Error('Invalid rotation');const a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a);let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
 for(let y=0;y<rows.height;y++){if(rows.hi[y]<0)continue;for(const x of [rows.lo[y],rows.hi[y]+1])for(const yy of [y,y+1]){const rx=c*x-s*yy,ry=s*x+c*yy;minX=Math.min(minX,rx);maxX=Math.max(maxX,rx);minY=Math.min(minY,ry);maxY=Math.max(maxY,ry)}}
 if(!Number.isFinite(minX))return null;return {minX,minY,maxX,maxY,width:maxX-minX,height:maxY-minY};
}
export function fitFootprint(bounds,viewportWidth,viewportHeight,margin=0.04){
 if(!bounds||![viewportWidth,viewportHeight,margin].every(Number.isFinite)||viewportWidth<=0||viewportHeight<=0||margin<0||margin>=0.5||bounds.width<=0||bounds.height<=0)throw new Error('Invalid fit');
 const scale=Math.min(viewportWidth*(1-2*margin)/bounds.width,viewportHeight*(1-2*margin)/bounds.height);
 return {scale,tx:(viewportWidth-scale*(bounds.minX+bounds.maxX))/2,ty:(viewportHeight-scale*(bounds.minY+bounds.maxY))/2};
}
