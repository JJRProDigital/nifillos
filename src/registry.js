const DEFAULT_REGISTRY_URL =
  'https://raw.githubusercontent.com/JJRProDigital/nifillos/master/skills-registry.json';

/** Registry location — overridable with NIFILLOS_SKILLS_REGISTRY for testing/self-hosting. */
export function registryUrl() {
  return process.env.NIFILLOS_SKILLS_REGISTRY || DEFAULT_REGISTRY_URL;
}

/**
 * Fetch the remote skills registry (a JSON decoupling "new skills" from "new CLI
 * versions"). Returns a validated list of entries; throws with a readable
 * message on network/shape errors.
 */
export async function fetchRemoteRegistry() {
  const res = await fetch(registryUrl(), {
    signal: AbortSignal.timeout(10_000),
    headers: { 'User-Agent': 'nifillos-cli' },
  });
  if (!res.ok) {
    throw new Error(`registry HTTP ${res.status}`);
  }
  const data = await res.json();
  if (typeof data !== 'object' || data === null || !Array.isArray(data.skills)) {
    throw new Error('invalid registry shape (expected { version, skills: [...] })');
  }
  const entries = [];
  for (const s of data.skills) {
    if (s && typeof s.id === 'string' && typeof s.url === 'string') {
      entries.push({
        id: s.id,
        description: typeof s.description === 'string' ? s.description : '',
        url: s.url,
        ref: typeof s.ref === 'string' && s.ref ? s.ref : null,
      });
    }
  }
  return entries;
}

/** Find an entry by id in a fetched registry. */
export function resolveRegistryEntry(entries, id) {
  return entries.find((e) => e.id === id) ?? null;
}
