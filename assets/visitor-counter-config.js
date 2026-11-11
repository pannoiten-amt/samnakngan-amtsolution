/**
 * Visitor counter settings for samnakngan-amtsolution.com.
 *
 * VISITOR_COUNTER_ENDPOINT
 *   Placeholder URL for the shared Cloudflare Worker
 *   (pannoiten-amt/samnakngan-amtaudit, folder /counter-worker).
 *   Leave this as an empty string until that URL is known.
 *   The footer counter stays hidden when this is empty.
 *
 * The widget calls:
 *   GET {VISITOR_COUNTER_ENDPOINT}?site=amtsolution
 * and expects JSON: {"today": number, "total": number}
 */
window.VISITOR_COUNTER_ENDPOINT = "";

/** Per-site key sent to the shared counter. Do not change for this site. */
window.VISITOR_COUNTER_SITE_KEY = "amtsolution";
