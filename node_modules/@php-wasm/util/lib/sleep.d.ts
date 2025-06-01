export declare const SleepFinished: unique symbol;
export declare function sleep(ms: number): Promise<typeof SleepFinished>;
