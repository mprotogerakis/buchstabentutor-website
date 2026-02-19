(() => {
  const year = String(new Date().getFullYear());
  document.querySelectorAll('[data-role="year"]').forEach((el) => {
    el.textContent = year;
  });

  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const widgetContainer = document.getElementById('turnstile-widget');
  if (!form || !statusEl) {
    return;
  }

  let turnstileWidgetId = null;
  let turnstileReady = false;

  const setFormEnabled = (enabled) => {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = !enabled;
    }
  };

  const waitForTurnstile = async () => {
    for (let i = 0; i < 40; i += 1) {
      if (window.turnstile && typeof window.turnstile.render === 'function') {
        return true;
      }
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return false;
  };

  const initializeTurnstile = async () => {
    if (!widgetContainer) {
      return;
    }
    setFormEnabled(false);
    statusEl.textContent = 'Lade Spam-Schutz ...';

    const turnstileLoaded = await waitForTurnstile();
    if (!turnstileLoaded) {
      statusEl.textContent = 'Spam-Schutz konnte nicht geladen werden.';
      return;
    }

    let siteKey = '';
    try {
      const response = await fetch('/api/contact-config', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      const data = await response.json();
      siteKey = String(data.siteKey || '');
    } catch {
      siteKey = '';
    }

    if (!siteKey) {
      statusEl.textContent = 'Turnstile ist nicht konfiguriert.';
      return;
    }

    turnstileWidgetId = window.turnstile.render(widgetContainer, {
      sitekey: siteKey,
      action: 'contact_form',
      callback: () => {
        turnstileReady = true;
        statusEl.textContent = '';
      },
      'expired-callback': () => {
        turnstileReady = false;
        statusEl.textContent = 'Bitte Spam-Schutz erneut bestätigen.';
      },
      'error-callback': () => {
        turnstileReady = false;
        statusEl.textContent = 'Spam-Schutz konnte nicht geprüft werden.';
      },
    });

    setFormEnabled(true);
  };

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

    if (!turnstileReady) {
      statusEl.textContent = 'Bitte zuerst den Spam-Schutz bestätigen.';
      return;
    }

    statusEl.textContent = 'Wird gesendet ...';
    setFormEnabled(false);

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
        if (window.turnstile && turnstileWidgetId !== null) {
          window.turnstile.reset(turnstileWidgetId);
          turnstileReady = false;
        }
        setFormEnabled(true);
        return;
      }

      form.reset();
      if (window.turnstile && turnstileWidgetId !== null) {
        window.turnstile.reset(turnstileWidgetId);
      }
      turnstileReady = false;
      setFormEnabled(true);
      statusEl.textContent = 'Danke! Deine Nachricht wurde gesendet.';
    } catch {
      setFormEnabled(true);
      statusEl.textContent = 'Netzwerkfehler. Bitte später erneut versuchen.';
    }
  });

  void initializeTurnstile();
})();
