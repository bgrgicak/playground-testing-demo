/**
 * Setup a postMessage relay between the parent window and a nested iframe.
 *
 * When we're running a Playground instance inside an iframe, sometimes that
 * iframe will contain another iframe and so on. The parent application,
 * however, needs to be able to communicate with the innermost iframe. This
 * function relays the communication both ways. Call it in in every iframe
 * layer between the topmost window and the innermost iframe.
 *
 * @param nestedFrame The nested iframe element
 * @param expectedOrigin The origin that the nested iframe is expected to be on. If not
 *                       provided, any origin is allowed.
 */
export declare function setupPostMessageRelay(nestedFrame: HTMLIFrameElement, expectedOrigin?: string): void;
