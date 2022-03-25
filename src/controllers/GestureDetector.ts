import * as Gesture from "../hands/Gesture"
import { Results } from "@mediapipe/hands"
import Hand from "../hands/Hand"
import { Observable, GestureDetectorObserver } from "../types"


// when the track counter pass this threshold,
// we are confident that the user is intentionally making a shape 
// with their hand and not due to noises.
const SHAPE_COUNTER_THRESHOLD = 7

// report the status to the user
const detectedSign = document.getElementById("detectedSign")
const gestureName = document.getElementById("gestureName")

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
		this.gesturesToDetect.push(...gestures)
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
	onResultsCallback(results: Results | null) {
		// check and see the state of the Controller, which is
		// the current hand gesture of the user.
		this.detectShape(results)
		this.observers.forEach(observer => observer(this.hand, this.prevHand, this.confirmedGesture))
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
		let newGesture: Gesture.Gesture = null
		if (!results || results.multiHandLandmarks.length === 0) {
			detectedSign.style.backgroundColor = "#ff0007"  // bright red
			this.hand = null
		}
		else {
			// valid data => start analyzing the shape
			detectedSign.style.backgroundColor = "#02fd49" // neon green
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
			gestureName.innerText = this.confirmedGesture?.name || "NONE"
		}
		this.latestGesture = newGesture

	}

	/**
	 * Handle an update when we receive a hand data.
	 * Subclasses should override this method.
	 * @abstract
	 * @param results the result of the data parsing.
	 */
	update(results: Results | null) { }

	/**
	 * Add an observer to the HandTracker.
	 * @param observer a new listener.
	 * @param key the name of the listener. Default is
	 * a random value if you don't intend to reaccess the
	 * listener.
	 */
	addObserver(observer: GestureDetectorObserver, key: String=null) {
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