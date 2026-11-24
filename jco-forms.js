/* JCO UTM tracker v1.8 — loaded from GitHub Pages via <script defer> in the Kajabi header.
 *     Leest utm_* uit de URL, bewaart ze 30 dagen in cookie "jco_src" (laatste klik telt)
 *     en vult het verborgen formulierveld "Lead source" in elk Kajabi-formulier.
 *     Waarde-formaat: source|medium|campaign|content|term  (bijv. chatgpt|cpc|cmpn_123|ad_456, of google|cpc|123|456|kajabi_template))
 *     v1.2: hasht (SHA-256) het e-mailadres bij een opt-in en geeft die hash op de volgende
 *     pagina's (ook de bedankpagina na de dubbele opt-in) aan de ChatGPT-pixel.
 *     v1.3: hash 7 dagen in localStorage, zodat het ook werkt als de bevestigingslink
 *     uit de e-mail een nieuw tabblad opent. 
 *     v1.4: utm_term toegevoegd; gclid 90 dagen in cookie "jco_gclid", gevuld in veld
 *     "Google click ID" (custom_51).
 *     v1.5: draait via jcoWhenGranted: in Europa pas na Accept (geen cookies, geen e-mailhash
 *     zonder toestemming). De CSS die de velden verbergt werkt altijd.
 *     v1.6: zonder utm_source leidt het script de bron af uit de referrer (bijv. youtube,
 *     instagram, linkedin, google, chatgpt) en bewaart die als bron|medium|referrer.
 *     Een bron uit een UTM (bijv. een advertentie) wordt nooit overschreven door een referrer;
 *     een eerdere referrer-bron wel (laatste klik telt). Eigen domeinen en Kajabi tellen niet mee.
 *     v1.7: geen UTM, geen externe referrer en nog geen eerdere bron? Dan wordt de bron
 *     "direct|none|direct". Een latere referrer of UTM overschrijft die gewoon. Een leeg veld
 *     betekent vanaf nu: het script heeft niet gedraaid (bijv. geen toestemming in Europa).
 *     v1.8: bij het invullen komt de pagina van het formulier er als 6e deel achter,
 *     bijv. google|cpc|123|456|kajabi_template|/nexus of direct|none|direct|||/kajabi-templates.
 *     De pagina staat niet in de cookie, dus het is altijd de pagina van DIT formulier.
 *     LET OP: dit script moet ONDER de ChatGPT pixel-code (oaiq init) in de header staan. 
 */
