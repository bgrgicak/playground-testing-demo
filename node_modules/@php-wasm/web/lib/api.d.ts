import * as Comlink from 'comlink';
export type WithAPIState = {
    /**
     * Resolves to true when the remote API is ready for
     * Comlink communication, but not necessarily fully initialized yet.
     */
    isConnected: () => Promise<void>;
    /**
     * Resolves to true when the remote API is declares it's
     * fully loaded and ready to be used.
     */
    isReady: () => Promise<void>;
};
export type RemoteAPI<T> = Comlink.Remote<T> & WithAPIState;
export declare function consumeAPI<APIType>(remote: Worker | Window, context?: undefined | EventTarget): RemoteAPI<APIType>;
export type PublicAPI<Methods, PipedAPI = unknown> = RemoteAPI<Methods & PipedAPI>;
export declare function exposeAPI<Methods, PipedAPI>(apiMethods?: Methods, pipedApi?: PipedAPI): [() => void, (e: Error) => void, PublicAPI<Methods, PipedAPI>];
