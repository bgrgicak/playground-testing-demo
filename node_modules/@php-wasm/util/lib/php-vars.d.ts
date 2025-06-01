export declare function phpVar(value: unknown): string;
export declare function phpVars<T extends Record<string, unknown>>(vars: T): Record<keyof T, string>;
