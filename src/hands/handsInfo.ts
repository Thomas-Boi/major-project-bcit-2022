import { Vector3 } from "babylonjs"

/**
 * The indices that correspond to the enum names within
 * a LandmarkList.
 */
const LANDMARK_INDEX = {
	WRIST: 0,
	THUMB_CMC: 1,
	THUMB_MCP: 2,
	THUMB_IP: 3,
	THUMB_TIP: 4,
	INDEX_FINGER_MCP: 5,
	INDEX_FINGER_PIP: 6,
	INDEX_FINGER_DIP: 7,
	INDEX_FINGER_TIP: 8,
	MIDDLE_FINGER_MCP: 9,
	MIDDLE_FINGER_PIP: 10,
	MIDDLE_FINGER_DIP: 11,
	MIDDLE_FINGER_TIP: 12,
	RING_FINGER_MCP: 13,
	RING_FINGER_PIP: 14,
	RING_FINGER_DIP: 15,
	RING_FINGER_TIP: 16,
	PINKY_MCP: 17,
	PINKY_PIP: 18,
	PINKY_DIP: 19,
	PINKY_TIP: 20
}

/**
 * Amount of Landmarks in a hand
 */
const LANDMARK_AMOUNT = 21

const DIRECTION = {
	// positive z value of the finger in MediaPipe goes away from the screen
	// their doc said the smaller the value, the closer the z-value is to the screen.
	AWAY_FROM_SCREEN: Vector3.Backward, 
	TOWARD_SCREEN: Vector3.Forward
}

export {
	LANDMARK_INDEX,
	DIRECTION,
	LANDMARK_AMOUNT
}