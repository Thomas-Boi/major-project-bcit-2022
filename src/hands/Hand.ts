import { LandmarkList, Landmark } from "@mediapipe/hands";
import { LANDMARK_INDEX } from "./handsInfo";
import { Gesture, InvalidDirections, ValidDirections } from "./Gesture";
import { Finger, Thumb } from "./Finger";
import { FingerState } from "./Gesture"


/**
 * Represents a hand that was detected by the HandTracker.
 */
export default class Hand {
	/**
	 * The wrist of the hand
	 */
	wrist: Landmark

	/**
	 * The thumb joints.
	 */
	thumb: Thumb

	/**
	 * The index finger joints.
	 */
	index: Finger

	/**
	 * The middle finger joints.
	 */
	middle: Finger

	/**
	 * The ring finger joints.
	 */
	ring: Finger

	/**
	 * The pinky finger joints.
	 */
	pinky: Finger

	/**
	 * The names of the finger.
	 */
	fingerNames: Array<string>

	constructor(hand: LandmarkList) {
		this.wrist = hand[LANDMARK_INDEX.WRIST]
		this.thumb = new Thumb(hand.slice(LANDMARK_INDEX.THUMB_CMC, LANDMARK_INDEX.THUMB_TIP + 1))
		this.index = new Finger(hand.slice(LANDMARK_INDEX.INDEX_FINGER_MCP, LANDMARK_INDEX.INDEX_FINGER_TIP + 1))
		this.middle = new Finger(hand.slice(LANDMARK_INDEX.MIDDLE_FINGER_MCP, LANDMARK_INDEX.MIDDLE_FINGER_TIP + 1))
		this.ring = new Finger(hand.slice(LANDMARK_INDEX.RING_FINGER_MCP, LANDMARK_INDEX.RING_FINGER_TIP + 1))
		this.pinky = new Finger(hand.slice(LANDMARK_INDEX.PINKY_MCP, LANDMARK_INDEX.PINKY_TIP + 1))

		// console.log("thumb")
		this.thumb.analyzeFinger();
		// console.log("index")
		this.index.analyzeFinger();
		// console.log("middle")
		this.middle.analyzeFinger();
		// console.log("ring")
		this.ring.analyzeFinger();
		// console.log("pinky")
		this.pinky.analyzeFinger();

		this.fingerNames = [
			"thumb",
			"index",
			"middle",
			"ring",
			"pinky"
		]
	}


	/**
	 * Determine the gesture that the hand is making.
	 * @returns whether the hand is making the gesture passed in. 
	 */
	matches(gesture: Gesture): boolean {
		// if (gesture.name == "five") {
		// 	console.log("Checking gesture:", gesture.name)
		// }
		for (let fingerName of this.fingerNames) {
			let finger: Finger = this[fingerName]
			let fingerState: FingerState = gesture[fingerName]

			if (fingerState.isStraight !== null) {
				if (fingerState.isStraight !== finger.isStraight) {
					// if (gesture.name == "GRAB_FIST") {
					// 	console.log("Failed at finger straightness: ", fingerName, finger.isStraight)
					// }
					return false
				}
			}

			// don't need to check anything since it's null aka doesn't matter
			if (fingerState.direction === null) continue

			let searchResult = fingerState.direction.find(
					direction => finger.direction.equals(direction)) 

			if (fingerState.direction instanceof ValidDirections && searchResult === undefined) {
				// if (gesture.name == "GRAB_FIST") console.log("Failed at finger direction: ", {
				// 	fingerName,
				// 	direction: finger.direction
				// })
				return false // doesn't match any => finger failed => whole gesture fails
			}
			else if (fingerState.direction instanceof InvalidDirections && searchResult !== undefined) {
				// if (gesture.name == "GRAB_FIST") console.log("Failed at finger: ", fingerName)
				return false // match invalid vector => finger failed
			}
		}
		// if (gesture.name == "five") console.log("matches")
		return true
	}

}