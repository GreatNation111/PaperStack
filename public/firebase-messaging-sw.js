importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAW02_7RDWZEZl7osaIW9mxEVGDSJxpK4k",
    authDomain: "paperstack-96201.firebaseapp.com",
    projectId: "paperstack-96201",
    storageBucket: "paperstack-96201.firebasestorage.app",
    messagingSenderId: "437115304573",
    appId: "1:437115304573:web:0140d4e05d02567e7b0f14"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification?.title || "New Notification";
    const notificationOptions = {
        body: payload.notification?.body,
        icon: '/pwa-192x192.png',
        data: payload.data,
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click received.');
    event.notification.close();

    const targetUrl = new URL('/notifications', self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // If a window is already open, focus it and navigate
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                } else if ('navigate' in client && 'focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            // If no window is open, launch a new one deeply linked to the notifications page
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
