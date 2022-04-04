import React from "react"
import Hand from "services/Hand"
import { FINGER_INDICES } from "services/Finger"
import * as Gesture from "services/Gesture"
import StatusBar from "components/StatusBar"
import Viewer3DInstruction from "components/Viewer3DInstruction"
import { getDelta } from "services/util"
import "./index.css"
import { SceneProps } from "react-app-env"

interface IState {
	/**
	 * Whether to remove the instruction scene.
	 */
	showsInstruction: boolean

	/**
	 * The name of the gesture to display on the screen.
	 */
	gestureName: string

	/**
	 * Whether the gesture was detectable.
	 */
	detected: boolean
}

// for interacting with the cube
const TRANSLATE_MULTIPLIER = 6
const ROTATE_MULTIPLIER = 6
const SCALE_MULTIPLIER = 4

// tracks how long the user needs to hold their
// hand to activate something
const RESET_COUNTER_THRESHOLD_MILISEC = 1000
const START_THRESHOLD_MILISEC = 600

export default class Viewer3DScene extends React.Component<SceneProps, IState> {
	/**
	 * A BABYLON Mesh object.
	 */
	mesh: BABYLON.Mesh

	/**
	 * The BABYLON engine.
	 */
	engine: BABYLON.Engine

	constructor(props: SceneProps) {
		super(props)
		this.state = {
			showsInstruction: true,
			gestureName: "NONE",
			detected: false
		}

		/**
		 * First step: add a check for removing the instruction.
		 */
		this.props.gestureDetector.addObserver(this.removeInstruction)
		this.props.gestureDetector.addGesturesToDetect([Gesture.FIVE])
	}

	render() {
		return (
			<div>
				{
					this.state.showsInstruction && 
						<Viewer3DInstruction />
				}
				<StatusBar gestureName={this.state.gestureName} detected={this.state.detected}/>
				<canvas id='canvas'></canvas>
			</div>
		)
	}

	/**
	 * Init the BabylonJS canvas.
	 */
	componentDidMount() {
		const canvas = document.getElementById("canvas") as HTMLCanvasElement
		this.engine = new BABYLON.Engine(canvas, true)

		const scene = new BABYLON.Scene(this.engine)
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
		this.engine.runRenderLoop(() => scene.render())

		// handle resizing
		window.addEventListener("resize", this.resize)
	}

	/**
	 * Resize the canvas after screen is resized.
	 */
	resize = () => {
		this.engine.resize()
	}

	/**
	 * Shut down the BabylonJS engine.
	 */
	componentWillUnmount(): void {
		// babylon js stuff
		window.removeEventListener("resize", this.resize)
		this.engine.dispose()

		this.props.gestureDetector.removeObserver(this.update)
	}

	removeInstruction = (hand: Hand | null, prevHand: Hand | null, curGesture: Gesture.Gesture, gestureStartTime: number) => {
		if (curGesture === Gesture.FIVE) {
			if (Date.now() - gestureStartTime >= START_THRESHOLD_MILISEC) {
				this.props.gestureDetector.removeObserver(this.removeInstruction)
				this.props.gestureDetector.addObserver(this.update)
				// update the gestures to look for
				this.props.gestureDetector.removeAllGesturesToDetect()
				this.props.gestureDetector.addGesturesToDetect([
					Gesture.FIVE,
					Gesture.GRAB_FIST,
					Gesture.ONE,
					Gesture.ROTATE_X,
					Gesture.THUMBS_UP,
					Gesture.L_SHAPE
				])

				this.setState({showsInstruction: false})
			}
			this.setState({detected: true, gestureName: curGesture.name})
			return
		}
		this.setState({detected: false, gestureName: "NONE"})
	}

