// Dummy Service Worker
self.addEventListener('fetch', function (event) {
   event.respondWith(
      fetch(event.request),
   );
});
