import { Hands, Results } from "@mediapipe/hands"
import { Observable, HandTrackerObserver } from "../types"


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
			return `build/libs/${file}`
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
	 * @param observer a new listener.
	 * @param key the name of the listener. Default is
	 * a random value if you don't intend to reaccess the
	 * listener.
	 */
	addObserver(observer: HandTrackerObserver, key: String=null) {
		if (key === null) key = `${new Date().getTime()}`
		this.observers.set(key, observer)
	}

	/**
	 * Remove a observer based on the name.
	 * @param key the listener's name that we want to remove.
	 * @return true if the object was deleted. Else, false.
	 */
	removeObserver(key: String) {
		return this.observers.delete(key)
	}
}