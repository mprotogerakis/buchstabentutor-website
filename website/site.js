(() => {
  const year = String(new Date().getFullYear());
  document.querySelectorAll('[data-role="year"]').forEach((el) => {
    el.textContent = year;
  });

  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  if (!form || !statusEl) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  if (status === 'ok') {
    statusEl.textContent = 'Danke! Deine Nachricht wurde gesendet.';
  } else if (status === 'error') {
    statusEl.textContent =
      'Senden fehlgeschlagen. Bitte nutze lernapps@icloud.com als Alternative.';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    statusEl.textContent = 'Wird gesendet ...';

    const formData = new FormData(form);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        statusEl.textContent = data.error || 'Senden fehlgeschlagen.';
        return;
      }

      form.reset();
      statusEl.textContent = 'Danke! Deine Nachricht wurde gesendet.';
    } catch {
      statusEl.textContent = 'Netzwerkfehler. Bitte später erneut versuchen.';
    }
  });
})();
