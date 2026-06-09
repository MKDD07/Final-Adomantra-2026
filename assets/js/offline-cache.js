/**
 * Adomantra Offline Image Cache
 * Uses IndexedDB to store Pexels images as Blobs for offline availability.
 */

const AdomantraCache = (function() {
    const DB_NAME = 'AdomantraOfflineCache';
    const STORE_NAME = 'pexels_images';
    const DB_VERSION = 1;

    let dbPromise = null;

    function initDB() {
        if (dbPromise) return dbPromise;

        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };

            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => {
                console.error('IndexedDB Error:', e.target.error);
                reject(e.target.error);
            };
        });

        return dbPromise;
    }

    async function get(key) {
        try {
            const db = await initDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(key);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            return null;
        }
    }

    async function set(key, blob) {
        try {
            const db = await initDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.put(blob, key);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            console.warn('Failed to save to IndexedDB', e);
        }
    }

    /**
     * Downloads an image from a URL and stores it as a Blob.
     */
    async function downloadAndCache(key, url) {
        try {
            // Check if already in cache
            const existing = await get(key);
            if (existing) return existing;

            // Fetch from network
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const blob = await response.blob();
            
            // Save to cache
            await set(key, blob);
            
            return blob;
        } catch (error) {
            console.warn('Caching failed for:', url, error);
            return null;
        }
    }

    return {
        get,
        set,
        downloadAndCache,
        createBlobUrl: (blob) => blob ? URL.createObjectURL(blob) : null
    };
})();
