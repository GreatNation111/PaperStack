const DB_NAME = 'paperstack_offline_db';
const STORE_NAME = 'papers';
const DB_VERSION = 1;

export interface OfflinePaperData {
  paperId: string;
  type: 'pdf' | 'html';
  data: ArrayBuffer | string; // ArrayBuffer for PDF, string for HTML
  savedAt: number;
}

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'paperId' });
      }
    };
  });
}

export async function savePaperOffline(paperId: string, type: 'pdf' | 'html', data: ArrayBuffer | string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const offlineData: OfflinePaperData = {
      paperId,
      type,
      data,
      savedAt: Date.now()
    };

    const request = store.put(offlineData);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
}

export async function getOfflinePaper(paperId: string): Promise<OfflinePaperData | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(paperId);

    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
}

export async function removeOfflinePaper(paperId: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(paperId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
}
