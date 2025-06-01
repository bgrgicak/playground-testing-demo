import { SupportedPHPVersion, EmscriptenOptions } from '@php-wasm/universal';
export interface PHPLoaderOptions {
    emscriptenOptions?: EmscriptenOptions;
}
/**
 * Does what load() does, but synchronously returns
 * an object with the PHP instance and a promise that
 * resolves when the PHP instance is ready.
 *
 * @see load
 */
export declare function loadNodeRuntime(phpVersion: SupportedPHPVersion, options?: PHPLoaderOptions): Promise<number>;
