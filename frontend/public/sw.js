const CACHE_NAME = 'do-you-remember-cache-v1';
const RUNTIME_CACHE_NAME = 'do-you-remember-runtime-v1';

// 미리 캐시할 리소스들
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 설치 시 리소스 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// 활성화 시 이전 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName.startsWith('do-you-remember-') &&
                cacheName !== CACHE_NAME &&
                cacheName !== RUNTIME_CACHE_NAME
              );
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// 네트워크 요청 처리
self.addEventListener('fetch', (event) => {
  // API 요청은 네트워크 우선 전략 사용
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 응답 복사본을 캐시에 저장
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시된 응답 반환
          return caches.match(event.request);
        })
    );
    return;
  }

  // 이미지는 캐시 우선 전략 사용
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          // 응답 복사본을 캐시에 저장
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }

  // 나머지 요청은 네트워크 우선, 실패 시 캐시 사용
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // HTML은 항상 네트워크에서 가져옴
        if (
          !response.ok ||
          event.request.destination === 'document'
        ) {
          throw new Error('Network response was not ok');
        }
        // 응답 복사본을 캐시에 저장
        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // 오프라인 페이지 반환
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
          return new Response('Network error', { status: 408 });
        });
      })
  );
}); 