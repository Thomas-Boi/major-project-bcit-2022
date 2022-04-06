import { Vector3 } from "babylonjs"
// import { DIRECTION } from "./handsInfo"

/**
 * NOTE: All gestures are created from the POV of the viewer.
 */

/**
 * A specialized array that holds valid directions
 * for a finger to point at. This means if the finger
 * matches the state in the array, it counts as valid.
 */
export class ValidDirections extends Array<Vector3> {
}

/**
 * A specialized array that holds invalid directions
 * for a finger to point at. This means if the finger
 * matches the state in the array, it's invalid.
 */
export class InvalidDirections extends Array<Vector3> {
}

export interface FingerState {
	/**
	 * Whether the finger is straight/fully extended.
	 * Null is for when it doesn't matter.
	 */
	isStraight: boolean | null

	/**
	 * Represent the closest allowed vector(s) that the finger is pointing to (for
	 * ValidDirections<Vector3>) OR the not-allowed vector(s) (for InvalidDirections<Vector3>).
	 * It is up to the user to check which type it is.
	 * The allowed vectors are the ones in DIRECTION or combination
	 * of them. So DIRECTION.UP is allowed, so is DIRECTION.UP + DIRECTION.RIGHT.
	 * Null is for when it doesn't matter.
	 */
	direction: ValidDirections | InvalidDirections | null
}

export class Gesture {
	/**
	 * Name of the gesture.
	 */
	name: string

	/**
	 * The thumb joints.
	 */
	thumb: FingerState

	/**
	 * The index finger joints.
	 */
	index: FingerState

	/**
	 * The middle finger joints.
	 */
	middle: FingerState

	/**
	 * The ring finger joints.
	 */
	ring: FingerState

	/**
	 * The pinky finger joints.
	 */
	pinky: FingerState

	/**
	 * Let typescript know we can access these properties using string.
	 */
	[key: string]: Gesture[keyof Gesture]

	constructor(name: string, thumb: FingerState=CLOSED_THUMB, index: FingerState=GENERAL_CLOSED_FINGER,
		middle: FingerState=GENERAL_CLOSED_FINGER, ring: FingerState=GENERAL_CLOSED_FINGER, pinky: FingerState=GENERAL_CLOSED_FINGER) {
		
		this.name = name
		this.thumb = thumb
		this.index = index
		this.middle = middle
		this.ring = ring
		this.pinky = pinky
	}
}

///////////////////////////// FINGERS //////////////////////////////

/**
 * The state of a closed non-thumb finger 
 */
const GENERAL_CLOSED_FINGER: FingerState = {
	isStraight: false,
	direction: null
}

/**
 * The state of a closed non-thumb finger for a grabbing motion.
 */
const GRAB_CLOSED_FINGER: FingerState = {
	isStraight: false,
	direction: new ValidDirections(
		Vector3.Down(),
		// Vector3.Down().add(DIRECTION.AWAY_FROM_SCREEN())
	)
}

/**
 * The state of a closed non-thumb finger for a thumbs up gesture.
 */
const THUMBS_UP_CLOSED_FINGER: FingerState = {
	isStraight: false,
	direction: new ValidDirections(
		Vector3.Right(),
		Vector3.Right().add(Vector3.Down()),
		// Vector3.Right().add(DIRECTION.AWAY_FROM_SCREEN()),
		Vector3.Down(),
		// Vector3.Down().add(DIRECTION.AWAY_FROM_SCREEN()),
		// Vector3.Right().add(Vector3.Down()).add(DIRECTION.AWAY_FROM_SCREEN())
	)
}

/**
 * The state of an opened finger pointing up.
 */
const UP_FINGER: FingerState = {
	isStraight: true,
	direction: new ValidDirections(
		Vector3.Up(),
		Vector3.Up().add(Vector3.Left()),
		Vector3.Up().add(Vector3.Right())
	)
}

/**
 * The shape of the finger to rotate an object around the x axis globally.
 * This means the right hand's index finger is 
 */
