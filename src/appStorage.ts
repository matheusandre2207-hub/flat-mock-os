// Armazenamento no IndexedDB (cota de centenas de MB/GB, não os ~5 MB do localStorage).
// Versão 2: além dos apps, guarda os arquivos de pacotes instalados de pastas.
import type { CustomApp } from './customApps';

const DB_NAME = 'aeroos';
const DB_VERSION = 2;
const APPS = 'apps';
const FILES = 'files';
const LEGACY_KEY = 'os_custom_apps';

export interface FileRecord {
  key: string;      // `${appId}|${caminho}`
  appId: string;
  path: string;
  type: string;
  blob: Blob;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(APPS)) db.createObjectStore(APPS, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(FILES)) db.createObjectStore(FILES, { keyPath: 'key' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => { dbPromise = null; reject(req.error); };
    });
  }
  return dbPromise;
}

function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(db => new Promise<T>((resolve, reject) => {
    const tx = db.transaction(APPS, mode);
    const req = fn(tx.objectStore(APPS));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('abortado'));
  }));
}

export async function loadAllApps(): Promise<CustomApp[]> {
  const list = await run<CustomApp[]>('readonly', s => s.getAll());
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

/** Grava arquivos de um pacote em um único lote (uma transação). */
export async function putFileBatch(records: FileRecord[]): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(FILES, 'readwrite');
    const store = tx.objectStore(FILES);
    for (const r of records) store.put(r);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('abortado'));
  });
}

/** Apaga todos os arquivos de um pacote. */
export async function deleteAppFiles(appId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(FILES, 'readwrite');
    const req = tx.objectStore(FILES).openCursor(IDBKeyRange.bound(appId + '|', appId + '|\uffff'));
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('abortado'));
  });
}
