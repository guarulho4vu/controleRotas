const CACHE_NAME = 'rotas-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/controlador.html',
    '/styles.css',
    '/controlador.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
    'https://unpkg.com/xlsx/dist/xlsx.full.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache aberto');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Cache antigo removido:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // Estratégia: Network-First para requisições de API
    // Se a requisição for para a sua API, vá para a rede primeiro.
    // Isso garante que você sempre pegue os dados mais recentes.
    if (requestUrl.origin === location.origin && requestUrl.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    // Não armazene respostas da API em cache se não for necessário persistir dados antigos
                    // Ou implemente uma estratégia de cache-then-network ou network-first com fallback
                    return networkResponse;
                })
                .catch(() => {
                    // Opcional: Se a rede falhar, você pode tentar servir algo do cache (se houver)
                    // Mas para APIs que precisam de dados atualizados, isso pode não ser desejável.
                    // Para o seu caso, apenas não capturar a API no cache é suficiente.
                    console.warn('Erro de rede para a API, tentando cache (se disponível) ou retornando erro.');
                    return caches.match(event.request); // Tenta o cache como fallback em caso de rede indisponível
                })
        );
        return; // Sai do listener para não aplicar a regra padrão
    }

    // Estratégia: Cache-First para outros assets estáticos
    // Para todos os outros assets (HTML, CSS, JS, fontes), use a estratégia cache-first
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }

                const fetchRequest = event.request.clone();
                return fetch(fetchRequest).then(
                    (response) => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    }
                );
            })
    );
});

// Seu código de sincronização em background e IndexedDB permanece o mesmo
// ... (sync event listener e funções relatedas)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-routes') {
        event.waitUntil(syncRoutes());
    }
});

async function syncRoutes() {
    try {
        const db = await openDB();
        const pendingRoutes = await db.getAll('pendingRoutes');
        
        for (const route of pendingRoutes) {
            try {
                const response = await fetch('http://localhost:3000/api/rotas', { // Corrigido para a URL completa da API
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(route)
                });

                if (response.ok) {
                    await db.delete('pendingRoutes', route.id);
                }
            } catch (error) {
                console.error('Erro ao sincronizar rota:', error);
            }
        }
    } catch (error) {
        console.error('Erro ao sincronizar rotas:', error);
    }
}

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('RotasDB', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('pendingRoutes')) {
                db.createObjectStore('pendingRoutes', { keyPath: 'id' });
            }
        };
    });
}