const ROTATE_X_INDEX_FINGER: FingerState = {
	isStraight: true,
	direction: new ValidDirections(
		Vector3.Right(),
		// Vector3.Right().add(DIRECTION.AWAY_FROM_SCREEN()),
	)
}
///////////////////////////// THUMBS //////////////////////////////
/**
 * The state of an opened thumb pointing outwards from palm.
 * Account for right hand only.
 */
const OUTWARD_THUMB: FingerState = {
	isStraight: true,
	direction: new ValidDirections(
		Vector3.Right(),
		Vector3.Right().add(Vector3.Up()),
		// Vector3.Right().add(Vector3.Up()).add(DIRECTION.AWAY_FROM_SCREEN()),
		// Vector3.Right().add(DIRECTION.AWAY_FROM_SCREEN()),
		// DIRECTION.AWAY_FROM_SCREEN()
	)
}

/**
 * The state of a closed thumb. Opposite of an outward thumb.
 */
const CLOSED_THUMB: FingerState = {
	isStraight: null,
	direction: new InvalidDirections(
		Vector3.Right(),
		Vector3.Right().add(Vector3.Up()),
		// Vector3.Right().add(Vector3.Up()).add(DIRECTION.AWAY_FROM_SCREEN()),
		// Vector3.Right().add(DIRECTION.AWAY_FROM_SCREEN()),
		// Vector3.Up().add(DIRECTION.AWAY_FROM_SCREEN()),
		// Vector3.Up().add(DIRECTION.TOWARD_SCREEN())
	)
}

/**
 * The thumb for a thumbs up.
 */
const THUMBS_UP_THUMB: FingerState = {
	isStraight: true,
	direction: new ValidDirections(
		Vector3.Up(),
		// Vector3.Up().add(DIRECTION.TOWARD_SCREEN()),
	)
}



///////////////////////////// GESTURES //////////////////////////////

/**
 * Some preset common gestures.
 */
export const CLOSED_FIST = new Gesture("CLOSED_FIST")
export const ONE = new Gesture("ONE", CLOSED_THUMB, UP_FINGER)
export const TWO = new Gesture("TWO", CLOSED_THUMB, UP_FINGER, UP_FINGER)
export const THREE = new Gesture("THREE", CLOSED_THUMB, UP_FINGER, UP_FINGER, UP_FINGER)
export const FOUR = new Gesture("FOUR", CLOSED_THUMB, UP_FINGER, UP_FINGER, UP_FINGER, UP_FINGER)
export const FIVE = new Gesture("FIVE", OUTWARD_THUMB, UP_FINGER, UP_FINGER, UP_FINGER, UP_FINGER)

/**
 * Empty gesture that's not supposed to match anything. Shouldn't use 
 * this to check as an gesture.
 */
export const NONE = new Gesture("NONE")

/**
 * Empty gesture that signify an out of bound hand. Shouldn't use 
 * this to check as an gesture.
 */
export const NOT_SEEN = new Gesture("NOT SEEN")

/**
 * Gestures specific to 3D viewer
 */

export const ROTATE_X = new Gesture("ROTATE X", CLOSED_THUMB, ROTATE_X_INDEX_FINGER)
export const THUMBS_UP = new Gesture("THUMBS UP", THUMBS_UP_THUMB, THUMBS_UP_CLOSED_FINGER, THUMBS_UP_CLOSED_FINGER, THUMBS_UP_CLOSED_FINGER, THUMBS_UP_CLOSED_FINGER)
export const L_SHAPE = new Gesture("L SHAPE", OUTWARD_THUMB, UP_FINGER, GENERAL_CLOSED_FINGER, GENERAL_CLOSED_FINGER, GENERAL_CLOSED_FINGER)
export const GRAB_FIST = new Gesture("GRAB FIST", CLOSED_THUMB, GRAB_CLOSED_FINGER, GRAB_CLOSED_FINGER, GRAB_CLOSED_FINGER, GRAB_CLOSED_FINGER)