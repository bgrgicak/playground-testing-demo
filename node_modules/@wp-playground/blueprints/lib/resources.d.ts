import { ProgressTracker } from '@php-wasm/progress';
import { FileTree, UniversalPHP } from '@php-wasm/universal';
import { Semaphore } from '@php-wasm/util';
export type { FileTree };
export declare const ResourceTypes: readonly ["vfs", "literal", "wordpress.org/themes", "wordpress.org/plugins", "url", "git:directory"];
export type VFSReference = {
    /** Identifies the file resource as Virtual File System (VFS) */
    resource: 'vfs';
    /** The path to the file in the VFS */
    path: string;
};
export type LiteralReference = {
    /** Identifies the file resource as a literal file */
    resource: 'literal';
    /** The name of the file */
    name: string;
    /** The contents of the file */
    contents: string | Uint8Array;
};
export type CoreThemeReference = {
    /** Identifies the file resource as a WordPress Core theme */
    resource: 'wordpress.org/themes';
    /** The slug of the WordPress Core theme */
    slug: string;
};
export type CorePluginReference = {
    /** Identifies the file resource as a WordPress Core plugin */
    resource: 'wordpress.org/plugins';
    /** The slug of the WordPress Core plugin */
    slug: string;
};
export type UrlReference = {
    /** Identifies the file resource as a URL */
    resource: 'url';
    /** The URL of the file */
    url: string;
    /** Optional caption for displaying a progress message */
    caption?: string;
};
export type GitDirectoryReference = {
    /** Identifies the file resource as a git directory */
    resource: 'git:directory';
    /** The URL of the git repository */
    url: string;
    /** The branch of the git repository */
    ref: string;
    /** The path to the directory in the git repository */
    path: string;
};
export interface Directory {
    files: FileTree;
    name: string;
}
export type DirectoryLiteralReference = Directory & {
    /** Identifies the file resource as a git directory */
    resource: 'literal:directory';
};
export type FileReference = VFSReference | LiteralReference | CoreThemeReference | CorePluginReference | UrlReference;
export type DirectoryReference = GitDirectoryReference | DirectoryLiteralReference;
export declare function isResourceReference(ref: any): ref is FileReference;
export declare abstract class Resource<T extends File | Directory> {
    /** Optional progress tracker to monitor progress */
    protected _progress?: ProgressTracker;
    get progress(): ProgressTracker | undefined;
    set progress(value: ProgressTracker | undefined);
    /** A Promise that resolves to the file contents */
    protected promise?: Promise<T>;
    protected playground?: UniversalPHP;
    setPlayground(playground: UniversalPHP): void;
    abstract resolve(): Promise<T>;
    /** The name of the referenced file */
    abstract get name(): string;
    /** Whether this Resource is loaded asynchronously */
    get isAsync(): boolean;
    /**
     * Creates a new Resource based on the given file reference
     *
     * @param ref The file reference to create the Resource for
     * @param options Additional options for the Resource
     * @returns A new Resource instance
     */
    static create(ref: FileReference | DirectoryReference, { semaphore, progress, corsProxy, }: {
        /** Optional semaphore to limit concurrent downloads */
        semaphore?: Semaphore;
        progress?: ProgressTracker;
        corsProxy?: string;
    }): Resource<File | Directory>;
}
export declare abstract class ResourceDecorator<T extends File | Directory> extends Resource<T> {
    protected resource: Resource<T>;
    constructor(resource: Resource<T>);
    /** @inheritDoc */
    get progress(): ProgressTracker | undefined;
    /** @inheritDoc */
    set progress(value: ProgressTracker | undefined);
    /** @inheritDoc */
    abstract resolve(): Promise<T>;
    /** @inheritDoc */
    get name(): string;
    /** @inheritDoc */
    get isAsync(): boolean;
    /** @inheritDoc */
    setPlayground(playground: UniversalPHP): void;
}
/**
 * A `Resource` that represents a file in the VFS (virtual file system) of the
 * playground.
 */
export declare class VFSResource extends Resource<File> {
    private resource;
    _progress?: ProgressTracker | undefined;
    /**
     * Creates a new instance of `VFSResource`.
     * @param playground The playground client.
     * @param resource The VFS reference.
     * @param progress The progress tracker.
     */
    constructor(resource: VFSReference, _progress?: ProgressTracker | undefined);
    /** @inheritDoc */
    resolve(): Promise<File>;
    /** @inheritDoc */
    get name(): string;
}
/**
 * A `Resource` that represents a literal file.
 */
