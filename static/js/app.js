if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker зареєстровано!', reg.scope))
      .catch(err => console.log('Помилка реєстрації:', err));
  });
}


