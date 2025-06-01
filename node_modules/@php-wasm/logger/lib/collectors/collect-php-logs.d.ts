import type { UniversalPHP } from '../types';
import { Logger } from '../logger';
export declare const errorLogPath = "/wordpress/wp-content/debug.log";
/**
 * Collect PHP logs from the error_log file and log them.
 * @param UniversalPHP playground instance
 * @param loggerInstance The logger instance
 */
export declare const collectPhpLogs: (loggerInstance: Logger, playground: UniversalPHP) => void;
