/**
 * Visitor counter for samnakngan-amtsolution.com.
 *
 * VISITOR_COUNTER_ENDPOINT
 *   Origin of the shared Cloudflare Worker. The widget POSTs
 *   {endpoint}/v1/visit with Content-Type: application/json and
 *   body {"vid":"<uuid>"} (or {} when localStorage is unavailable).
 *   The worker chooses the site from the Origin header and returns
 *   {"site","day","today","total"}.
 *   Leave this empty to keep the footer badge hidden.
 */
window.VISITOR_COUNTER_ENDPOINT = "https://amt-visitor-counter.pannoi-ten.workers.dev";
