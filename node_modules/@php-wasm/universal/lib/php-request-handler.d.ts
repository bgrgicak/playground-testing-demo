import { PHP } from './php';
import { PHPResponse } from './php-response';
import { PHPRequest } from './universal-php';
import { PHPFactoryOptions, PHPProcessManager } from './php-process-manager';
export type RewriteRule = {
    match: RegExp;
    replacement: string;
};
export type FileNotFoundToResponse = {
    type: 'response';
    response: PHPResponse;
};
export type FileNotFoundToInternalRedirect = {
    type: 'internal-redirect';
    uri: string;
};
export type FileNotFoundTo404 = {
    type: '404';
};
export type FileNotFoundAction = FileNotFoundToResponse | FileNotFoundToInternalRedirect | FileNotFoundTo404;
export type FileNotFoundGetActionCallback = (relativePath: string) => FileNotFoundAction;
interface BaseConfiguration {
    /**
     * The directory in the PHP filesystem where the server will look
     * for the files to serve. Default: `/var/www`.
     */
    documentRoot?: string;
    /**
     * Request Handler URL. Used to populate $_SERVER details like HTTP_HOST.
     */
    absoluteUrl?: string;
    /**
     * Rewrite rules
     */
    rewriteRules?: RewriteRule[];
    /**
     * A callback that decides how to handle a file-not-found condition for a
     * given request URI.
     */
    getFileNotFoundAction?: FileNotFoundGetActionCallback;
}
export type PHPRequestHandlerFactoryArgs = PHPFactoryOptions & {
    requestHandler: PHPRequestHandler;
};
export type PHPRequestHandlerConfiguration = BaseConfiguration & ({
    /**
     * PHPProcessManager is required because the request handler needs
     * to make a decision for each request.
     *
     * Static assets are served using the primary PHP's filesystem, even
     * when serving 100 static files concurrently. No new PHP interpreter
     * is ever created as there's no need for it.
     *
     * Dynamic PHP requests, however, require grabbing an available PHP
     * interpreter, and that's where the PHPProcessManager comes in.
     */
    processManager: PHPProcessManager;
} | {
    phpFactory: (requestHandler: PHPRequestHandlerFactoryArgs) => Promise<PHP>;
    /**
     * The maximum number of PHP instances that can exist at
     * the same time.
     */
    maxPhpInstances?: number;
});
/**
 * Handles HTTP requests using PHP runtime as a backend.
 *
 * @public
 * @example Use PHPRequestHandler implicitly with a new PHP instance:
 * ```js
 * import { PHP } from '@php-wasm/web';
 *
 * const php = await PHP.load( '7.4', {
 *     requestHandler: {
 *         // PHP FS path to serve the files from:
 *         documentRoot: '/www',
 *
 *         // Used to populate $_SERVER['SERVER_NAME'] etc.:
 *         absoluteUrl: 'http://127.0.0.1'
 *     }
 * } );
 *
 * php.mkdirTree('/www');
 * php.writeFile('/www/index.php', '<?php echo "Hi from PHP!"; ');
 *
 * const response = await php.request({ path: '/index.php' });
 * console.log(response.text);
 * // "Hi from PHP!"
 * ```
 *
 * @example Explicitly create a PHPRequestHandler instance and run a PHP script:
 * ```js
 * import {
 *   loadPHPRuntime,
 *   PHP,
 *   PHPRequestHandler,
 *   getPHPLoaderModule,
 * } from '@php-wasm/web';
 *
 * const runtime = await loadPHPRuntime( await getPHPLoaderModule('7.4') );
 * const php = new PHP( runtime );
 *
 * php.mkdirTree('/www');
 * php.writeFile('/www/index.php', '<?php echo "Hi from PHP!"; ');
 *
 * const server = new PHPRequestHandler(php, {
 *     // PHP FS path to serve the files from:
 *     documentRoot: '/www',
 *
 *     // Used to populate $_SERVER['SERVER_NAME'] etc.:
 *     absoluteUrl: 'http://127.0.0.1'
 * });
 *
 * const response = server.request({ path: '/index.php' });
 * console.log(response.text);
 * // "Hi from PHP!"
 * ```
 */
export declare class PHPRequestHandler {
    #private;
    rewriteRules: RewriteRule[];
    processManager: PHPProcessManager;
    getFileNotFoundAction: FileNotFoundGetActionCallback;
    /**
     * The request handler needs to decide whether to serve a static asset or
     * run the PHP interpreter. For static assets it should just reuse the primary
     * PHP even if there's 50 concurrent requests to serve. However, for
     * dynamic PHP requests, it needs to grab an available interpreter.
     * Therefore, it cannot just accept PHP as an argument as serving requests
     * requires access to ProcessManager.
     *
     * @param  php    - The PHP instance.
     * @param  config - Request Handler configuration.
     */
    constructor(config: PHPRequestHandlerConfiguration);
    getPrimaryPhp(): Promise<PHP>;
    /**
     * Converts a path to an absolute URL based at the PHPRequestHandler
     * root.
     *
     * @param  path The server path to convert to an absolute URL.
     * @returns The absolute URL.
     */
    pathToInternalUrl(path: string): string;
    /**
     * Converts an absolute URL based at the PHPRequestHandler to a relative path
     * without the server pathname and scope.
     *
     * @param  internalUrl An absolute URL based at the PHPRequestHandler root.
     * @returns The relative path.
     */
    internalUrlToPath(internalUrl: string): string;
    /**
     * The absolute URL of this PHPRequestHandler instance.
     */
    get absoluteUrl(): string;
    /**
     * The directory in the PHP filesystem where the server will look
     * for the files to serve. Default: `/var/www`.
     */
    get documentRoot(): string;
    /**
     * Serves the request – either by serving a static file, or by
     * dispatching it to the PHP runtime.
     *
     * The request() method mode behaves like a web server and only works if
     * the PHP was initialized with a `requestHandler` option (which the online
     * version of WordPress Playground does by default).
     *
     * In the request mode, you pass an object containing the request information
     * (method, headers, body, etc.) and the path to the PHP file to run:
     *
     * ```ts
     * const php = PHP.load('7.4', {
     * 	requestHandler: {
     * 		documentRoot: "/www"
     * 	}
     * })
     * php.writeFile("/www/index.php", `<?php echo file_get_contents("php://input");`);
     * const result = await php.request({
     * 	method: "GET",
     * 	headers: {
     * 		"Content-Type": "text/plain"
     * 	},
     * 	body: "Hello world!",
     * 	path: "/www/index.php"
     * });
     * // result.text === "Hello world!"
     * ```
     *
     * The `request()` method cannot be used in conjunction with `cli()`.
     *
     * @example
     * ```js
     * const output = await php.request({
     * 	method: 'GET',
     * 	url: '/index.php',
     * 	headers: {
     * 		'X-foo': 'bar',
     * 	},
     * 	body: {
     * 		foo: 'bar',
     * 	},
     * });
     * console.log(output.stdout); // "Hello world!"
     * ```
     *
     * @param  request - PHP Request data.
     */
    request(request: PHPRequest): Promise<PHPResponse>;
}
/**
 * Applies the given rewrite rules to the given path.
 *
 * @param  path  The path to apply the rules to.
 * @param  rules The rules to apply.
 * @returns The path with the rules applied.
 */
export declare function applyRewriteRules(path: string, rules: RewriteRule[]): string;
export {};
