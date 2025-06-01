type Listener = (...args: any[]) => any;
export interface ProcessOptions {
    cwd?: string;
    env?: Record<string, string>;
}
/**
 * Usage:
 * ```ts
 * php.setSpawnHandler(
 *   createSpawnHandler(function (command, processApi) {
 *     console.log(processApi.flushStdin());
 *     processApi.stdout('/\n/tmp\n/home');
 *	   processApi.exit(0);
 *   })
 * );
 * ```
 * @param program
 * @returns
 */
export declare function createSpawnHandler(program: (command: string[], processApi: ProcessApi, options: ProcessOptions) => void | Promise<void>): any;
declare class EventEmitter {
    listeners: Record<string, Listener[]>;
    emit(eventName: string, data: any): void;
    on(eventName: string, listener: Listener): void;
}
export declare class ProcessApi extends EventEmitter {
    private childProcess;
    private exited;
    private stdinData;
    constructor(childProcess: ChildProcess);
    stdout(data: string | ArrayBuffer): void;
    stdoutEnd(): void;
    stderr(data: string | ArrayBuffer): void;
    stderrEnd(): void;
    exit(code: number): void;
    flushStdin(): void;
}
export type StdIn = {
    write: (data: string) => void;
};
export declare class ChildProcess extends EventEmitter {
    pid: number;
    stdout: EventEmitter;
    stderr: EventEmitter;
    stdin: StdIn;
    constructor(pid?: number);
}
export {};
