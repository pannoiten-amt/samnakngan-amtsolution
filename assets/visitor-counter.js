(function () {
  var el = document.getElementById("visitor-counter");
  if (!el || typeof fetch !== "function") return;

  var endpoint = typeof window.VISITOR_COUNTER_ENDPOINT === "string"
    ? window.VISITOR_COUNTER_ENDPOINT.replace(/^\s+|\s+$/g, "")
    : "";
  if (!endpoint) return;

  var visitUrl;
  try {
    visitUrl = new URL("/v1/visit", endpoint);
  } catch (e) {
    return;
  }
  if (visitUrl.protocol !== "https:" && visitUrl.protocol !== "http:") return;

  var todayEl = document.getElementById("visitor-counter-today");
  var totalEl = document.getElementById("visitor-counter-total");
  if (!todayEl || !totalEl) return;

  var controller = typeof AbortController === "function" ? new AbortController() : null;
  var timer = controller ? setTimeout(function () { controller.abort(); }, 4000) : null;

  fetch(visitUrl.href, {
    method: "POST",
    cache: "no-store",
    credentials: "omit",
    referrerPolicy: "no-referrer",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: visitorBody(),
    signal: controller ? controller.signal : undefined
  }).then(function (res) {
    if (!res || !res.ok) throw new Error("bad status");
    return res.json();
  }).then(function (data) {
    if (!isCount(data && data.today) || !isCount(data && data.total)) return;
    var fmt = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });
    todayEl.textContent = fmt.format(data.today);
    totalEl.textContent = fmt.format(data.total);
    el.hidden = false;
    el.removeAttribute("aria-hidden");
  }).catch(function () {
    /* Any error: keep the badge hidden. */
  }).then(function () {
    if (timer) clearTimeout(timer);
  });

  function visitorBody() {
    var key = "amt_visitor_id";
    try {
      var vid = localStorage.getItem(key);
      if (!isUuidV4(vid)) {
        vid = uuidV4();
        localStorage.setItem(key, vid);
      }
      return JSON.stringify({ vid: vid });
    } catch (e) {
      return "{}";
    }
  }

  function isUuidV4(value) {
    return typeof value === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  function uuidV4() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    var bytes = new Uint8Array(16);
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      crypto.getRandomValues(bytes);
    } else {
      for (var i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    var hex = "";
    for (var j = 0; j < 16; j++) {
      var h = bytes[j].toString(16);
      hex += h.length === 1 ? "0" + h : h;
    }
    return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
  }

  function isCount(n) {
    return typeof n === "number" && isFinite(n) && n >= 0;
  }
})();
