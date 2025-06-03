import type { CookieStore } from './php-request-handler';
/**
 * @public
 */
export declare class HttpCookieStore implements CookieStore {
    cookies: Record<string, string>;
    rememberCookiesFromResponseHeaders(headers: Record<string, string[]>): void;
    getCookieRequestHeader(): string;
}
