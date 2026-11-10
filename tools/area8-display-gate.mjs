// Local-review safety boundary. The live site and hosted 3D viewers are untouched.
const marker = '  const currentAreaSelection = currentArea();';
const insert = `
  // Withhold the entire Area 8 volume panel while the historical E-F provenance is unsafe.
  const area8Blocked = currentAreaSelection?.id === "area8";
  document.documentElement.dataset.localVolumeSafety = area8Blocked ? "area8" : "clear";
  if (area8Blocked) {
    document.getElementById("volumeViewerFrame")?.removeAttribute("src");
    try { renderVolumeQuickAreas(liveVolumeAreaIds(project), currentAreaSelection.id); } catch (_) {}
    return;
  }
`;
export function protectApp(source) {
  if (typeof source !== 'string' || source.split(marker).length !== 2 || !source.includes('async function renderVolume()')) throw new Error('Unsupported monitoring application; volume display is blocked');
  return source.replace(marker, marker + insert);
}
export function protectHtml(source) {
  const marker='<div id="volumeSandboxBanner" class="notice-banner section-gap"></div>';
  if (typeof source !== 'string' || source.split('</head>').length !== 2 || source.split('</body>').length !== 2 || source.split(marker).length !== 2) throw new Error('Unsupported monitoring page; volume display is blocked');
  const head=`<style id="local-area8-safety-style">
html[data-local-volume-safety="pending"] [data-panel="volume"] { visibility:hidden!important }
html[data-local-volume-safety="area8"] [data-panel="volume"] > :not(.volume-hero),
html[data-local-volume-safety="area8"] #volumeSummary,
html[data-local-volume-safety="area8"] #volumeSandboxBanner,
html[data-local-volume-safety="area8"] #volumeMetricGrid {display:none!important}
#local-area8-safety-notice {display:none}
html[data-local-volume-safety="area8"] #local-area8-safety-notice {display:block;padding:14px;margin-top:12px;border:1px solid #cc9a41;border-radius:10px;background:#493821;color:#fff1c7}
</style><script>document.documentElement.dataset.localVolumeSafety="pending";</script>`;
  return source.replace('</head>',head+'</head>').replace(marker,marker+'<div id="local-area8-safety-notice" role="alert"><strong>Historical Area 8 comparisons withheld</strong><p>Historical Survey 5 to 6 records are mislabelled. Existing Area 8 figures, maps, trends and the embedded 3D view remain blocked. The new experimental review below is internal only.</p><div id="local-area8-animation"></div><details><summary>Open experimental Area 8 visual review</summary><div id="local-area8-experiment"><p><a href="#local-area8-animation">Return to the combined animation</a></p><p data-status>Experimental results are checked when opened.</p><p>Area: <button type="button" data-scope="central" disabled>Central</button> <button type="button" data-scope="padstow" disabled>Padstow</button> <button type="button" data-scope="wadebridge" disabled>Wadebridge</button></p><p>View: <button type="button" data-mode="difference" disabled>Change</button> <button type="button" data-mode="coverage" disabled>Coverage</button> <button type="button" data-mode="samples" disabled>Sample counts</button></p><img alt="Experimental review" hidden style="max-width:100%;height:auto"></div></details></div><script type="module" src="/__trend_review/area8-review-panel.mjs"></script>');
}
export function redactComparisons(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Unsupported comparison payload');
  const tables=[];
  if (payload.volumeChangeComparisons && typeof payload.volumeChangeComparisons === 'object') tables.push(payload.volumeChangeComparisons);
  if (Array.isArray(payload.projects)) for (const p of payload.projects) if (p?.volumeChangeComparisons && typeof p.volumeChangeComparisons === 'object') tables.push(p.volumeChangeComparisons);
  if (!tables.length && !Array.isArray(payload.projects)) throw new Error('Missing comparison catalogue');
  for (const table of tables) for (const entry of Object.values(table)) if (entry?.areas && typeof entry.areas === 'object') delete entry.areas.area8;
  return payload;
}
