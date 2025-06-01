declare const kError: unique symbol;
declare const kMessage: unique symbol;
interface ErrorEventOptions {
    error?: Error;
    message?: string;
}
/**
 * Class representing an error event.
 *
 * @extends Event
 */
declare class ErrorEvent2 extends Event {
    [kError]: any;
    [kMessage]: any;
    /**
     * Create a new `ErrorEvent`.
     *
     * @param type The name of the event
     * @param options A dictionary object that allows for setting
     *                  attributes via object members of the same name.
     */
    constructor(type: 'error', options?: ErrorEventOptions);
    get error(): any;
    get message(): any;
}
export declare const ErrorEvent: typeof ErrorEvent2 | {
    new (type: string, eventInitDict?: ErrorEventInit | undefined): ErrorEvent;
    prototype: ErrorEvent;
};
export {};
