/*
 * Cookie and storage consent banner, shared by every page (the raw Stitch
 * HTML pages and the React ones).
 *
 * What the choice actually controls — the banner must not be decorative:
 * - Always on (strictly necessary, no consent needed): the NEXT_LOCALE
 *   language cookie, the form hand-off to the booking page (sessionStorage)
 *   and this choice itself.
 * - Only with "Aceptar": the chat keeps its history and conversation id in
 *   localStorage, so a returning visitor finds the conversation where they
 *   left it. With "Rechazar" the chat still works, but everything lives in
 *   sessionStorage and is gone when the tab closes (see stitch-chat.js).
 *
 * The site has no analytics or advertising. If any is ever added, it must
 * only load when `window.numiConsent.get() === 'accepted'`.
 *
 * "Aceptar" and "Rechazar" carry the same visual weight on purpose: a banner
 * that makes refusing harder than accepting does not collect a free choice.
 * Any element with `data-cookie-settings` reopens the banner.
 */
(function () {
  var KEY = 'numi:consent';
  var VERSION = 1;
  var CHAT_KEYS = ['numi:chat:session', 'numi:chat:history', 'numi:chat:latency'];

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      return v && v.v === VERSION ? v.choice : null;
    } catch (_) { return null; }
  }

  function save(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ v: VERSION, choice: choice, at: new Date().toISOString() })); } catch (_) {}
    if (choice === 'rejected') {
      // Withdrawing consent removes what it had allowed.
      CHAT_KEYS.forEach(function (k) { try { localStorage.removeItem(k); } catch (_) {} });
    }
    try { window.dispatchEvent(new CustomEvent('numi:consent', { detail: choice })); } catch (_) {}
  }

  window.numiConsent = { get: read };

  var lang = (document.documentElement.lang || 'es').slice(0, 2);
  var T = lang === 'en'
    ? {
        title: 'Cookies and storage',
        body: 'We use only what the site needs to work (language and booking). If you accept, we also keep your chat history with Cortana in this browser so you can pick it up later. No advertising or tracking.',
        policy: 'Cookie policy',
        accept: 'Accept',
        reject: 'Reject',
      }
    : {
        title: 'Cookies y almacenamiento',
        body: 'Usamos solo lo necesario para que el sitio funcione (idioma y agenda). Si aceptas, también guardamos en este navegador tu historial del chat con Cortana para que puedas retomarlo. Sin publicidad ni rastreo.',
        policy: 'Política de cookies',
        accept: 'Aceptar',
        reject: 'Rechazar',
      };

  var CSS =
    '#numi-consent{position:fixed;z-index:2147483000;left:16px;right:16px;bottom:16px;max-width:560px;margin:0 auto;' +
    'padding:20px;border-radius:20px;border:1px solid rgba(255,255,255,.12);color:#f8fafc;' +
    'background:linear-gradient(145deg,rgba(34,21,56,.96) 0%,rgba(18,8,31,.98) 100%);' +
    'box-shadow:inset 0 1px 1px rgba(255,255,255,.15),0 20px 50px rgba(0,0,0,.55);' +
    'font:14px/1.55 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;' +
    'opacity:0;transform:translateY(12px);transition:opacity .32s cubic-bezier(.22,.61,.36,1),transform .32s cubic-bezier(.22,.61,.36,1)}' +
    '#numi-consent.is-in{opacity:1;transform:none}' +
    '#numi-consent h2{margin:0 0 6px;font:700 16px/1.3 "Plus Jakarta Sans",Inter,system-ui,sans-serif;color:#f8fafc}' +
    '#numi-consent p{margin:0;color:#ccc3d8}' +
    '#numi-consent a{color:#b39cfb;text-decoration:underline;text-underline-offset:3px}' +
    '#numi-consent .nc-actions{display:flex;gap:10px;margin-top:16px}' +
    '#numi-consent button{flex:1;min-height:44px;padding:10px 18px;border-radius:9999px;font:600 14px/1 Inter,system-ui,sans-serif;cursor:pointer;' +
    'transition:transform .2s ease,background-color .2s ease,border-color .2s ease}' +
    '#numi-consent button:hover{transform:translateY(-1px) scale(1.02)}' +
    '#numi-consent button:active{transform:scale(.98)}' +
    '#numi-consent button:focus-visible{outline:2px solid #b39cfb;outline-offset:3px}' +
    '#numi-consent .nc-reject{color:#f8fafc;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.22)}' +
    '#numi-consent .nc-reject:hover{background:rgba(255,255,255,.12)}' +
    '#numi-consent .nc-accept{color:#fff;border:1px solid transparent;background:linear-gradient(to bottom,#9b73f7 0%,#8b5cf6 100%);box-shadow:0 8px 24px rgba(124,58,237,.35)}' +
    '@media (min-width:768px){#numi-consent{left:24px;right:auto;bottom:24px;margin:0}}' +
    '@media (prefers-reduced-motion:reduce){#numi-consent,#numi-consent button{transition:none}}';

  function show() {
    if (document.getElementById('numi-consent')) return;
    if (!document.getElementById('numi-consent-css')) {
      var style = document.createElement('style');
      style.id = 'numi-consent-css';
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    var box = document.createElement('section');
    box.id = 'numi-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'false');
    box.setAttribute('aria-labelledby', 'numi-consent-title');
    box.setAttribute('aria-describedby', 'numi-consent-body');
    box.innerHTML =
      '<h2 id="numi-consent-title"></h2>' +
      '<p id="numi-consent-body"></p>' +
      '<p style="margin-top:6px"><a href="/' + (lang === 'en' ? 'en' : 'es') + '/cookies"></a></p>' +
      '<div class="nc-actions"><button type="button" class="nc-reject"></button><button type="button" class="nc-accept"></button></div>';
    box.querySelector('h2').textContent = T.title;
    box.querySelector('#numi-consent-body').textContent = T.body;
    box.querySelector('a').textContent = T.policy;
    box.querySelector('.nc-reject').textContent = T.reject;
    box.querySelector('.nc-accept').textContent = T.accept;

    function close(choice) {
      save(choice);
      box.classList.remove('is-in');
      setTimeout(function () { box.remove(); }, 250);
    }
    box.querySelector('.nc-reject').addEventListener('click', function () { close('rejected'); });
    box.querySelector('.nc-accept').addEventListener('click', function () { close('accepted'); });

    document.body.appendChild(box);
    requestAnimationFrame(function () { box.classList.add('is-in'); });
  }

  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('[data-cookie-settings]');
    if (t) { e.preventDefault(); show(); }
  });

  function init() { if (!read()) show(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
