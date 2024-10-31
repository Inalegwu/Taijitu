import { Metric } from "effect";

/**
 * Tracks number of requests intercepted
 * by the proxy server
 */
export const requestCount = Metric.counter("no_of_requests", {
  description: "number of intercepted requests by proxy",
});

/**
 *
 * Gives a summary of response times
 * for all requests made from the proxy
 * server to the replica servers
 *
 */
export const outboundRequestTimeSummary = Metric.summary({
  name: "outbound_request_time_summary",
  maxAge: "1 day",
  maxSize: 100,
  error: 0.63,
  quantiles: [0.1, 0.5, 0.9],
  description: "Measures response times",
});

/**
 *
 * Gives a summary of response times
 * for all requests made to the proxy
 * server from incoming clients
 *
 */
export const inboudRequestTimeSummary = Metric.summary({
  name: "inbound_request_time_summary",
  maxAge: "1 day",
  maxSize: 100,
  error: 0.63,
  quantiles: [0.1, 0.5, 0.9],
  description: "Measures response times",
});
