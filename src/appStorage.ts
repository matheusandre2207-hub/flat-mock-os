// Apps importados ficam no IndexedDB (cota de centenas de MB), e não no localStorage (~5 MB).
import type { CustomApp } from './customApps';

const DB_NAME = 'aeroos';
const STORE = 'apps';
const LEGACY_KEY = 'os_custom_apps';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => { dbPromise = null; reject(req.error); };
    });
  }
  return dbPromise;
}

function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(db => new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('abortado'));
  }));
}

export async function loadAllApps(): Promise<CustomApp[]> {
  const list = await run<CustomApp[]>('readonly', s => s.getAll());
  // Migra apps guardados no formato antigo (localStorage)
  try {
    const old = JSON.parse(localStorage.getItem(LEGACY_KEY) || '[]');
    if (Array.isArray(old) && old.length) {
      for (const app of old) await putApp(app);
      localStorage.removeItem(LEGACY_KEY);
      return [...list, ...old.filter((a: CustomApp) => !list.some(b => b.id === a.id))];
    }
  } catch { /* sem migração */ }
  return list;
}

export function putApp(app: CustomApp): Promise<void> {
  return run('readwrite', s => s.put(app)).then(() => undefined);
}

export function deleteApp(id: string): Promise<void> {
  return run('readwrite', s => s.delete(id)).then(() => undefined);
}
