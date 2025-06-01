import { ProgressTracker } from '@php-wasm/progress';
import { Semaphore } from '@php-wasm/util';
import { SupportedPHPVersion, UniversalPHP } from '@php-wasm/universal';
import { StepDefinition } from './steps';
import { Blueprint, ExtraLibrary } from './blueprint';
export type CompiledStep = (php: UniversalPHP) => Promise<void> | void;
export interface CompiledBlueprint {
    /** The requested versions of PHP and WordPress for the blueprint */
    versions: {
        php: SupportedPHPVersion;
        wp: string;
    };
    features: {
        /** Should boot with support for network request via wp_safe_remote_get? */
        networking: boolean;
    };
    extraLibraries: ExtraLibrary[];
    /** The compiled steps for the blueprint */
    run: (playground: UniversalPHP) => Promise<void>;
}
export type OnStepCompleted = (output: any, step: StepDefinition) => any;
export interface CompileBlueprintOptions {
    /** Optional progress tracker to monitor progress */
    progress?: ProgressTracker;
    /** Optional semaphore to control access to a shared resource */
    semaphore?: Semaphore;
    /** Optional callback with step output */
    onStepCompleted?: OnStepCompleted;
    /**
     * Proxy URL to use for cross-origin requests.
     *
     * For example, if corsProxy is set to "https://cors.wordpress.net/proxy.php",
     * then the CORS requests to https://github.com/WordPress/gutenberg.git would actually
     * be made to https://cors.wordpress.net/proxy.php?https://github.com/WordPress/gutenberg.git.
     */
    corsProxy?: string;
}
/**
 * Compiles Blueprint into a form that can be executed.
 *
 * @param playground The PlaygroundClient to use for the compilation
 * @param blueprint The bBueprint to compile
 * @param options Additional options for the compilation
 * @returns The compiled blueprint
 */
export declare function compileBlueprint(blueprint: Blueprint, { progress, semaphore, onStepCompleted, corsProxy, }?: CompileBlueprintOptions): CompiledBlueprint;
export declare function validateBlueprint(blueprintMaybe: object): {
    valid: true;
    errors?: undefined;
} | {
    valid: false;
    errors: import("ajv").ErrorObject<string, Record<string, any>, unknown>[] | undefined;
};
export declare function runBlueprintSteps(compiledBlueprint: CompiledBlueprint, playground: UniversalPHP): Promise<void>;
