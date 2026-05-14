const DB_NAME = 'paperstack_offline_db';
const STORE_NAME = 'papers';
const DB_VERSION = 1;

export interface OfflinePaperData {
  paperId: string;
  type: 'pdf' | 'html';
  data: Blob | ArrayBuffer | string; // Blob/ArrayBuffer for PDF, string for HTML
  savedAt: number;
  title?: string;
  size?: number;
  contentType?: string;
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

export async function savePaperOffline(
  paperId: string,
  type: 'pdf' | 'html',
  data: Blob | ArrayBuffer | string,
  metadata: { title?: string; contentType?: string } = {}
): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const storedData = type === 'pdf' && data instanceof ArrayBuffer
      ? new Blob([data], { type: metadata.contentType || 'application/pdf' })
      : data;
    
    const offlineData: OfflinePaperData = {
      paperId,
      type,
      data: storedData,
      savedAt: Date.now(),
      title: metadata.title,
      contentType: metadata.contentType || (storedData instanceof Blob ? storedData.type : undefined),
      size: storedData instanceof Blob ? storedData.size : data instanceof ArrayBuffer ? data.byteLength : undefined
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

/**
 * Returns a list of all papers stored locally in IndexedDB.
 * This is the true offline source of truth. It reads what's
 * physically on the device, no network needed.
 */
export async function getAllOfflinePapers(): Promise<OfflinePaperData[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}
