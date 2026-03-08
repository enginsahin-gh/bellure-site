(function () {
  var cfg = window.BELLURE_ANALYTICS || {};

  if (cfg.provider === 'cloudflare' && cfg.cfBeaconToken) {
    var cf = document.createElement('script');
    cf.defer = true;
    cf.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    cf.dataset.cfBeacon = JSON.stringify({ token: cfg.cfBeaconToken });
    document.head.appendChild(cf);
  }

  if (cfg.provider === 'plausible' && cfg.plausibleDomain) {
    var pl = document.createElement('script');
    pl.defer = true;
    pl.src = 'https://plausible.io/js/script.js';
    pl.setAttribute('data-domain', cfg.plausibleDomain);
    document.head.appendChild(pl);
  }

  if (cfg.provider === 'ga4' && cfg.gaMeasurementId) {
    var ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + cfg.gaMeasurementId;
    document.head.appendChild(ga);

    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', cfg.gaMeasurementId, { anonymize_ip: true });
  }
})();
