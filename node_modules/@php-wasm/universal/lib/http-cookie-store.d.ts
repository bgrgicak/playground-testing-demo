/**
 * @public
 */
export declare class HttpCookieStore {
    cookies: Record<string, string>;
    rememberCookiesFromResponseHeaders(headers: Record<string, string[]>): void;
    getCookieRequestHeader(): string;
}
