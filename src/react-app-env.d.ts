/// <reference types="react-scripts" />

import { Results } from "@mediapipe/hands"
import Hand from "services/Hand"
import { Gesture } from "services/Gesture"
import GestureDetector from "services/GestureDetector"
import {Scenes} from "services/util"

declare module "*.mp4";
declare module "*.png";

/**
 * Props for the scenes in this app.
 */
export interface SceneProps {
	/**
	 * Whether the screen is facing the user.
	 */
	isScreenFacingUser: boolean

	/**
	 * The GestureDetector that we can observe.
	 */
	gestureDetector: GestureDetector

	/**
	 * A callback to load one of the other scenes
	 */
	loadSceneCallback: (scene: Scenes) => void
}

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