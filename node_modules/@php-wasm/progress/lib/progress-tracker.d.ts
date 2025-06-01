/**
 * Options for customizing the progress tracker.
 */
export interface ProgressTrackerOptions {
    /** The weight of the progress, a number between 0 and 1. */
    weight?: number;
    /** The caption to display during progress, a string. */
    caption?: string;
    /** The time in milliseconds to fill the progress, a number. */
    fillTime?: number;
}
/**
 * Custom event providing information about a loading process.
 */
export type LoadingEvent = CustomEvent<{
    /** The number representing how much was loaded. */
    loaded: number;
    /** The number representing how much needs to loaded in total. */
    total: number;
}>;
/**
 * Custom event providing progress details.
 */
export type ProgressTrackerEvent = CustomEvent<ProgressDetails>;
/**
 * Custom event providing progress details when the task is done.
 */
export type DoneEvent = CustomEvent<ProgressDetails>;
export interface ProgressDetails {
    /** The progress percentage as a number between 0 and 100. */
    progress: number;
    /** The caption to display during progress, a string. */
    caption: string;
}
/**
 * ProgressObserver A function that receives progress updates.
 *
 * @param progress The progress percentage as a number between 0 and 100.
 */
type ProgressObserver = (progress: number) => void;
/**
 * Listener A function for handling specific event types.
 *
 * @param event The event of type T.
 */
export type Listener<T> = (event: T) => void;
export type TSCompatibleListener<T> = EventListenerOrEventListenerObject | null | Listener<T>;
export interface ProgressReceiver {
    setProgress(details: ProgressDetails): any;
    setLoaded(): any;
}
/**
 * The ProgressTracker class is a tool for tracking progress in an operation
 * that is divided into multiple stages. It allows you to create sub-trackers
 * for each stage, with individual weights and captions. The main tracker
 * automatically calculates the progress based on the weighted sum of each
 * sub-tracker's progress. This makes it easy to keep track of a complex,
 * multi-stage process and report progress in a user-friendly way.
 *
 * After creating the sub-trackers, you can call the set() method to update the
 * progress of the current stage. You can also call the finish() method to mark
 * the current stage as complete and move on to the next one. Alternatively,
 * you can call the fillSlowly() method to simulate progress filling up slowly
 * to 100% before calling finish().
 *
 * @example
 * ```ts
 * const tracker = new ProgressTracker();
 * tracker.addEventListener('progress', (e) => {
 * 		console.log(
 * 				e.detail.progress,
 * 				e.detail.caption
 * 		);
 * });
 *
 * const stage1 = tracker.stage(0.5, 'Calculating pi digits');
 * const stage2 = tracker.stage(0.5, 'Downloading data');
 *
 * stage1.fillSlowly();
 * await calc100DigitsOfPi();
 * stage1.finish();
 *
 * await fetchWithProgress(function onProgress(loaded, total) {
 * 		stage2.set( loaded / total * 100);
 * });
 * stage2.finish();
 */
export declare class ProgressTracker extends EventTarget {
    private _selfWeight;
    private _selfDone;
    private _selfProgress;
    private _selfCaption;
    private _weight;
    private _progressObserver?;
    private _loadingListener?;
    private _isFilling;
    private _fillTime;
    private _fillInterval?;
    private _subTrackers;
    constructor({ weight, caption, fillTime, }?: ProgressTrackerOptions);
    /**
     * Creates a new sub-tracker with a specific weight.
     *
     * The weight determines what percentage of the overall progress
     * the sub-tracker represents. For example, if the main tracker is
     * monitoring a process that has two stages, and the first stage
     * is expected to take twice as long as the second stage, you could
     * create the first sub-tracker with a weight of 0.67 and the second
     * sub-tracker with a weight of 0.33.
     *
     * The caption is an optional string that describes the current stage
     * of the operation. If provided, it will be used as the progress caption
     * for the sub-tracker. If not provided, the main tracker will look for
     * the next sub-tracker with a non-empty caption and use that as the progress
     * caption instead.
     *
     * Returns the newly-created sub-tracker.
     *
     * @throws {Error} If the weight of the new stage would cause the total weight of all stages to exceed 1.
     *
     * @param weight The weight of the new stage, as a decimal value between 0 and 1.
     * @param caption The caption for the new stage, which will be used as the progress caption for the sub-tracker.
     *
     * @example
     * ```ts
     * const tracker = new ProgressTracker();
     * const subTracker1 = tracker.stage(0.67, 'Slow stage');
     * const subTracker2 = tracker.stage(0.33, 'Fast stage');
     *
     * subTracker2.set(50);
     * subTracker1.set(75);
     * subTracker2.set(100);
     * subTracker1.set(100);
     * ```
     */
    stage(weight?: number, caption?: string): ProgressTracker;
    /**
     * Fills the progress bar slowly over time, simulating progress.
     *
     * The progress bar is filled in a 100 steps, and each step, the progress
     * is increased by 1. If `stopBeforeFinishing` is true, the progress bar
     * will stop filling when it reaches 99% so that you can call `finish()`
     * explicitly.
     *
     * If the progress bar is filling or already filled, this method does nothing.
     *
     * @example
     * ```ts
     * const progress = new ProgressTracker({ caption: 'Processing...' });
     * progress.fillSlowly();
     * ```
     *
     * @param options Optional options.
     */
    fillSlowly({ stopBeforeFinishing }?: {
        stopBeforeFinishing?: boolean | undefined;
    }): void;
    set(value: number): void;
    finish(): void;
    get caption(): string;
    setCaption(caption: string): void;
    get done(): boolean;
    get progress(): number;
    get weight(): number;
    get observer(): ProgressObserver;
    get loadingListener(): Listener<LoadingEvent>;
    pipe(receiver: ProgressReceiver): void;
    addEventListener(type: string, listener: TSCompatibleListener<ProgressTrackerEvent>): void;
    removeEventListener(type: string, listener: TSCompatibleListener<ProgressTrackerEvent>): void;
    private notifyProgress;
    private notifyDone;
}
export {};
