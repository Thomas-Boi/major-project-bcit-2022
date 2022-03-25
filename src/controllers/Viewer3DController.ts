import * as Gesture from "../hands/Gesture"
import { Results } from "@mediapipe/hands"
import HandTracker  from "../hands/HandTracker"
import * as BABYLON from "babylonjs"
import Hand from "../hands/Hand"
import { FINGER_INDICES } from "../hands/Finger"
import { getDelta } from "../util"


// tracks how long the user needs to hold their
// hand to activate something
const RESET_COUNTER_THRESHOLD_MILISEC = 1000
const START_THRESHOLD_MILISEC = 600

// when the track counter pass this threshold,
// we are confident that the user is intentionally making a shape 
// with their hand and not due to noises.
const SHAPE_COUNTER_THRESHOLD = 7

// report the status to the user
const detectedSign = document.getElementById("detectedSign")
const gestureName = document.getElementById("gestureName")

/**
 * Use the HandTracker's data and manipulate the scene using it.
 */
export default class Viewer3DController {
	/**
	 * A BABYLON Mesh object
	 */
	mesh: BABYLON.Mesh

	/**
	 * The counter for tracking the reset gesture. Increment
	 * for every second the user holds the gesture.
	 */
	resetCounter: number

	constructor(facingMode: "user"|"environment") {
		let gesturesToDetect = [
			Gesture.FIVE,
			Gesture.GRAB_FIST,
			Gesture.ONE,
			Gesture.ROTATE_X,
			Gesture.THUMBS_UP,
			Gesture.L_SHAPE
		]
		super(facingMode, gesturesToDetect)
		this.init3DScene()

		// default: everything is flipped
		// if we are testing on laptop, unflip it
		// if (this.isSelfieMode) {
		// 	document.getElementById("loadingScreen").style.transform = "none"
		// 	gestureName.style.transform = "none"
		// }
	}

	init3DScene() {
		const canvas = document.getElementById("canvas") as HTMLCanvasElement
		const engine = new BABYLON.Engine(canvas, true)

		const scene = new BABYLON.Scene(engine)
		scene.clearColor = new BABYLON.Color4(0, 0, 0)
		const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0), scene)
		camera.attachControl(canvas, true)
		
		new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene)
		this.mesh = BABYLON.MeshBuilder.CreateBox("box", {
			faceColors: [
				new BABYLON.Color4(1, 0, 0, 0), new BABYLON.Color4(1, 0, 0, 0), new BABYLON.Color4(1, 0, 0, 0),
				new BABYLON.Color4(0, 1, 0, 0), new BABYLON.Color4(0, 1, 0, 0), new BABYLON.Color4(0, 1, 0, 0)
			],
			size: 0.5
		}, scene)

		// attach the render callback
		engine.runRenderLoop(() => scene.render())

		// handle resizing
		window.addEventListener("resize", () => {
			engine.resize()
		})
	}

	/**
	 * Handle the result for the first frame received by
	 * the HandTracker. This include removing the
	 * loading icon, setting up the hand etc.
	 * @param tracker the HandTracker.
	 * @param key the listener name we subscribed to tracker.
	 * @param results 
	 */
	firstFrameCallback(tracker: HandTracker, key: string, results: Results | null) {
		// show the start message
		document.getElementById("loadingUI").style.display = "none"
		document.getElementById("startMsg").style.display = "flex"
		document.getElementById("statuses").style.display = "inline-flex"

		// check and see the state of the Controller, which is
		// the current hand gesture of the user.
		this.detectShape(results)

		if (this.confirmedGesture === Gesture.FIVE) {
			if (Date.now() - this.gestureStartTime >= START_THRESHOLD_MILISEC) {
				tracker.removeListener(key)
				tracker.addListener(this.update.bind(this))
				document.getElementById("loadingScreen").style.display = "none"
			}
		}
	}

	/**
	 * Handle the onResults event of the Hands tracker.
	 * @param results the result of the data parsing.
	 */
	update(results: Results | null) {
		// check and see the state of the Controller, which is
		// the current hand gesture of the user.
		this.detectShape(results)

		if (!(this.hand && this.prevHand)) {
			// do nothing since we need both to be valid
			// to do calc, just skip the checks

			// for prevHand
			// if there's a none flash in between
			// two valid gestures, the 2nd valid gesture will have
			// a null prevHand => this checks avoid it
		}
		else if (this.confirmedGesture === Gesture.GRAB_FIST) {
			this.translate(this.hand, this.prevHand)
		}
		else if (this.confirmedGesture === Gesture.ONE) {
			this.rotateAroundY(this.hand, this.prevHand)
		}
		else if (this.confirmedGesture === Gesture.ROTATE_X) {
			this.rotateAroundX(this.hand, this.prevHand)
		}
		else if (this.confirmedGesture === Gesture.THUMBS_UP) {
			this.zoom(this.hand, this.prevHand)
		}
		else if (this.confirmedGesture === Gesture.L_SHAPE) {
			if (Date.now() - this.gestureStartTime >= RESET_COUNTER_THRESHOLD_MILISEC) {
				this.reset()
				// change the start time so we don't reset multiple times
				this.gestureStartTime = Date.now()
			}

		}

		this.prevHand = this.hand
	}

	/**
	 * Subscribe to the HandTracker object for the first time.
	 * This function will be call the first time the HandTracker
	 * is initialize. Afterwards, it will switch to the usual
	 * onFrameCallback.
	 * @param tracker a HandTracker object.
	 */
	subscribe(tracker: HandTracker) {
		let key = "firstFrame"
		tracker.addListener(this.firstFrameCallback.bind(this, tracker, key), key)
	}
}