// IndexedDB survives worker replacement on browsers where worker Cache API
// entries disappear when their creating worker terminates.

let dbPromise = null;
let warned = false;

function warn(error) {
  if (!warned) console.warn('Model cache unavailable; a future visit may download again.', error);
  warned = true;
}

export function getCanonicalKey(key) {
  if (!key) return null;
  const rawUrl = typeof key === 'string' ? key : (key.url || String(key));
  try {
    const clean = rawUrl.split('?')[0].split('#')[0];
    if (clean.startsWith('/models/')) {
      return clean.slice(8);
    }
    const match = clean.match(/^https?:\/\/[^\/]+\/([^\/]+\/[^\/]+)\/(?:resolve|raw)\/[^\/]+\/(.+)$/);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
  } catch {}
  return null;
}

export function openModelDatabase() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('eloquent-model-cache', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('responses');
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => {
        dbPromise = null;
        reject(request.error || e);
      };
      request.onblocked = () => {
        dbPromise = null;
        reject(new Error('Model cache is blocked by another tab.'));
      };
    });
  }
  return dbPromise;
}

function getFromStore(db, key) {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('responses', 'readonly');
      const req = tx.objectStore('responses').get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function getAllKeysFromStore(db) {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('responses', 'readonly');
      const req = tx.objectStore('responses').getAllKeys();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function isModelCached(modelId) {
  try {
    const db = await openModelDatabase();
    const keys = await getAllKeysFromStore(db);
    return keys.some((k) => {
      const s = String(k);
      return s.includes(modelId) && (s.includes('encoder_model.onnx') || s.includes('model.onnx'));
    });
  } catch {
    return false;
  }
}

export function createModelCache() {
  return {
    async match(key) {
      try {
        const rawKey = typeof key === 'string' ? key : (key?.url || String(key));
        const canonicalKey = getCanonicalKey(rawKey);
        const db = await openModelDatabase();

        let entry = null;
        // 1. Try canonical key first
        if (canonicalKey) {
          entry = await getFromStore(db, canonicalKey);
        }

        // 2. Try exact raw key
        if (!entry) {
          entry = await getFromStore(db, rawKey);
        }

        // 3. Fallback: match any existing stored key by canonical form (migrates pre-v32 stored entries)
        if (!entry && canonicalKey) {
          const keys = await getAllKeysFromStore(db);
          const legacyKey = keys.find((k) => getCanonicalKey(k) === canonicalKey);
          if (legacyKey) {
            entry = await getFromStore(db, legacyKey);
            if (entry) {
              try {
                const tx = db.transaction('responses', 'readwrite');
                tx.objectStore('responses').put(entry, canonicalKey);
              } catch {}
            }
          }
        }

        if (entry) {
          const bodyBuffer = entry.body instanceof ArrayBuffer ? entry.body.slice(0) : entry.body;
          const headers = new Headers(entry.headers || []);
          // Ensure content-length is present so Transformers.js skips range request verification
          if (bodyBuffer && !headers.has('content-length')) {
            headers.set('content-length', String(bodyBuffer.byteLength));
          }
          return new Response(bodyBuffer, {
            status: entry.status || 200,
            headers,
          });
        }

        // 4. Reuse any files cached by earlier app versions in CacheStorage
        if (typeof caches !== 'undefined') {
          try {
            const cache = await caches.open('transformers-cache');
            const res = await cache.match(key);
            if (res) return res;
          } catch {}
        }
      } catch (error) {
        warn(error);
      }
      return undefined;
    },

    async put(key, response) {
      try {
        const rawKey = typeof key === 'string' ? key : (key?.url || String(key));
        const canonicalKey = getCanonicalKey(rawKey);
        const db = await openModelDatabase();
        const body = await response.arrayBuffer();

        const headers = [...response.headers];
        if (!headers.some(([k]) => k.toLowerCase() === 'content-length')) {
          headers.push(['content-length', String(body.byteLength)]);
        }

        const entry = {
          body,
          status: response.status,
          headers,
        };

        await new Promise((resolve, reject) => {
          const tx = db.transaction('responses', 'readwrite');
          const store = tx.objectStore('responses');
          const primaryKey = canonicalKey || rawKey;
          store.put(entry, primaryKey);
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error);
        });
      } catch (error) {
        // Quota/private-mode failures must not prevent inference.
        warn(error);
      }
    },
  };
}
