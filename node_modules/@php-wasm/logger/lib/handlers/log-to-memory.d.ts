import type { LogHandler } from '../log-handlers';
export declare const logs: string[];
/**
 * Log to memory
 */
export declare const logToMemory: LogHandler;
export declare const clearMemoryLogs: () => void;
