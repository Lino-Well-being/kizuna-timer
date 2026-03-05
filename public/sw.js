let timerId = null;

self.addEventListener('message', (event) => {
  const { type, duration } = event.data;

  if (type === 'START_TIMER') {
    if (timerId) clearTimeout(timerId);

    timerId = setTimeout(() => {
      self.registration.showNotification('キズナタイマー 🎉', {
        body: 'おつかれさま！タイマーが終わったよ！',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'kizuna-timer-complete',
        requireInteraction: true,
      });
      timerId = null;
    }, duration);
  }

  if (type === 'CANCEL_TIMER') {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('/timer') && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow('/timer');
    })
  );
});
