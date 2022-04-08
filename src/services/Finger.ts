import { DIRECTION } from "./handsInfo"
import { Vector3 } from "babylonjs"
import { LandmarkList } from "@mediapipe/hands"

/**
 * The angles to determine the direction the
 * finger is pointing towards.
 */
const NEAR_RIGHT_AXIS_BOUND = Math.PI / 3
const NEAR_LEFT_AXIS_BOUND = Math.PI * 2 /3
const NEAR_UP_RIGHT_AXIS_BOUND = Math.PI / 6
const NEAR_UP_LEFT_AXIS_BOUND = Math.PI * 5 / 6

/*
	* The amount of variation we are giving 
	* the PIP and DIP when considering whether they are on 
	* the line. For example, if PIP is equal or less off the 
	* perfect vector between MCP and TIP, we will still consider
	* it to be on the line (like a margin of error).
	* Smaller => more accurate.
	**/
const STRAIGHTNESS_VARIATION = 0.014

/*
	* The straightness variation but for thumb specifically.
	See STRAIGHTNESS_VARIATION for more details.
	**/
const THUMB_STRAIGHTNESS_VARIATION = 0.017

/**
 * The indices for finger joints within their LandmarkList.
 */
export const FINGER_INDICES = {
	MCP: 0,
	PIP: 1,
	DIP: 2,
	TIP: 3,
	THUMP_CMC: 0,
	THUMB_MCP: 1
}


/**
 * Determines whether point fits on the line. 
 * If point is within range of variation (inclusive),
 * this counts as being on the line.
 * @param point the point we are checking.
 * @param start the starting point of the line equation.
 * @param vector the vector part of the line equation.
 * @param variation the margin of error we allow point to be 
 * off the line.
 * @returns whether the point fits on the line.
 */
export function fitOnLine(point: Vector3, start: Vector3, vector: Vector3, variation: number): boolean {
	// find the vector from startingPoint to point
	let source = point.subtract(start)

	// we now find the project of source onto vector
	// formula is projection = (source . unit vector) * unit vector
	let unitVector = vector.normalizeToNew()
	// scale is used to multiply vector with scalar
	let projection = unitVector.scale(Vector3.Dot(source, unitVector)) 

	// we have the projection => use it to find the perpendicular component
	let perpendicular = source.subtract(projection)

	// find the magnitude/length of the perpendicular vector
	// and check that it's within the variation
	return perpendicular.length() <= variation
}


export class Finger {
	/**
	 * The joints in the finger as detected by MediaPipe.
	 */
	joints: LandmarkList

	/**
	 * Whether the finger is straight/fully extended.
	 */
	isStraight: boolean

	/**
	 * Represent the closest alloweed vector that the finger is pointing to.
	 * The allowed vectors are the ones in DIRECTION or combination
	 * of them. So DIRECTION.UP is allowed, so is DIRECTION.UP + DIRECTION.RIGHT.
	 */
	direction: Vector3

	constructor(joints: LandmarkList) {
		this.isStraight = false
		this.direction = Vector3.Zero() 
		this.setJoints(joints)
	}

	/**
	 * Set the joints to the new ones.
	 * @param joints 
	 */
	setJoints(joints: LandmarkList) {
		this.joints = joints
	}

	/**
	 * Analyze the straightness of the finger and the direction it's pointing at.
	 * The function does take in minor variation when evaluating straightness.
	 * @param MCPIndex the index we are using to find the base/mcp of a finger.
	 */
	analyzeFinger(MCPIndex: number=FINGER_INDICES.MCP, variation: number=STRAIGHTNESS_VARIATION) {
		let tip = new Vector3(this.joints[FINGER_INDICES.TIP].x, this.joints[FINGER_INDICES.TIP].y, this.joints[FINGER_INDICES.TIP].z) 
		let mcp = new Vector3(this.joints[MCPIndex].x, this.joints[MCPIndex].y, this.joints[MCPIndex].z) 

		// get the vector between the two
		let line = tip.subtract(mcp)

		this.findStraightness(line, tip, variation)
		this.findFingerDirection(line)
	}

	/**
	 * Find whether the finger is straight.
	 * @param line the vector we are checking whether the line is on it.
	 * @param tip the TCP point as a Vector3.
	 */
	findStraightness(line: Vector3, tip: Vector3, variation: number) {
		// finding whether finger is straight strategy:
		// find the vector between the MCP and TIP.
		// determine whether PIP and DIP fit on this line
		// if both do => they fit.
		// due to minor variation in hand size,
		// searching using the exact values on the eqn
		// wouldn't be a good idea => add a radius around the search area.
		// to do so, we determine how close a point is to the vector
		// above. If it's within the VARIATION allowed passed in, we consider
		// it to be "on the line".

		let pip = new Vector3(this.joints[FINGER_INDICES.PIP].x, this.joints[FINGER_INDICES.PIP].y, this.joints[FINGER_INDICES.PIP].z) 
		let pipOnLine = fitOnLine(pip, tip, line, variation)
		let dip = new Vector3(this.joints[FINGER_INDICES.DIP].x, this.joints[FINGER_INDICES.DIP].y, this.joints[FINGER_INDICES.DIP].z) 
		let dipOnLine = fitOnLine(dip, tip, line, variation)
		this.isStraight = pipOnLine && dipOnLine
	}

	/**
	 * Find the direction of the finger
	 * @param line the line that we are finding the direction
	 * of.
	 */
	findFingerDirection(line: Vector3) {
		// finding direction of the finger.
		this.direction = Vector3.Zero()
		// check the vector with each main axis vector to 
		// determine the closest direction it points to.
		// to do this, first check x and y axis without z
		// then finally, check z.

		let angleRad = Vector3.GetAngleBetweenVectors(
			new Vector3(line.x ,line.y, 0), Vector3.Right(), DIRECTION.TOWARD_SCREEN())

		let absAngleRad = Math.abs(angleRad)

		// check whether the angle is < 60 degrees to the right x-axis
		// this means the direction has at least (1, 0, 0) no matter what
		if (absAngleRad < NEAR_RIGHT_AXIS_BOUND) {
			this.direction.addInPlace(Vector3.Right())	
		}
		// if angle is > 120, we know it's nearer to the left hand side
		else if (absAngleRad > NEAR_LEFT_AXIS_BOUND) {
			this.direction.addInPlace(Vector3.Left())	
		}

		// check how close the vector is to the y-axis for both up and downs
		if (NEAR_UP_RIGHT_AXIS_BOUND < angleRad && angleRad < NEAR_UP_LEFT_AXIS_BOUND) {
			this.direction.addInPlace(Vector3.Up())
		}
		else if (-NEAR_UP_LEFT_AXIS_BOUND < angleRad && angleRad < -NEAR_UP_RIGHT_AXIS_BOUND) {
			this.direction.addInPlace(Vector3.Down())
		}

	}
}

export class Thumb extends Finger {
	/**
	 * Analyze the straightness of the finger and the direction it's pointing at.
	 * The function does take in minor variation when evaluating straightness.
	 * @param joints the 4 joints that make up the finger.
	 * MUST be in the order of MCP, PIP, DIP and TIP.
	 */
	analyzeFinger() {
		super.analyzeFinger(FINGER_INDICES.THUMB_MCP, THUMB_STRAIGHTNESS_VARIATION)
	}
}