export declare class LiteralResource extends Resource<File> {
    private resource;
    _progress?: ProgressTracker | undefined;
    /**
     * Creates a new instance of `LiteralResource`.
     * @param resource The literal reference.
     * @param progress The progress tracker.
     */
    constructor(resource: LiteralReference, _progress?: ProgressTracker | undefined);
    /** @inheritDoc */
    resolve(): Promise<File>;
    /** @inheritDoc */
    get name(): string;
}
/**
 * A base class for `Resource`s that require fetching data from a remote URL.
 */
export declare abstract class FetchResource extends Resource<File> {
    _progress?: ProgressTracker | undefined;
    private corsProxy?;
    /**
     * Creates a new instance of `FetchResource`.
     * @param progress The progress tracker.
     */
    constructor(_progress?: ProgressTracker | undefined, corsProxy?: string | undefined);
    /** @inheritDoc */
    resolve(): Promise<File>;
    /**
     * Gets the URL to fetch the data from.
     * @returns The URL.
     */
    protected abstract getURL(): string;
    /**
     * Gets the caption for the progress tracker.
     * @returns The caption.
     */
    protected get caption(): string;
    /** @inheritDoc */
    get name(): string;
    /** @inheritDoc */
    get isAsync(): boolean;
}
/**
 * A `Resource` that represents a file available from a URL.
 */
export declare class UrlResource extends FetchResource {
    private resource;
    private options?;
    /**
     * Creates a new instance of `UrlResource`.
     * @param resource The URL reference.
     * @param progress The progress tracker.
     */
    constructor(resource: UrlReference, progress?: ProgressTracker, options?: {
        corsProxy?: string | undefined;
    } | undefined);
    /** @inheritDoc */
    getURL(): string;
    /** @inheritDoc */
    protected get caption(): string;
}
/**
 * A `Resource` that represents a git directory.
 */
export declare class GitDirectoryResource extends Resource<Directory> {
    private reference;
    _progress?: ProgressTracker | undefined;
    private options?;
    constructor(reference: GitDirectoryReference, _progress?: ProgressTracker | undefined, options?: {
        corsProxy?: string | undefined;
    } | undefined);
    resolve(): Promise<{
        name: string;
        files: Record<string, any>;
    }>;
    /** @inheritDoc */
    get name(): string;
}
/**
 * A `Resource` that represents a git directory.
 */
export declare class LiteralDirectoryResource extends Resource<Directory> {
    private reference;
    _progress?: ProgressTracker | undefined;
    constructor(reference: DirectoryLiteralReference, _progress?: ProgressTracker | undefined);
    resolve(): Promise<DirectoryLiteralReference>;
    /** @inheritDoc */
    get name(): string;
}
/**
 * A `Resource` that represents a WordPress core theme.
 */
export declare class CoreThemeResource extends FetchResource {
    private resource;
    constructor(resource: CoreThemeReference, progress?: ProgressTracker);
    get name(): string;
    getURL(): string;
}
/**
 * A resource that fetches a WordPress plugin from wordpress.org.
 */
export declare class CorePluginResource extends FetchResource {
    private resource;
    constructor(resource: CorePluginReference, progress?: ProgressTracker);
    /** @inheritDoc */
    get name(): string;
    /** @inheritDoc */
    getURL(): string;
}
/**
 * Transforms a plugin slug into a directory zip name.
 * If the input already ends with ".zip", returns it unchanged.
 * Otherwise, appends ".latest-stable.zip".
 */
export declare function toDirectoryZipName(rawInput: string): string;
/**
 * A decorator for a resource that adds caching functionality.
 */
export declare class CachedResource<T extends File | Directory> extends ResourceDecorator<T> {
    protected promise?: Promise<T>;
    /** @inheritDoc */
    resolve(): Promise<T>;
}
/**
 * A decorator for a resource that adds concurrency control functionality
 * through a semaphore.
 */
export declare class SemaphoreResource<T extends File | Directory> extends ResourceDecorator<T> {
    private readonly semaphore;
    constructor(resource: Resource<T>, semaphore: Semaphore);
    /** @inheritDoc */
    resolve(): Promise<T>;
}
