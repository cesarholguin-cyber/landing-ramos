// Adaptador preparado, todavía NO conectado a la página.
// Antes de conectarlo: propiedad del cliente, aviso de privacidad y decisión de consentimiento.
export const analyticsConfig = { enabled: false, measurementId: null };

export function startAnalytics({ config = analyticsConfig, consent = false, win = globalThis.window, doc = globalThis.document } = {}) {
  if (!config.enabled || consent !== true || !win || !doc) return false;
  if (!/^G-[A-Z0-9]+$/.test(config.measurementId ?? '')) throw new Error('Falta un identificador GA4 válido.');
  if (doc.getElementById('ramos-google-tag')) return true;
  win.dataLayer = win.dataLayer || [];
  win.gtag = function () { win.dataLayer.push(arguments); };
  win.gtag('js', new Date());
  // No enviar el texto de WhatsApp, búsquedas, anclas ni parámetros de URL.
  win.gtag('config', config.measurementId, {
    send_page_view: false,
    page_location: win.location.origin + win.location.pathname,
    page_referrer: '',
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  win.gtag('event', 'page_view');
  const script = doc.createElement('script');
  script.id = 'ramos-google-tag';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
  doc.head.appendChild(script);
  return true;
}
