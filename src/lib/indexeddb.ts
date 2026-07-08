const DB_NAME = 'mosaic_studio';
const DB_VERSION = 1;
const STORE_NAME = 'recent_documents';

export interface LocalDocument {
  id: string;
  title: string;
  contentSnippet: string;
  content?: string;
  lastAccessed: number;
}

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveLocalDocument(doc: LocalDocument): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(doc);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('Failed to save to local IndexedDB', e);
  }
}

export async function getLocalDocuments(): Promise<LocalDocument[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        // Sort by most recently accessed
        const docs = (request.result as LocalDocument[]).sort((a, b) => b.lastAccessed - a.lastAccessed);
        resolve(docs);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('Failed to read from local IndexedDB', e);
    return [];
  }
}

export async function deleteLocalDocument(id: string): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('Failed to delete from local IndexedDB', e);
  }
}