(window.jcoWhenGranted || function (f) { f(); })(function () {
  var COOKIE = 'jco_src';
  var DAYS = 30;
  var FIELD = 'lead source';

  function param(name) {
    try { return new URLSearchParams(window.location.search).get(name) || ''; }
    catch (e) { return ''; }
  }
  function clean(v) { return String(v).replace(/[|;,\s]+/g, '_').slice(0, 80); }
  function setCookie(value) {
    var d = new Date();
    d.setTime(d.getTime() + DAYS * 864e5);
    document.cookie = COOKIE + '=' + encodeURIComponent(value) +
      '; expires=' + d.toUTCString() + '; path=/; SameSite=Lax; Secure';
  }
  function getCookie() {
    var m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }

  // 1. UTM uitlezen en opslaan (alleen als utm_source aanwezig is)
  var source = param('utm_source');
  if (source) {
    setCookie([source, param('utm_medium'), param('utm_campaign'), param('utm_content'), param('utm_term')]
      .map(clean).join('|'));
  }

  // 1a. Geen UTM: bron afleiden uit de referrer (v1.6)
  function refSource(host) {
    var h = host.replace(/^www\./, '');
    var map = [
      [/(^|\.)(youtube\.com|youtu\.be)$/, 'youtube', 'social'],
      [/(^|\.)instagram\.com$/, 'instagram', 'social'],
      [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, 'facebook', 'social'],
      [/(^|\.)(linkedin\.com|lnkd\.in)$/, 'linkedin', 'social'],
      [/(^|\.)(t\.co|x\.com|twitter\.com)$/, 'x', 'social'],
      [/(^|\.)pinterest\./, 'pinterest', 'social'],
      [/(^|\.)tiktok\.com$/, 'tiktok', 'social'],
      [/(^|\.)(chatgpt\.com|chat\.openai\.com)$/, 'chatgpt', 'ai'],
      [/(^|\.)perplexity\.ai$/, 'perplexity', 'ai'],
      [/(^|\.)claude\.ai$/, 'claude', 'ai'],
      [/^gemini\.google\.com$/, 'gemini', 'ai'],
      [/(^|\.)google\./, 'google', 'organic'],
      [/(^|\.)bing\.com$/, 'bing', 'organic'],
      [/(^|\.)duckduckgo\.com$/, 'duckduckgo', 'organic'],
      [/(^|\.)yahoo\./, 'yahoo', 'organic']
    ];
    for (var i = 0; i < map.length; i++) {
      if (map[i][0].test(h)) return [map[i][1], map[i][2]];
    }
    return [h, 'referral'];
  }
  if (!source) {
    var refHost = '';
    try { refHost = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : ''; } catch (e) {}
    var own = /(^|\.)(jiffycoursesonline\.com|kajabi\.com|mykajabi\.com|stripe\.com|paypal\.com)$/;
    if (refHost && !own.test(refHost)) {
      var current = getCookie();
      // Alleen invullen als er nog niets is, of als het vorige een referrer- of direct-bron was
      var kind = current ? current.split('|')[2] : '';
      if (!current || kind === 'referrer' || kind === 'direct') {
        var rs = refSource(refHost);
        setCookie([rs[0], rs[1], 'referrer'].map(clean).join('|'));
      }
    }
  }

  // 1c. Niets bekend: markeer als direct (v1.7)
  if (!source && !getCookie()) {
    setCookie('direct|none|direct');
  }

  // 1b. Google click-ID apart opslaan (90 dagen, niet ingekort)
  var gclid = param('gclid');
  if (gclid) {
    var g = new Date(); g.setTime(g.getTime() + 90 * 864e5);
    document.cookie = 'jco_gclid=' + encodeURIComponent(gclid) +
      '; expires=' + g.toUTCString() + '; path=/; SameSite=Lax; Secure';
  }
  function getGclid() {
    var m = document.cookie.match(/(?:^|; )jco_gclid=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : '';
  }

  // 2. Het Lead source-veld herkennen: custom_50, of anders placeholder/label "Lead source"
  function isLeadField(input) {
    if (input.name === 'form_submission[custom_50]') return true;
    if ((input.getAttribute('placeholder') || '').trim().toLowerCase() === FIELD) return true;
    var label = input.id ? document.querySelector('label[for="' + input.id + '"]') : null;
    return !!(label && label.textContent.trim().toLowerCase() === FIELD);
  }
  // v1.8: bron aanvullen tot 5 delen en de huidige pagina als 6e deel toevoegen
  function withPage(v) {
    var p = String(v).split('|');
    while (p.length < 5) p.push('');
    p.length = 5;
    p.push(clean(window.location.pathname || '/'));
    return p.join('|').slice(0, 250);
  }
  function hide(input) {
    var wrap = input.closest('.form-group, .form__group, .text-field') || input;
    wrap.style.display = 'none';
  }

  // 3. Veld vullen; leeg alleen als er geen cookie is (script niet gedraaid of cookies geblokkeerd)
  function fill(form) {
    if (!form || !form.querySelectorAll) return;
    var value = getCookie();
    form.querySelectorAll('input[type="text"], input:not([type])').forEach(function (input) {
      if (isLeadField(input)) {
        hide(input);
        if (value) input.value = withPage(value);
      }      
      var ph = (input.getAttribute('placeholder') || '').trim().toLowerCase();
      var lbl = input.id ? form.querySelector('label[for="' + input.id + '"]') : null;
      if (input.name === 'form_submission[custom_51]' || ph === 'google click id' ||
          (lbl && lbl.textContent.trim().toLowerCase() === 'google click id')) {
        hide(input);
        var gc = getGclid();
        if (gc) input.value = gc;
      }
    });
  }

  // 4. Gehasht e-mailadres voor de ChatGPT-pixel (alleen de hash verlaat de browser)
  // localStorage (niet sessionStorage): bij de dubbele opt-in opent de bevestigingslink
  // uit de e-mail een NIEUW tabblad; localStorage werkt over tabbladen heen. Bewaartermijn 7 dagen.
  var EM_KEY = 'jco_em';
  var EM_DAYS = 7;
  function ssGet(k) {
    try {
      var raw = window.localStorage.getItem(k);
      if (!raw) return '';
      var o = JSON.parse(raw);
      if (!o || !o.h || Date.now() > o.exp) { window.localStorage.removeItem(k); return ''; }
      return o.h;
    } catch (e) { return ''; }
  }
  function ssSet(k, v) {
    try { window.localStorage.setItem(k, JSON.stringify({ h: v, exp: Date.now() + EM_DAYS * 864e5 })); } catch (e) {}
  }
  function sha256(text) {
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) return Promise.resolve('');
    return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ('0' + b.toString(16)).slice(-2);
      }).join('');
    }).catch(function () { return ''; });
  }
  function storeEmailHash(form) {
    if (!form || !form.querySelector) return;
    var el = form.querySelector('input[type="email"], input[name="form_submission[email]"]');
    var email = el && el.value ? el.value.trim().toLowerCase() : '';
    if (email.indexOf('@') < 1) return;
    sha256(email).then(function (h) { if (h) ssSet(EM_KEY, h); });
  }
  // Op elke pagina: is er een hash uit een eerder formulier in dit tabblad, geef die aan de pixel
  var emHash = ssGet(EM_KEY);
  if (emHash && typeof window.oaiq === 'function') {
    window.oaiq('init', { user: { email_sha256: emHash } });
  }

  // Bij laden, bij focus in een formulier en bij verzenden (ook pop-ups / two-step die later laden)
  function fillAll() { document.querySelectorAll('form').forEach(fill); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fillAll);
  else fillAll();
  window.addEventListener('load', function () { setTimeout(fillAll, 1500); });
  document.addEventListener('focusin', function (e) { fill(e.target.closest && e.target.closest('form')); }, true);
  document.addEventListener('click', function (e) {
    var form = e.target.closest && e.target.closest('form');
    fill(form);
    storeEmailHash(form);
  }, true);
  document.addEventListener('change', function (e) {
    if (e.target && (e.target.type === 'email' || e.target.name === 'form_submission[email]')) {
      storeEmailHash(e.target.form);
    }
  }, true);
  document.addEventListener('submit', function (e) { fill(e.target); storeEmailHash(e.target); }, true);
});
