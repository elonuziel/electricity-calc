const CACHE_NAME = 'electricity-calc-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './css/style.css',
    './css/tailwind.min.css',
    './css/font-awesome.min.css',
    './css/webfonts/fa-solid-900.woff2',
    './css/webfonts/fa-regular-400.woff2',
    './css/webfonts/fa-brands-400.woff2',
    './js/state.js',
    './js/ui.js',
    './js/app.js',
    './js/services/cloud.js',
    './js/services/csv.js',
    './icon-192.png',
    './icon-512.png',
    './apple-icon-180.png',
    './manifest-icon-192.maskable.png',
    './manifest-icon-512.maskable.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            // Use addAll, ignoring individual failures if one file is missing
            return Promise.all(
                ASSETS_TO_CACHE.map((url) => {
                    return cache.add(url).catch((err) => {
                        console.error(`Failed to cache ${url}:`, err);
                    });
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached response if found, else fetch from network
            return response || fetch(event.request);
        }).catch(() => {
            // If both cache and network fail, we are completely offline and haven't cached it.
            // It's a best-effort strategy.
        })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
