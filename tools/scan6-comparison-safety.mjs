// Local-only comparison safety. Original catalogue and hosted viewers remain unchanged.
const evidence={
 area1:{preview:'area1_C_vs_F_height_change_analysis.png',current:'area1_C_vs_F_gain_loss_classification.png',rows:[[16111.490173,7709.091547,8402.398627],[8085.873451,2562.94704,5522.926411],[7972.621034,4668.25377,3304.367264]]},
 area2:{preview:'area2_C_vs_F_height_change_analysis.png',current:'area2_C_vs_F_gain_loss_classification.png',rows:[[8632.47642,4676.832809,3955.643611],[4730.360842,10485.057461,-5754.696619],[4347.607345,10007.696865,-5660.08952]]},
 area4:{preview:'area4_C_vs_F_height_change_analysis.png',current:'area4_C_vs_F_gain_loss_classification.png',rows:[[9878.417488,4432.723897,5445.693592],[26350.52174,11196.465795,15154.055946],[17582.537194,46363.63622,-28781.099026]]}
};
function tables(payload){const a=[];if(payload?.volumeChangeComparisons)a.push(payload.volumeChangeComparisons);if(Array.isArray(payload?.projects))for(const p of payload.projects)if(p?.volumeChangeComparisons)a.push(p.volumeChangeComparisons);return a;}
export function correctScan6Catalogue(payload){
 for(const table of tables(payload)){
  const areas=table?.scan_06?.areas;if(!areas)continue;
  for(const [id,expected] of Object.entries(evidence)){
   const v=areas[id];if(!v)continue;
   const matches=v.previewBaselineImage===expected.preview&&v.previewCurrentImage===expected.current&&Array.isArray(v.polygons)&&v.polygons.length===expected.rows.length&&v.polygons.every((p,i)=>['gainM3','lossM3','netM3'].every((k,j)=>Number.isFinite(p[k])&&Math.abs(p[k]-expected.rows[i][j])<0.00002));
   if(!matches){delete areas[id];continue;}
   v.baselineSurveyId='2026-06-16';v.previewLabel=`${id.toUpperCase()} Survey 3 to Survey 6 â€” recorded comparison`;
   v.previewBaselineCaption='Recorded Survey 3 to Survey 6 height-change map. Source and scientific validation remain under review.';
   v.previewCurrentCaption='Recorded Survey 3 to Survey 6 gain/loss map. Source and scientific validation remain under review.';
   v.notes='Recorded figures match retained C-to-F CloudCompare reports; source identity, alignment, datum and scientific approval remain under review.';
   for(const p of v.polygons)p.confidence='Recorded report — scientific review pending';
   v.viewerSummary='Existing hosted viewer. Source provenance and scientific review remain pending.';
  }
  const a3=areas.area3;if(a3){if(Array.isArray(a3.polygons))for(const p of a3.polygons)p.confidence='Recorded report — scientific review pending';if(a3.previewBaselineImage?.includes('_E_vs_F_'))a3.previewBaselineImage='';if(a3.previewCurrentImage?.includes('_E_vs_F_'))a3.previewCurrentImage='';a3.viewerSummary='Existing hosted viewer. Source provenance and scientific review remain pending.';}
 }
 return payload;
}
export function protectScan6App(source){
 const marker='  const currentAreaSelection = currentArea();';
 const old=/  const baselineSurvey = volumeDataset\?\.baselineSurveyId\r?\n    \? \(project\.surveys\.find\(\(item\) => item\.id === volumeDataset\.baselineSurveyId\) \|\| activeComparisonSurvey\(project, survey\)\)/g;
 const replacement="  const effectiveVolumeBaseline = volumeDataset?.areas?.[area.id]?.baselineSurveyId || volumeDataset?.baselineSurveyId;\n  const baselineSurvey = effectiveVolumeBaseline\n    ? (project.surveys.find((item) => item.id === effectiveVolumeBaseline) || activeComparisonSurvey(project, survey))";
 const gallery='  return VOLUME_COMPARISON_DEFINITIONS.filter((item) => roundIds.has(item.fromRoundId) && roundIds.has(item.toRoundId));';
 const fallbackGallery='    return VOLUME_COMPARISON_DEFINITIONS.filter((item) => [\"ab\", \"ac\", \"bc\"].includes(item.key));'.replaceAll('\\\"','\"');
 const csv='    ...sharedAreaAssetCandidates(projectId, areaId, \"section_profiles.csv\")'.replaceAll('\\\"','\"');
 if(typeof source!=='string'||source.split(marker).length!==2||[...source.matchAll(old)].length!==1||source.split(gallery).length!==2||source.split(fallbackGallery).length!==2||source.split(csv).length!==2)throw new Error('Unsupported legacy application; Scan 6 safety gate failed closed');
 const guard=`
  // Local review: never silently substitute an older area volume dataset for Scan 6.
  const reviewKey = state.surveyId + ':' + currentAreaSelection?.id;
  const reviewToken = window.__localVolumeToken = (window.__localVolumeToken || 0) + 1;
  const stillCurrent = () => window.__localVolumeToken === reviewToken && state.surveyId + ':' + currentArea()?.id === reviewKey;
  if(window.__localVolumeKey !== reviewKey){window.__localVolumeKey=reviewKey;document.getElementById('volumeViewerFrame')?.removeAttribute('src');const v=document.getElementById('volumeViewerPanel');if(v)v.style.visibility='hidden';const summary=document.getElementById('volumeSummary');if(summary)summary.textContent='Loading the selected survey and area…';}
  const reviewMissingScan6 = state.surveyId === 'scan_06' && ['area1','area2','area3','area4','area5','area6','area7'].includes(currentAreaSelection?.id) && !project.volumeChangeComparisons?.scan_06?.areas?.[currentAreaSelection.id];
  for(const id of ['volumeViewerPanel','volumeTrendPanel','volumeReferencePanel','volumeGuidancePanels','volumeRolloutPanel','volumeMetricGrid']) { const el=document.getElementById(id);if(el)el.style.display=reviewMissingScan6?'none':''; }
  const notice=document.getElementById('local-scan6-review-notice');
  if(notice){notice.hidden=state.surveyId!=='scan_06';notice.textContent=reviewMissingScan6?'Survey 6 volume comparison unavailable or pending source review for this area. Standard survey imagery remains available.':'Local review: shown figures use the explicitly named comparison interval. Survey 5-to-6 flat comparison maps are withheld pending source verification. Area 2 Survey B is unavailable; Area 1 A-to-B covers Dunes only. The hosted 3D viewer is unchanged.';}
  if(reviewMissingScan6){document.getElementById('volumeViewerFrame')?.removeAttribute('src');document.getElementById('volumeSummary').textContent='Survey 6 comparison unavailable or pending review.';try{renderVolumeQuickAreas(liveVolumeAreaIds(project),currentAreaSelection.id)}catch(_){}return;}
 `;
 const layerMarker='async function renderLayers() {';const layerAwait='  const primaryExists = Boolean(primarySrc);';const sectionMarker='async function renderSections() {';const sectionAwait='  const area = applySharedSectionGeometry(baseArea, geometryMap);';const sectionAfter='  const basemapExists = Boolean(basemapPath);';
 for(const part of [layerMarker,layerAwait,sectionMarker,sectionAwait,sectionAfter])if(source.split(part).length!==2)throw new Error('Unsupported imagery or sections renderer');
 source=source.replace(layerMarker,layerMarker+`
  const localLayerToken=window.__localLayerToken=(window.__localLayerToken||0)+1;const localLayerArea=state.areaId,localLayerSurvey=state.surveyId;
  els.viewerTitle.textContent='Loading the selected survey and area…';for(const image of [els.viewerBaseImage,els.viewerGuideDsmImage,els.viewerGuideContourImage,els.viewerOverlayImage,els.viewerHighlightImage,els.viewerSliderImage])image?.removeAttribute('src');`)
 .replace(layerAwait,`  if(window.__localLayerToken!==localLayerToken || state.areaId!==localLayerArea || state.surveyId!==localLayerSurvey)return;
`+layerAwait)
 .replace(sectionMarker,sectionMarker+`
  const localSectionToken=window.__localSectionToken=(window.__localSectionToken||0)+1;const localSectionArea=state.areaId,localSectionSurvey=state.surveyId;els.sectionPanelTitle.textContent='Loading selected section…';`)
 .replace(sectionAwait,`  if(window.__localSectionToken!==localSectionToken || state.areaId!==localSectionArea || state.surveyId!==localSectionSurvey)return;
`+sectionAwait)
 .replace(sectionAfter,`  if(window.__localSectionToken!==localSectionToken || state.areaId!==localSectionArea || state.surveyId!==localSectionSurvey)return;
`+sectionAfter);
 const start=source.indexOf('async function renderVolume() {'),end=source.indexOf('async function renderAdmin() {',start);if(start<0||end<0)throw new Error('Unsupported volume renderer');
 let block=source.slice(start,end);const areaMarker='  const areaDataset = volumeDataset?.areas?.[area.id] || null;';if(block.split(areaMarker).length!==2)throw new Error('Unsupported area dataset');
 for(const boundary of ["  const sharedPolygons = await loadSharedAreaPolygons(project.id, area.id);","  const trendData = await loadTrendData(area.id);","  const comparisonDefinitions = volumeComparisonDefinitions(trendData?.stats, survey.id);"]){if(block.split(boundary).length!==2)throw new Error('Unsupported async volume boundary');block=block.replace(boundary,boundary+"\n  if(!stillCurrent())return;");}
 block=block.replace("  const comparisonDefinitions = volumeComparisonDefinitions(trendData?.stats, survey.id);\n  if(!stillCurrent())return;","  const comparisonDefinitions = volumeComparisonDefinitions(trendData?.stats, survey.id);\n  if(!stillCurrent())return; const reviewViewer=document.getElementById('volumeViewerPanel');if(reviewViewer)reviewViewer.style.visibility='';");
 block=block.replaceAll('survey.shortDate','localSurveyShortDate');block=block.replace(areaMarker,areaMarker+"\n  const localSurveyShortDate = survey.id === 'scan_06' ? (['area2','area3','area5','area8'].includes(area.id) ? '12 Oct 2026' : '29 Oct 2026') : survey.shortDate;");source=source.slice(0,start)+block+source.slice(end);
 return source.replace(marker,marker+guard).replace(old,replacement).replace(csv,"    ...(survey.id === 'scan_06' ? [] : sharedAreaAssetCandidates(projectId, areaId, \"section_profiles.csv\"))").replace(fallbackGallery,"    return VOLUME_COMPARISON_DEFINITIONS.filter((item) => ['ab', 'ac', 'bc'].includes(item.key)).filter(item => !(currentArea()?.id === 'area2' && (item.fromRoundId === 'B' || item.toRoundId === 'B')) && !(currentArea()?.id === 'area1' && item.key === 'ab'));").replace(gallery,"  return VOLUME_COMPARISON_DEFINITIONS.filter((item) => roundIds.has(item.fromRoundId) && roundIds.has(item.toRoundId)).filter(item => !(state.surveyId === 'scan_06' && item.key === 'ef') && !(currentArea()?.id === 'area2' && (item.fromRoundId === 'B' || item.toRoundId === 'B')) && !(currentArea()?.id === 'area1' && item.key === 'ab'));");
}
export function addScan6Notice(html){const marker='<div id="volumeSandboxBanner" class="notice-banner section-gap"></div>';if(html.split(marker).length!==2)throw new Error('Unsupported legacy page');const pano='<p id="panoramaSummary" class="muted">Panorama guidance for the selected area will appear here.</p>';if(html.split(pano).length!==2)throw new Error('Unsupported panorama notice location');
 return html.replace(pano,pano+'<p id="local-pano-review-notice" class="notice-banner" hidden>Scan 6 panorama content is not verified; this existing tour may be from an earlier survey.</p>').replace(marker,marker+'<div id="local-scan6-review-notice" role="status" class="notice-banner section-gap" hidden></div>').replace('</body>',`<div id="local-contour-review-notice" role="status" hidden style="position:fixed;left:1rem;bottom:1rem;z-index:9999;max-width:32rem;padding:10px;background:#493821;color:#fff1c7;border:1px solid #cc9a41;border-radius:8px">Area 3 Survey 6 contours are withheld pending verification: the local and Processing Hub exports differ. Other imagery remains available.</div><script>(function(){function u(){let n=document.getElementById('local-contour-review-notice'),a=document.getElementById('areaSelect'),s=document.getElementById('surveySelect');if(n)n.hidden=!(a?.value==='area3'&&s?.value==='scan_06');let p=document.getElementById('local-pano-review-notice');if(p)p.hidden=s?.value!=='scan_06'}document.addEventListener('change',u);document.addEventListener('DOMContentLoaded',u);new MutationObserver(u).observe(document.documentElement,{childList:true,subtree:true});})();</script></body>`);}
// A differing contour export cannot be selected as verified Scan 6 imagery.
export function withheldScan6Asset(pathname){
 // Area 2 Survey B was a high-tide washout; do not expose its section measurements as valid.
 if (/^\/(?:survey-data\/padstow-estuary\/2026-04-18\/area2|public\/projects\/padstow-estuary\/assets\/(?:maps|reports|stats)\/2026-04-18\/area2)\/(?:area2_)?section_profiles\.(?:csv|qmd)$/i.test(pathname)) return true;
 return /^\/public\/projects\/padstow-estuary\/assets\/(maps|reports|stats)\/scan_06\/area3\/contours?\.png$/i.test(pathname);
}