	/**
	 * Handle the onResults event of the Hands tracker.
	 * @param results the result of the data parsing.
	 */
	update = (hand: Hand | null, prevHand: Hand | null, curGesture: Gesture.Gesture | null, gestureStartTime: number) => {
		if (!(hand && prevHand) || !curGesture) {
			// for prevHand
			// if there's a none flash in between
			// two valid gestures, the 2nd valid gesture will have
			// a null prevHand => this checks avoid it
			this.setState({detected: false, gestureName: "NONE"})
			return
		}
		else if (curGesture === Gesture.GRAB_FIST) {
			this.translate(hand, prevHand)
		}
		else if (curGesture === Gesture.ONE) {
			this.rotateAroundY(hand, prevHand)
		}
		else if (curGesture === Gesture.ROTATE_X) {
			this.rotateAroundX(hand, prevHand)
		}
		else if (curGesture === Gesture.THUMBS_UP) {
			this.scale(hand, prevHand)
		}
		else if (curGesture === Gesture.L_SHAPE) {
			if (Date.now() - gestureStartTime >= RESET_COUNTER_THRESHOLD_MILISEC) {
				this.reset()
			}

		}

		// this is for valid detections
		this.setState({detected: true, gestureName: curGesture.name})
	}

	/**
	 * Translate the object on screen based on the hand and prevHand.
	 * @param hand the hand of this current frame.
	 * @param prevHand the hand of the previous frame.
	 */
	translate(hand: Hand, prevHand: Hand) {
		let horizontalDelta = getDelta(hand.middle.joints[FINGER_INDICES.PIP].x, prevHand.middle.joints[FINGER_INDICES.PIP].x)
		// has to flip horizontal footage since camera flips the view
		if (this.props.isScreenFacingUser) horizontalDelta *= -1

		// has to flip vertical footage since image y-axis run top to bottom (increase downward like js)
		let verticalDelta = -getDelta(hand.wrist.y, prevHand.wrist.y)

		this.mesh.translate(BABYLON.Axis.X, TRANSLATE_MULTIPLIER * horizontalDelta, BABYLON.Space.WORLD)
		this.mesh.translate(BABYLON.Axis.Y, TRANSLATE_MULTIPLIER * verticalDelta, BABYLON.Space.WORLD)
	}

	/**
	 * Rotate the object around the y axis on screen based on the hand and prevHand.
	 * @param hand the hand of this current frame.
	 * @param prevHand the hand of the previous frame.
	 */
	rotateAroundY(hand: Hand, prevHand: Hand) {
		// don't need to flip the horizontal for this. The rotation matches
		// with the flipped image
		let horizontalDelta = getDelta(hand.index.joints[FINGER_INDICES.TIP].x, prevHand.index.joints[FINGER_INDICES.TIP].x)
		if (!this.props.isScreenFacingUser) horizontalDelta *= -1

		this.mesh.rotate(BABYLON.Axis.Y, ROTATE_MULTIPLIER * horizontalDelta)
	}

	/**
	 * Rotate the object around x-axis on screen based on the hand and prevHand.
	 * @param hand the hand of this current frame.
	 * @param prevHand the hand of the previous frame.
	 */
	rotateAroundX(hand: Hand, prevHand: Hand) {
		// has to fliip the vertical to get the right rotation
		let verticalDelta = -getDelta(hand.index.joints[FINGER_INDICES.TIP].y, prevHand.index.joints[FINGER_INDICES.TIP].y)

		this.mesh.rotate(BABYLON.Axis.X, ROTATE_MULTIPLIER * verticalDelta, BABYLON.Space.WORLD)
	}

	/**
	 * Scale the object on screen based on the hand and prevHand.
	 * @param hand the hand of this current frame.
	 * @param prevHand the hand of the previous frame.
	 */
	scale(hand: Hand, prevHand: Hand) {
		// has to flip the scale because our movement is opposite of the camera
		// don't need to check for isSelfieThough since we aren't moving on the canvas, just scaling
		let horizontalDelta = -getDelta(hand.middle.joints[FINGER_INDICES.PIP].x, prevHand.middle.joints[FINGER_INDICES.PIP].x)

		let scale = horizontalDelta * SCALE_MULTIPLIER
		this.mesh.scaling.addInPlaceFromFloats(scale, scale, scale)
	}

	/**
	 * Reset the cube's position, rotation, and scale to its original.
	 */
	reset() {
		this.mesh.scaling = new BABYLON.Vector3(1, 1, 1)
		this.mesh.position = new BABYLON.Vector3(0, 0, 0)
		this.mesh.rotation = new BABYLON.Vector3(0, 0, 0)
	}

}
