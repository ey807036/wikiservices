// Wiki Services push notification service worker
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "Wiki Services", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Wiki Services";
  const options = {
    body: data.body || "",
    icon: data.icon || "/favicon.ico",
    badge: data.badge || "/favicon.ico",
    image: data.image,
    tag: data.tag || "wiki-notification",
    data: { url: data.url || "/" },
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.postMessage({ type: "navigate", url });
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
