import { Results } from "@mediapipe/hands";
import Hand from "./hands/Hand";
import { Gesture } from "./hands/Gesture";

/**
 * Something that can be observed (Observer Pattern).
 * T == a function type that matches the spefication of the Observable.
 */
export interface Observable<T> {
  observers: Map<String, T>
  addObserver: (observer: T, key: string) => void
  removeObserver: (key: string) => void
}

/**
 * Handle the observer update event of the HandTracker.
 * @param results the result of the data parsing.
 */
export type HandTrackerObserver = (results: Results | null) => (void)

/**
 * Handle the observer update event of the GestureDetector.
 * @param hand the current hand the user is making
 * @param prevHand, the previous hand the user had a frame before.
 * @param curGesture, the gesture the user is making now.
 * @param gestureStartTime, the time when the gesture started.
 */
export type GestureDetectorObserver = (hand: Hand | null, prevHand: Hand | null, curGesture: Gesture, gestureStartTime: number) => void