import * as Gesture from "./Gesture"
import { Results } from "@mediapipe/hands"
import Hand from "./Hand"
import { Observable, GestureDetectorObserver } from "react-app-env"


// when the track counter pass this threshold,
// we are confident that the user is intentionally making a shape 
// with their hand and not due to noises.
const SHAPE_COUNTER_THRESHOLD = 7

/**
 * Detect the gesture based on the raw hand data from the HandTracker.
 */
export default class GestureDetector implements Observable<GestureDetectorObserver> {
	/**
	 * Hold information on the state of the user's current hand.
	 */
	hand: Hand

	/**
	 * Hold information on the state of the user's previous hand.
	 */
	prevHand: Hand

	/**
	 * Track when we need to switch to a new state. 
	 * Used to set the confirmedGesture.
	 */
	gestureCounter: number

	/**
	 * The confirmed gesture of the user's hand.
	 */
	confirmedGesture: null | Gesture.Gesture

	/**
	 * The latest shape that we detected from the user.
	 */
	latestGesture: null | Gesture.Gesture

	/**
	 * The current time in milisecond.
	 */
	gestureStartTime: number

	/**
	 * The gestures we want the controller to look for.
	 */
	gesturesToDetect: Array<Gesture.Gesture>

	/**
	 * The observers that are registered to get data from HandTracker
	 * once it finishes parsing it.
	 */
	observers: Map<String, GestureDetectorObserver>

	constructor() {
		this.hand = null
		
		// set to null because we can check whether we need to
		// make a new hand or just use this.hand after we are done.
		this.prevHand = null

		this.confirmedGesture = Gesture.NONE
		this.gestureCounter = 0
		this.gesturesToDetect = []
		this.observers = new Map()
	}

	/**
	 * Add the gestures we want the gesture to detect.
	 * Since detecting gestures take some computing cycles,
	 * it's best to only add what you want to look for.
	 * Example: detecting all shapes is not as efficient as 
	 * looking out for 4 or 5 shapes that you really need.
	 * @param gestures the gestures the observers want to watch out
	 * for.
	 */
	addGesturesToDetect(gestures: Array<Gesture.Gesture>) {
		for (let gesture of gestures) {
			if (this.gesturesToDetect.includes(gesture)) continue
			this.gesturesToDetect.push(gesture)
		}
	}

	/**
	 * Remove all the gestures to detect.
	 * This is useful when we want to swap out the observer of this 
	 * object.
	 */
	removeAllGesturesToDetect() {
		this.gesturesToDetect = []
	}

	/**
	 * Handle the update callback from HandTracker.
	 * @param results a MediaPipe Hands result object.
	 */
	onResultsCallback = (results: Results | null) => {
		// check and see the state of the Controller, which is
		// the current hand gesture of the user.
		this.detectShape(results)

		// using forEach allows JS to interrupt the update chain => use a for loop instead
		for (let observer of this.observers.values()) {
			observer(this.hand, this.prevHand, this.confirmedGesture, this.gestureStartTime)
		}
	}

	/**
	 * Detect the shape of the user's hand.
	 */
	detectShape(results: Results | null) {
		// save the hand to prevHand for whatever we had before
		this.prevHand = this.hand

		// check if the result is usable
		// if not, mark this.prevHand to null to signify
		// we can't do any calculations.
		let newGesture: Gesture.Gesture = Gesture.UNKNOWN
		if (!results || results.multiHandLandmarks.length === 0) {
			this.hand = null
			newGesture = Gesture.NONE
		}
		else {
			// flip if needed
			// this.hand = new Hand( results.multiHandLandmarks[0].map(val => {
			// 	val.y *= -1
			// 	return val
			// }))
			// valid data => start analyzing the shape
			this.hand = new Hand(results.multiHandLandmarks[0])
			for (let gesture of this.gesturesToDetect) {
				if (this.hand.matches(gesture)) {
					newGesture = gesture
					break
				}
			}
		}

		// matching our state => do nothing and continue as normal
		if (newGesture === this.confirmedGesture) {
			this.latestGesture = newGesture
			return
		}

		// new gesture we never see before => start counting
		if (newGesture !== this.latestGesture) {
			this.gestureCounter = 1
		}
		// we've seen this gesture recently => user might be switching
		// so we start counting
		else this.gestureCounter++

		// pretty sure this is what the user wants => switch to the new state
		if (this.gestureCounter >= SHAPE_COUNTER_THRESHOLD) {
			this.confirmedGesture = newGesture
			// only get the time when switch to new gesture
			this.gestureStartTime = Date.now()
		}
		this.latestGesture = newGesture

	}

	/**
	 * Add an observer to the HandTracker.
	 * @param observer a callback function matching the required signature.
	 * @param key the name of the observer. 
	 */
	addObserver(observer: GestureDetectorObserver, key: String) {
		this.observers.set(key, observer)
	}

	/**
	 * Remove a observer based on the name.
	 * @param key the observer that we want to remove. Could pass in
	 * either the function or the key that was used to add the observer.
	 * @return true if the object was deleted. Else, false.
	 */
	removeObserver(key: String) {
		return this.observers.delete(key)
	}
}