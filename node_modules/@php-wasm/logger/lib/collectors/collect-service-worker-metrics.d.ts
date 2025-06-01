/// <reference lib="webworker" />
/**
 * **Call this inside a service worker.**
 * These errors include Playground errors like Asyncify errors. PHP errors
 * won't trigger this event.
 *
 * Reports service worker metrics.
 * Allows the logger to request metrics from the service worker by sending a
 * message. The service worker will respond with the number of open Playground
 * tabs.
 *
 * @param worker The service worker
 */
export declare const reportServiceWorkerMetrics: (worker: ServiceWorkerGlobalScope) => void;
