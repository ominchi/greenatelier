/* eslint-disable no-restricted-globals */
/* global workbox */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
  console.log('Workbox loaded successfully');

  /* eslint-disable no-undef */
  // キャッシュ戦略を設定
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

  // 画像をキャッシュ（CacheFirst戦略）
  workbox.routing.registerRoute(
    /\.(?:png|jpg|jpeg|svg)$/,
    new workbox.strategies.CacheFirst({
      cacheName: 'image-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30日
        }),
      ],
    })
  );

  // その他のリソース（StaleWhileRevalidate戦略）
  workbox.routing.registerRoute(
    /\.(?:js|css|html)$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources',
    })
  );
  /* eslint-enable no-undef */

  // カスタムキャッシュ
  const customCache = [
    '/images/room.jpg',
    '/images/monstera.png',
    '/images/dracaena.png',
    '/images/pachira.png',
    '/images/icon-192x192.png',
    '/images/icon-512x512.png',
    '/images/room1.jpg',
    '/images/room2.jpg',
    '/images/room3.jpg',
  ];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('green-atelier-cache-v1').then((cache) => {
        console.log('Caching custom files');
        return cache.addAll(customCache);
      })
    );
  });
} else {
  console.log('Workbox failed to load');
}