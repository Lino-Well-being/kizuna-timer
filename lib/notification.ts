let swRegistration: ServiceWorkerRegistration | null = null;

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    swRegistration = registration;
    return registration;
  } catch {
    return null;
  }
}

export async function scheduleTimerNotification(seconds: number): Promise<void> {
  const registration = swRegistration || await registerServiceWorker();
  if (!registration?.active) return;

  registration.active.postMessage({
    type: 'START_TIMER',
    duration: seconds * 1000,
  });
}

export async function cancelTimerNotification(): Promise<void> {
  const registration = swRegistration || await registerServiceWorker();
  if (!registration?.active) return;

  registration.active.postMessage({ type: 'CANCEL_TIMER' });
}
