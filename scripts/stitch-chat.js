// Live Cortana chat for the home hero mock. Inlined as a <script> by
// scripts/build-stitch-home.mjs. API contract: POST {session_id, message} -> {reply}.
// `reply` is plain text: it is only ever rendered with textContent, never innerHTML.
(function () {
  var stream = document.getElementById('numi-chat-stream');
  var form = document.getElementById('numi-chat-form');
  var input = document.getElementById('numi-chat-input');
  var sendBtn = document.getElementById('numi-chat-send');
  var resetBtn = document.getElementById('numi-chat-reset');
  if (!stream || !form || !input || !sendBtn) return;

  var API_URL = '__CHAT_API_URL__/chat';
  var TIMEOUT_MS = 65000;
  var COLD_START_HINT_MS = 8000;
  var MAX_HISTORY = 40;
  var SESSION_KEY = 'numi:chat:session';
  var HISTORY_KEY = 'numi:chat:history';
  var LATENCY_KEY = 'numi:chat:latency';
  var MAX_SAMPLES = 20;
  // Replies slower than this are cold starts of the free-tier host, not agent latency.
  var MAX_COUNTED_MS = 20000;

  var isEn = document.documentElement.lang === 'en';
  var T = isEn
    ? {
        you: 'You',
        empty: 'Write your first message to talk to Cortana',
        coldStart: 'Waking the agent up, the first reply can take up to a minute…',
        errGeneric: "We couldn't send your message. Please try again.",
        errNetwork: "We couldn't reach the chat. Check your connection and try again.",
        seconds: 'seconds',
        measured: function (n) { return n + (n === 1 ? ' reply measured' : ' replies measured'); },
      }
    : {
        you: 'Tú',
        empty: 'Escribe tu primer mensaje para hablar con Cortana',
        coldStart: 'Despertando al agente, la primera respuesta puede tardar hasta un minuto…',
        errGeneric: 'No pudimos enviar tu mensaje. Inténtalo de nuevo.',
        errNetwork: 'No pudimos conectar con el chat. Revisa tu conexión e inténtalo de nuevo.',
        seconds: 'segundos',
        measured: function (n) { return n + (n === 1 ? ' respuesta medida' : ' respuestas medidas'); },
      };

  // ---- storage (private mode / blocked storage falls back to memory) ----
  var memory = {};
  function read(key) {
    try { return localStorage.getItem(key); } catch (_) { return memory[key] || null; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { memory[key] = value; }
  }

  function newSessionId() {
    if (window.crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    var id = 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2);
    while (id.length < 16) id += Math.random().toString(36).slice(2);
    return id.slice(0, 64);
  }

  function getSessionId() {
    var id = read(SESSION_KEY);
    if (!id || !/^[A-Za-z0-9_-]{16,64}$/.test(id)) {
      id = newSessionId();
      write(SESSION_KEY, id);
    }
    return id;
  }

  function loadHistory() {
    try {
      var parsed = JSON.parse(read(HISTORY_KEY) || '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (m) {
        return m && (m.from === 'user' || m.from === 'agent') && typeof m.text === 'string';
      });
    } catch (_) {
      return [];
    }
  }

  function loadLatencies() {
    try {
      var parsed = JSON.parse(read(LATENCY_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.filter(function (n) { return typeof n === 'number' && n > 0; }) : [];
    } catch (_) {
      return [];
    }
  }

  var history = loadHistory();
  var latencies = loadLatencies();
  var pending = false;
  var active = false;

  function saveHistory() {
    history = history.slice(-MAX_HISTORY);
    write(HISTORY_KEY, JSON.stringify(history));
  }

  // ---- DOM helpers ----
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString(isEn ? 'en-US' : 'es-CO', { hour: 'numeric', minute: '2-digit' });
  }

  // Touch devices: refocusing programmatically pops the on-screen keyboard back up
  // after every reply. Only auto-focus where there is a precise pointer (desktop).
  var canAutoFocus = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
  function focusInput() {
    if (canAutoFocus) input.focus({ preventScroll: true });
  }

  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var chatCard = stream.parentElement; // header + stream + invite + input

  function scrollToEnd() {
    stream.scrollTo({ top: stream.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  // Keep the whole chat in view without yanking the page when it already is.
  function ensureChatVisible() {
    var rect = chatCard.getBoundingClientRect();
    var vh = window.innerHeight;
    if (rect.top >= 0 && rect.bottom <= vh) return;
    var behavior = reduceMotion ? 'auto' : 'smooth';
    if (rect.height <= vh) chatCard.scrollIntoView({ block: 'center', behavior: behavior });
    else form.scrollIntoView({ block: 'end', behavior: behavior });
  }

  function userRow(text, ts) {
    var row = el('div', 'flex items-end gap-2 sm:gap-2.5 max-w-[88%] sm:max-w-md');
    row.appendChild(el('div', 'w-8 h-8 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center text-on-surface-variant shrink-0 font-bold text-xs shadow-sm', T.you));
    var bubble = el('div', 'bg-[#1c1031]/95 px-4 py-3 rounded-2xl rounded-bl-xs text-on-surface shadow-md border border-white/10 leading-relaxed min-w-0');
    bubble.appendChild(el('div', 'whitespace-pre-wrap break-words', text));
    bubble.appendChild(el('div', 'text-[10px] text-text-muted text-right mt-1.5 font-mono', formatTime(ts)));
    row.appendChild(bubble);
    return row;
  }

  function agentRow(text, ts, isError) {
    var row = el('div', 'flex items-end justify-end gap-2 sm:gap-2.5 ml-auto max-w-[92%] sm:max-w-lg');
    var bubbleClass = isError
      ? 'bg-red-500/15 text-text-primary px-4 py-3.5 rounded-2xl rounded-br-xs border border-red-500/40 shadow-xl min-w-0'
      : 'bg-gradient-to-br from-primary-container/30 to-[#1e0e37] text-text-primary px-4 py-3.5 rounded-2xl rounded-br-xs border border-primary/40 shadow-xl min-w-0';
    var bubble = el('div', bubbleClass);
    bubble.appendChild(el('div', 'whitespace-pre-wrap break-words leading-relaxed', text));
    if (ts) bubble.appendChild(el('div', 'text-[10px] text-on-surface-variant text-right mt-1.5 font-mono', formatTime(ts)));
    row.appendChild(bubble);
    row.appendChild(el('div', 'w-8 h-8 rounded-full bg-gradient-to-tr from-primary-container to-secondary-container flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md ring-1 ring-primary/40', 'AI'));
    return row;
  }

  function typingRow() {
    var row = el('div', 'flex items-end justify-end gap-2 sm:gap-2.5 ml-auto max-w-[92%] sm:max-w-lg');
    var bubble = el('div', 'bg-gradient-to-br from-primary-container/30 to-[#1e0e37] px-4 py-3.5 rounded-2xl rounded-br-xs border border-primary/40 shadow-xl min-w-0');
    var dots = el('div', 'flex items-center gap-1.5');
    for (var i = 0; i < 3; i++) {
      var dot = el('span', 'w-1.5 h-1.5 rounded-full bg-primary animate-bounce');
      dot.style.animationDelay = i * 150 + 'ms';
      dots.appendChild(dot);
    }
    bubble.appendChild(dots);
    var hint = el('div', 'hidden text-[11px] text-text-muted mt-2 font-mono', T.coldStart);
    bubble.appendChild(hint);
    row.appendChild(bubble);
    row.appendChild(el('div', 'w-8 h-8 rounded-full bg-gradient-to-tr from-primary-container to-secondary-container flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md ring-1 ring-primary/40', 'AI'));
    return { row: row, hint: hint };
  }

  function emptyHint() {
    var wrap = el('div', 'flex justify-center my-1');
    wrap.appendChild(el('span', 'text-[11px] text-text-muted font-mono bg-[#1b0f2e]/80 px-3.5 py-1 rounded-full border border-white/5 shadow-sm', T.empty));
    return wrap;
  }

  function append(node) {
    stream.appendChild(node);
    scrollToEnd();
  }

  // ---- live response-time card (replaces the static mock figure) ----
  var metricAvg = document.getElementById('numi-metric-avg');
  var metricLast = document.getElementById('numi-metric-last');
  var metricBadge = document.getElementById('numi-metric-badge');
  var metricBar = document.getElementById('numi-metric-bar');

  function formatSeconds(ms) {
    var s = ms / 1000;
    return s < 10 ? s.toFixed(1) : String(Math.round(s));
  }

  function renderMetrics() {
    if (!latencies.length) return; // keep the illustrative figure until a real reply is measured
    var total = latencies.reduce(function (a, b) { return a + b; }, 0);
    var last = latencies[latencies.length - 1];
    if (metricAvg) metricAvg.textContent = formatSeconds(total / latencies.length);
    if (metricLast) metricLast.textContent = formatSeconds(last) + ' ' + T.seconds;
    if (metricBadge) metricBadge.textContent = T.measured(latencies.length);
    if (metricBar) metricBar.style.width = Math.max(8, Math.round(100 - (last / 1000) * 8)) + '%';
  }

  function recordLatency(ms) {
    if (ms > MAX_COUNTED_MS) return;
    latencies = latencies.concat(ms).slice(-MAX_SAMPLES);
    write(LATENCY_KEY, JSON.stringify(latencies));
    renderMetrics();
  }

  // ---- state transitions ----
  function activate() {
    if (active) return;
    active = true;
    stream.replaceChildren(); // drops the mock conversation
  }

  function syncResetButton() {
    if (resetBtn) resetBtn.classList.toggle('hidden', history.length === 0);
  }

  function setPending(value) {
    pending = value;
    // readOnly (not disabled) blocks typing while waiting without changing focus state.
    input.readOnly = value;
    sendBtn.disabled = value;
  }

  function request(message) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);
    return fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: getSessionId(), message: message }),
      signal: controller.signal,
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (res.ok && typeof body.reply === 'string' && body.reply) return { reply: body.reply };
          // 429 / 503 / 504 carry a display-ready string; 422 carries a list.
          return { error: typeof body.detail === 'string' ? body.detail : T.errGeneric };
        });
      })
      .catch(function () { return { error: T.errNetwork }; })
      .then(function (result) { clearTimeout(timer); return result; });
  }

  function send(raw) {
    var message = raw.trim();
    if (!message || pending) return;
    setPending(true);
    activate();

    var now = Date.now();
    history.push({ from: 'user', text: message, t: now });
    saveHistory();
    syncResetButton();
    append(userRow(message, now));
    input.value = '';
    ensureChatVisible();

    var typing = typingRow();
    append(typing.row);
    var coldTimer = setTimeout(function () {
      typing.hint.classList.remove('hidden');
      scrollToEnd();
    }, COLD_START_HINT_MS);

    var startedAt = Date.now();
    request(message).then(function (result) {
      clearTimeout(coldTimer);
      typing.row.remove();
      var at = Date.now();
      if (result.reply) {
        history.push({ from: 'agent', text: result.reply, t: at });
        saveHistory();
        recordLatency(at - startedAt);
        append(agentRow(result.reply, at, false));
      } else {
        append(agentRow(result.error, at, true));
      }
      setPending(false);
      focusInput();
      ensureChatVisible();
    });
  }

  function reset() {
    if (pending) return;
    write(SESSION_KEY, newSessionId());
    history = [];
    saveHistory();
    active = true;
    stream.replaceChildren(emptyHint());
    syncResetButton();
    focusInput();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    send(input.value);
  });
  if (resetBtn) resetBtn.addEventListener('click', reset);

  renderMetrics();

  // Returning visitor: restore the real conversation instead of the mock.
  if (history.length) {
    activate();
    history.forEach(function (m) {
      stream.appendChild(m.from === 'user' ? userRow(m.text, m.t) : agentRow(m.text, m.t, false));
    });
    syncResetButton();
    scrollToEnd();
  }
})();
