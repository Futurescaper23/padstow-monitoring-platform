// Customer responses must not expose local evidence, credentials or machine paths.
export function isPrivateRequest(pathname) {
  let value; try { value=decodeURIComponent(pathname).replaceAll('\\','/'); } catch { return true; }
  const parts=value.split('/').filter(Boolean).map(x=>x.toLowerCase());
  if(parts.some(x=>x==='.'||x==='..'||x.startsWith('.')))return true;
  if(['release-evidence','tools','test','tests','docs'].includes(parts[0]))return true;
  return parts[0]==='data' && parts[1]==='access-users.json';
}
export function redactMachinePaths(value) {
  if(typeof value==='string')return /(?:^|[^a-z0-9])[a-z]:[\\/]|(?:^|[^a-z0-9])\\\\[^\\]+\\|file:\/\/|(?:^|[\s"'=])\/(?:home|users|mnt|tmp)\//i.test(value)?'[local path withheld]':value;
  if(Array.isArray(value))return value.map(redactMachinePaths);
  if(value && typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,redactMachinePaths(v)]));
  return value;
}