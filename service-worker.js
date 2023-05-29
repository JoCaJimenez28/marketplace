self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('my-cache').then(function(cache) {
        return cache.addAll([
          '/',
          '/views/shop/index.ejs',
          '/public/css/main.css',
          '/public/js/main.js',
          '/public/images/',
          '/views/includes/navigation.ejs',
          '/views/includes/carrusel.ejs'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });