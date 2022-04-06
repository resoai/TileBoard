// Installable progressive web app requires fetch handler
self.addEventListener('fetch', function (event) {
   event.respondWith(fetch(event.request));
});
