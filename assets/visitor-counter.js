(function () {
  var el = document.getElementById("visitor-counter");
  if (!el || typeof fetch !== "function") return;

  var endpoint = typeof window.VISITOR_COUNTER_ENDPOINT === "string"
    ? window.VISITOR_COUNTER_ENDPOINT.replace(/^\s+|\s+$/g, "")
    : "";
  if (!endpoint) return;

  var siteKey = typeof window.VISITOR_COUNTER_SITE_KEY === "string"
    ? window.VISITOR_COUNTER_SITE_KEY.replace(/^\s+|\s+$/g, "")
    : "";
  if (!siteKey) siteKey = "amtsolution";

  var url;
  try {
    url = new URL(endpoint, window.location.href);
  } catch (e) {
    return;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return;
  url.searchParams.set("site", siteKey);

  var todayEl = document.getElementById("visitor-counter-today");
  var totalEl = document.getElementById("visitor-counter-total");
  if (!todayEl || !totalEl) return;

  var controller = typeof AbortController === "function" ? new AbortController() : null;
  var timer = controller ? setTimeout(function () { controller.abort(); }, 4000) : null;

  fetch(url.href, {
    method: "GET",
    cache: "no-store",
    credentials: "omit",
    referrerPolicy: "no-referrer",
    headers: { Accept: "application/json" },
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
    /* Endpoint missing or unreachable: keep the counter hidden. */
  }).then(function () {
    if (timer) clearTimeout(timer);
  });

  function isCount(n) {
    return typeof n === "number" && isFinite(n) && n >= 0;
  }
})();
