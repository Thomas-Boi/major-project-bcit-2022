import { Vector3 } from "babylonjs"

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
	)
}

/**
 * The state of a closed non-thumb finger for a grabbing motion.
 */
const GRAB_CLOSED_PINKY: FingerState = {
	isStraight: false,
	direction: new ValidDirections(
		Vector3.Down(),
		Vector3.Down().add(Vector3.Right()),
	)
}

/**
 * The state of a closed non-thumb finger for a thumbs up gesture.
 */
const THUMBS_UP_CLOSED_FINGER: FingerState = {
	isStraight: false,
	direction: new ValidDirections(
		Vector3.Right(),
		Vector3.Right().add(Vector3.Down())
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
 * The shape of the index finger for the ONE_HORIZONTAL shape.
 */
const ONE_HORIZONTAL_INDEX_FINGER: FingerState = {
	isStraight: true,
	direction: new ValidDirections(
		Vector3.Right()
	)
}

/**
 * The state of a closed non-thumb finger for the ONE_HORIZONTAL gesture.
 */
const ONE_HORIZONTAL_CLOSED_FINGER: FingerState = {
	isStraight: false,
	direction: new ValidDirections(
		Vector3.Down(),
		Vector3.Left(),
		Vector3.Left().add(Vector3.Down())
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
		Vector3.Up()
	)
}

/**
 * The state of a closed thumb. Opposite of an outward thumb.
 */
const CLOSED_THUMB: FingerState = {
	isStraight: null,
	direction: new InvalidDirections(
		Vector3.Right(),
		Vector3.Right().add(Vector3.Up())
	)
}

/**
 * The thumb shape for the ONE_HORIZONTAL shape.
 */
const ONE_HORIZONTAL_THUMB: FingerState = {
	isStraight: null,
	direction: new ValidDirections(
		Vector3.Right(),
		Vector3.Right().add(Vector3.Up()),
		Vector3.Right().add(Vector3.Down()),
		Vector3.Up()
	)
}

/**
 * The thumb for a thumbs up.
 */
const THUMBS_UP_THUMB: FingerState = {
	isStraight: true,
	direction: new ValidDirections(
		Vector3.Up()
	)
}



///////////////////////////// GESTURES //////////////////////////////

/**
 * Some preset common gestures.
 */
export const CLOSED_FIST = new Gesture("CLOSED FIST")
export const ONE = new Gesture("ONE", CLOSED_THUMB, UP_FINGER)
export const TWO = new Gesture("TWO", CLOSED_THUMB, UP_FINGER, UP_FINGER)
export const THREE = new Gesture("THREE", CLOSED_THUMB, UP_FINGER, UP_FINGER, UP_FINGER)
export const FOUR = new Gesture("FOUR", CLOSED_THUMB, UP_FINGER, UP_FINGER, UP_FINGER, UP_FINGER)
export const FIVE = new Gesture("FIVE", OUTWARD_THUMB, UP_FINGER, UP_FINGER, UP_FINGER, UP_FINGER)

/**
 * Empty gesture that's not supposed to match anything. Shouldn't use 
 * this to check as an gesture.
 */
export const INVALID = new Gesture("INVALID")

/**
 * Empty gesture that signify an out of bound hand. Shouldn't use 
 * this to check as an gesture.
 */
export const NONE = new Gesture("NONE")

/**
 * Gestures specific to 3D viewer
 */
export const ONE_HORIZONTAL = new Gesture("ONE HORIZONTAL", ONE_HORIZONTAL_THUMB, ONE_HORIZONTAL_INDEX_FINGER, ONE_HORIZONTAL_CLOSED_FINGER, ONE_HORIZONTAL_CLOSED_FINGER, ONE_HORIZONTAL_CLOSED_FINGER)
export const THUMBS_UP = new Gesture("THUMBS UP", THUMBS_UP_THUMB, THUMBS_UP_CLOSED_FINGER, THUMBS_UP_CLOSED_FINGER, THUMBS_UP_CLOSED_FINGER, THUMBS_UP_CLOSED_FINGER)
export const L_SHAPE = new Gesture("L SHAPE", OUTWARD_THUMB, UP_FINGER, GRAB_CLOSED_FINGER, GRAB_CLOSED_FINGER, GRAB_CLOSED_FINGER)
export const GRAB_FIST = new Gesture("GRAB FIST", CLOSED_THUMB, GRAB_CLOSED_FINGER, GRAB_CLOSED_FINGER, GRAB_CLOSED_FINGER, GRAB_CLOSED_PINKY)