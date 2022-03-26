import { Hands, Results } from "@mediapipe/hands"
import { Observable, HandTrackerObserver } from "../react-app-env"


/**
 * Track the hands using the MediaPipe Hands then preprocess
 * it to intepret gestures.
 */
export default class HandTracker implements Observable<HandTrackerObserver>{
	/**
	 * The MediaPipe Hands object.
	 */
	hands: Hands

	/**
	 * The observers that are registered to get data from HandTracker
	 * once it finishes parsing it.
	 */
	observers: Map<String, HandTrackerObserver>

	constructor() {
		let hands = new Hands({locateFile: (file) => {
			return `${process.env.PUBLIC_URL}/libs/${file}`
		}})

		hands.setOptions({
			maxNumHands: 1, // only need one hand
			modelComplexity: 1,
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5
		})

		hands.onResults(this.onResultsCallback.bind(this))

		this.hands = hands
		this.observers = new Map()
	}

	/**
	 * Handle the onResults event of the Hands tracker.
	 */
	onResultsCallback(results: Results) {
		this.observers.forEach(observer => observer(results))
	}

	/**
	 * Add an observer to the HandTracker.
	 * @param observer a callback function matching the required signature.
	 * @param key the name of the observer. Default is
	 * the observer function's name.
	 */
	addObserver(observer: HandTrackerObserver, key: String=observer.name) {
		this.observers.set(key, observer)
	}

	/**
	 * Remove a observer based on the name.
	 * @param key the observer that we want to remove. Could pass in
	 * either the function or the key that was used to add the observer.
	 * @return true if the object was deleted. Else, false.
	 */
	removeObserver(key: String | Function) {
		if (typeof key == "function") key = key.name
		return this.observers.delete(key)
	}
}