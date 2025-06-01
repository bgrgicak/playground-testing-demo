/**
 * Other WebAssembly declarations, for compatibility with older versions of
 * Typescript
 */
export declare namespace Emscripten {
    export interface RootFS extends Emscripten.FileSystemInstance {
        filesystems: Record<string, Emscripten.FileSystemType>;
    }
    export interface FileSystemType {
        mount(mount: FS.Mount): FS.FSNode;
        syncfs(mount: FS.Mount, populate: () => unknown, done: (err?: number | null) => unknown): void;
    }
    export type EnvironmentType = 'WEB' | 'NODE' | 'SHELL' | 'WORKER';
    export type JSType = 'number' | 'string' | 'array' | 'boolean';
    export type TypeCompatibleWithC = number | string | any[] | boolean;
    export type CIntType = 'i8' | 'i16' | 'i32' | 'i64';
    export type CFloatType = 'float' | 'double';
    export type CPointerType = 'i8*' | 'i16*' | 'i32*' | 'i64*' | 'float*' | 'double*' | '*';
    export type CType = CIntType | CFloatType | CPointerType;
    export interface CCallOpts {
        async?: boolean | undefined;
    }
    type NamespaceToInstance<T> = {
        [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : never;
    };
    export type FileSystemInstance = NamespaceToInstance<typeof FS> & {
        mkdirTree(path: string): void;
        lookupPath(path: string, opts?: any): FS.Lookup;
    };
    export interface EmscriptenModule {
        print(str: string): void;
        printErr(str: string): void;
        arguments: string[];
        environment: Emscripten.EnvironmentType;
        preInit: Array<{
            (): void;
        }>;
        preRun: Array<{
            (): void;
        }>;
        postRun: Array<{
            (): void;
        }>;
        onAbort: {
            (what: any): void;
        };
        onRuntimeInitialized: {
            (): void;
        };
        preinitializedWebGLContext: WebGLRenderingContext;
        noInitialRun: boolean;
        noExitRuntime: boolean;
        logReadFiles: boolean;
        filePackagePrefixURL: string;
        wasmBinary: ArrayBuffer;
        destroy(object: object): void;
        getPreloadedPackage(remotePackageName: string, remotePackageSize: number): ArrayBuffer;
        instantiateWasm(imports: WebAssembly.Imports, successCallback: (module: WebAssembly.Instance) => void): WebAssembly.Exports | undefined;
        locateFile(url: string, scriptDirectory: string): string;
        onCustomMessage(event: MessageEvent): void;
        HEAP: Int32Array;
        IHEAP: Int32Array;
        FHEAP: Float64Array;
        HEAP8: Int8Array;
        HEAP16: Int16Array;
        HEAP32: Int32Array;
        HEAPU8: Uint8Array;
        HEAPU16: Uint16Array;
        HEAPU32: Uint32Array;
        HEAPF32: Float32Array;
        HEAPF64: Float64Array;
        HEAP64: BigInt64Array;
        HEAPU64: BigUint64Array;
        TOTAL_STACK: number;
        TOTAL_MEMORY: number;
        FAST_MEMORY: number;
        addOnPreRun(cb: () => any): void;
        addOnInit(cb: () => any): void;
        addOnPreMain(cb: () => any): void;
        addOnExit(cb: () => any): void;
        addOnPostRun(cb: () => any): void;
        preloadedImages: any;
        preloadedAudios: any;
        _malloc(size: number): number;
        _free(ptr: number): void;
    }
    /**
     * A factory function is generated when setting the `MODULARIZE` build option
     * to `1` in your Emscripten build. It return a Promise that resolves to an
     * initialized, ready-to-call `EmscriptenModule` instance.
     *
     * By default, the factory function will be named `Module`. It's recommended
     * to use the `EXPORT_ES6` option, in which the factory function will be the
     * default export. If used without `EXPORT_ES6`, the factory function will be
     * a global variable. You can rename the variable using the `EXPORT_NAME`
     * build option. It's left to you to export any global variables as needed in
     * your application's types.
     * @param moduleOverrides Default properties for the initialized module.
     */
    export type EmscriptenModuleFactory<T extends EmscriptenModule = EmscriptenModule> = (moduleOverrides?: Partial<T>) => Promise<T>;
    export namespace FS {
        interface Lookup {
            path: string;
            node: FSNode;
        }
        interface Analyze {
            isRoot: boolean;
            exists: boolean;
            error: Error;
            name: string;
            path: Lookup['path'];
            object: Lookup['node'];
            parentExists: boolean;
            parentPath: Lookup['path'];
            parentObject: Lookup['node'];
        }
        interface Mount {
            type: Emscripten.FileSystemType;
            opts: object;
            mountpoint: string;
            mounts: Mount[];
            root: FSNode;
        }
        class FSStream {
            constructor();
            object: FSNode;
            readonly isRead: boolean;
            readonly isWrite: boolean;
            readonly isAppend: boolean;
            flags: number;
            position: number;
        }
        class FSNode {
            parent: FSNode;
            mount: Mount;
            mounted?: Mount;
            id: number;
            name: string;
            mode: number;
            rdev: number;
            readMode: number;
            writeMode: number;
            constructor(parent: FSNode, name: string, mode: number, rdev: number);
            read: boolean;
            write: boolean;
            readonly isFolder: boolean;
            readonly isDevice: boolean;
        }
        interface ErrnoError extends Error {
            name: 'ErronoError';
            errno: number;
            code: string;
        }
        function lookupPath(path: string, opts: any): Lookup;
        function getPath(node: FSNode): string;
        function analyzePath(path: string, dontResolveLastLink?: boolean): Analyze;
        function isFile(mode: number): boolean;
        function isDir(mode: number): boolean;
        function isLink(mode: number): boolean;
        function isChrdev(mode: number): boolean;
        function isBlkdev(mode: number): boolean;
        function isFIFO(mode: number): boolean;
        function isSocket(mode: number): boolean;
        function major(dev: number): number;
        function minor(dev: number): number;
        function makedev(ma: number, mi: number): number;
        function registerDevice(dev: number, ops: any): void;
        function syncfs(populate: boolean, callback: (e: any) => any): void;
        function syncfs(callback: (e: any) => any, populate?: boolean): void;
        function mount(type: Emscripten.FileSystemType, opts: any, mountpoint: string): any;
        function unmount(mountpoint: string): void;
        function mkdir(path: string, mode?: number): any;
        function mkdev(path: string, mode?: number, dev?: number): any;
        function symlink(oldpath: string, newpath: string): any;
        function rename(old_path: string, new_path: string): void;
        function rmdir(path: string): void;
        function readdir(path: string): any;
        function unlink(path: string): void;
        function readlink(path: string): string;
        function stat(path: string, dontFollow?: boolean): any;
        function lstat(path: string): any;
        function chmod(path: string, mode: number, dontFollow?: boolean): void;
        function lchmod(path: string, mode: number): void;
        function fchmod(fd: number, mode: number): void;
        function chown(path: string, uid: number, gid: number, dontFollow?: boolean): void;
        function lchown(path: string, uid: number, gid: number): void;
        function fchown(fd: number, uid: number, gid: number): void;
        function truncate(path: string, len: number): void;
        function ftruncate(fd: number, len: number): void;
        function utime(path: string, atime: number, mtime: number): void;
        function open(path: string, flags: string, mode?: number, fd_start?: number, fd_end?: number): FSStream;
        function close(stream: FSStream): void;
        function llseek(stream: FSStream, offset: number, whence: number): any;
        function read(stream: FSStream, buffer: ArrayBufferView, offset: number, length: number, position?: number): number;
        function write(stream: FSStream, buffer: ArrayBufferView, offset: number, length: number, position?: number, canOwn?: boolean): number;
        function allocate(stream: FSStream, offset: number, length: number): void;
        function mmap(stream: FSStream, buffer: ArrayBufferView, offset: number, length: number, position: number, prot: number, flags: number): any;
        function ioctl(stream: FSStream, cmd: any, arg: any): any;
        function readFile(path: string, opts: {
            encoding: 'binary';
            flags?: string | undefined;
        }): Uint8Array;
        function readFile(path: string, opts: {
            encoding: 'utf8';
            flags?: string | undefined;
        }): string;
        function readFile(path: string, opts?: {
            flags?: string | undefined;
        }): Uint8Array;
        function writeFile(path: string, data: string | ArrayBufferView, opts?: {
            flags?: string | undefined;
        }): void;
        function cwd(): string;
        function chdir(path: string): void;
        function init(input: null | (() => number | null), output: null | ((c: number) => any), error: null | ((c: number) => any)): void;
        function createLazyFile(parent: string | FSNode, name: string, url: string, canRead: boolean, canWrite: boolean): FSNode;
        function createPreloadedFile(parent: string | FSNode, name: string, url: string, canRead: boolean, canWrite: boolean, onload?: () => void, onerror?: () => void, dontCreateFile?: boolean, canOwn?: boolean): void;
        function createDataFile(parent: string | FSNode, name: string, data: ArrayBufferView, canRead: boolean, canWrite: boolean, canOwn: boolean): FSNode;
    }
    export const MEMFS: Emscripten.FileSystemType;
    export const NODEFS: Emscripten.FileSystemType;
    export const IDBFS: Emscripten.FileSystemType;
    type StringToType<R> = R extends Emscripten.JSType ? {
        number: number;
        string: string;
        array: number[] | string[] | boolean[] | Uint8Array | Int8Array;
        boolean: boolean;
        null: null;
    }[R] : never;
    type ArgsToType<T extends Array<Emscripten.JSType | null>> = Extract<{
        [P in keyof T]: StringToType<T[P]>;
    }, any[]>;
    type ReturnToType<R extends Emscripten.JSType | null> = R extends null ? null : StringToType<Exclude<R, null>>;
    export function cwrap<I extends Array<Emscripten.JSType | null> | [], R extends Emscripten.JSType | null>(ident: string, returnType: R, argTypes: I, opts?: Emscripten.CCallOpts): (...arg: ArgsToType<I>) => ReturnToType<R>;
    export function ccall<I extends Array<Emscripten.JSType | null> | [], R extends Emscripten.JSType | null>(ident: string, returnType: R, argTypes: I, args: ArgsToType<I>, opts?: Emscripten.CCallOpts): ReturnToType<R>;
    export function setValue(ptr: number, value: any, type: Emscripten.CType, noSafe?: boolean): void;
    export function getValue(ptr: number, type: Emscripten.CType, noSafe?: boolean): number;
    export function allocate(slab: number[] | ArrayBufferView | number, types: Emscripten.CType | Emscripten.CType[], allocator: number, ptr?: number): number;
    export function stackAlloc(size: number): number;
    export function stackSave(): number;
    export function stackRestore(ptr: number): void;
    export function UTF8ToString(ptr: number, maxBytesToRead?: number): string;
    export function stringToUTF8(str: string, outPtr: number, maxBytesToRead?: number): void;
    export function lengthBytesUTF8(str: string): number;
    export function allocateUTF8(str: string): number;
    export function allocateUTF8OnStack(str: string): number;
    export function UTF16ToString(ptr: number): string;
    export function stringToUTF16(str: string, outPtr: number, maxBytesToRead?: number): void;
    export function lengthBytesUTF16(str: string): number;
    export function UTF32ToString(ptr: number): string;
    export function stringToUTF32(str: string, outPtr: number, maxBytesToRead?: number): void;
    export function lengthBytesUTF32(str: string): number;
    export function intArrayFromString(stringy: string, dontAddNull?: boolean, length?: number): number[];
    export function intArrayToString(array: number[]): string;
    export function writeStringToMemory(str: string, buffer: number, dontAddNull: boolean): void;
    export function writeArrayToMemory(array: number[], buffer: number): void;
    export function writeAsciiToMemory(str: string, buffer: number, dontAddNull: boolean): void;
    export function addRunDependency(id: any): void;
    export function removeRunDependency(id: any): void;
    export function addFunction(func: (...args: any[]) => any, signature?: string): number;
    export function removeFunction(funcPtr: number): void;
    export const ALLOC_NORMAL: number;
    export const ALLOC_STACK: number;
    export const ALLOC_STATIC: number;
    export const ALLOC_DYNAMIC: number;
    export const ALLOC_NONE: number;
    export {};
}
