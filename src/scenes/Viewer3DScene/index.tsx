import React from "react"
import Hand from "services/Hand"
import { FINGER_INDICES } from "services/Finger"
import * as Gesture from "services/Gesture"
import StatusBar from "components/StatusBar"
import Viewer3DInstruction from "components/Viewer3DInstruction"
import { getDelta } from "services/util"
import "./index.css"
import { SceneProps } from "react-app-env"
import "babylonjs-loaders"

interface IState {
	/**
	 * Whether to remove the instruction scene.
	 */
	showsInstruction: boolean

	/**
	 * The name of the gesture to display on the screen.
	 */
	gesture: Gesture.Gesture

	/**
	 * The progress for the progress bar in the StatusBar component.
	 */
	progress: undefined | number
}

// for interacting with the cube
const TRANSLATE_MULTIPLIER = 6
const ROTATE_MULTIPLIER = 6
const SCALE_MULTIPLIER = 4

// tracks how long the user needs to hold their
// hand to activate something
const RESET_COUNTER_THRESHOLD_MILISEC = 1000
const START_THRESHOLD_MILISEC = 1000

// for registering the callbacks to the GestureDetector
const removeKeyName = "3Dremove"
const updateKeyName = "3Dupdate"

/**
 * Convert the valid gesture name to a command name.
 */
const gestureCommandObj = {
	[Gesture.GRAB_FIST.name]: "TRANSLATE",
	[Gesture.ONE.name]: "ROTATE Y",
	[Gesture.ONE_HORIZONTAL.name]: "ROTATE X",
	[Gesture.THUMBS_UP.name]: "SCALE",
	[Gesture.L_SHAPE.name]: "RESET",
	[Gesture.FIVE.name]: "NEUTRAL",
	[Gesture.GRAB_THUMBS_OUT.name]: "BACK",
}

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
			gesture: Gesture.NONE,
			progress: undefined
		}

		/**
		 * First step: add a check for removing the instruction.
		 */
		this.props.gestureDetector.removeAllGesturesToDetect()
		this.props.gestureDetector.addObserver(this.removeInstruction, removeKeyName)
		this.props.gestureDetector.addGesturesToDetect([Gesture.ONE, Gesture.FIVE])
	}

	render() {
		return (
			<div>
				{
					this.state.showsInstruction && 
						<Viewer3DInstruction />
				}

				<StatusBar gesture={this.state.gesture} name={gestureCommandObj[this.state.gesture.name]} progress={this.state.progress}/>
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
		
		let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
		light.diffuse = new BABYLON.Color3(1, 1, 1);
		light.specular = new BABYLON.Color3(0, 0, 0);
		light.intensity = 3


		BABYLON.SceneLoader.ImportMeshAsync("", process.env.PUBLIC_URL + "/", "Earth.glb", scene)
			.then(result => {
				this.mesh = result.meshes[0] as BABYLON.Mesh
			})
			.then(() => {
				  // only start rendering when the mesh is ready
					// attach the render callback
					this.engine.runRenderLoop(() => scene.render())

					// handle resizing
					window.addEventListener("resize", this.resize)

			})
		
		// this.mesh = BABYLON.MeshBuilder.CreateBox("box", {
		// 	faceColors: [
		// 		new BABYLON.Color4(1, 0, 0, 0), new BABYLON.Color4(1, 0, 0, 0), new BABYLON.Color4(1, 0, 0, 0),
		// 		new BABYLON.Color4(0, 1, 0, 0), new BABYLON.Color4(0, 1, 0, 0), new BABYLON.Color4(0, 1, 0, 0)
		// 	],
		// 	size: 0.5
		// }, scene)

		// attach the render callback
		// this.engine.runRenderLoop(() => scene.render())

		// handle resizing
		// window.addEventListener("resize", this.resize)
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

		this.props.gestureDetector.removeObserver(updateKeyName)
	}

	removeInstruction = (hand: Hand | null, prevHand: Hand | null, curGesture: Gesture.Gesture, gestureStartTime: number) => {
		if (curGesture === Gesture.FIVE) {
			let progress = (Date.now() - gestureStartTime) / START_THRESHOLD_MILISEC
			if (Date.now() - gestureStartTime >= START_THRESHOLD_MILISEC) {
				this.props.gestureDetector.removeObserver(removeKeyName)
				this.props.gestureDetector.addObserver(this.update, updateKeyName)
				// update the gestures to look for
				this.props.gestureDetector.removeAllGesturesToDetect()
				this.props.gestureDetector.addGesturesToDetect([
					Gesture.FIVE,
					Gesture.GRAB_FIST,
					Gesture.ONE,
					Gesture.ONE_HORIZONTAL,
					Gesture.THUMBS_UP,
					Gesture.L_SHAPE,
					Gesture.GRAB_THUMBS_OUT
				])

				this.setState({showsInstruction: false})
			}
			this.setState({progress})
		}
		this.setState({gesture: curGesture})
	}

	/**
	 * Handle the onResults event of the Hands tracker.
	 * @param results the result of the data parsing.
	 */
	update = (hand: Hand | null, prevHand: Hand | null, curGesture: Gesture.Gesture, gestureStartTime: number) => {
		let progress = 1
		if (!(hand && prevHand)) {
			// do nothing, just end the if checks early
			// for prevHand
			// if there's a none flash in between
			// two valid gestures, the 2nd valid gesture will have
			// a null prevHand => this checks avoid it
		}
		else if (curGesture === Gesture.GRAB_FIST) {
			this.translate(hand, prevHand)
		}
		else if (curGesture === Gesture.ONE) {
			this.rotateAroundY(hand, prevHand)
		}
		else if (curGesture === Gesture.ONE_HORIZONTAL) {
			this.rotateAroundX(hand, prevHand)
		}
		else if (curGesture === Gesture.THUMBS_UP) {
			this.scale(hand, prevHand)
		}
		else if (curGesture === Gesture.L_SHAPE) {
			progress = (Date.now() - gestureStartTime) / RESET_COUNTER_THRESHOLD_MILISEC
			if (Date.now() - gestureStartTime >= RESET_COUNTER_THRESHOLD_MILISEC) {
				this.reset()
			}
		}

		this.setState({gesture: curGesture, progress})
	}

	/**
	 * Translate the object on screen based on the hand and prevHand.
	 * @param hand the hand of this current frame.
	 * @param prevHand the hand of the previous frame.
	 */
	translate(hand: Hand, prevHand: Hand) {
		let horizontalDelta = getDelta(hand.middle.joints[FINGER_INDICES.PIP].x, prevHand.middle.joints[FINGER_INDICES.PIP].x)
		// has to flip horizontal footage since camera flips the view
		horizontalDelta *= -1

		// has to flip vertical footage since image y-axis run top to bottom (increase downward like js)
		let verticalDelta = -getDelta(hand.wrist.y, prevHand.wrist.y)

		if (Math.abs(horizontalDelta) > 0.005) {
			this.mesh.translate(BABYLON.Axis.X, TRANSLATE_MULTIPLIER * horizontalDelta, BABYLON.Space.WORLD)
		}

		if (Math.abs(verticalDelta) > 0.005) {
			this.mesh.translate(BABYLON.Axis.Y, TRANSLATE_MULTIPLIER * verticalDelta, BABYLON.Space.WORLD)
		}
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
		// if (!this.props.isScreenFacingUser) horizontalDelta *= -1

		this.mesh.rotate(BABYLON.Axis.Y, ROTATE_MULTIPLIER * horizontalDelta, BABYLON.Space.WORLD)
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
		// don't need to check for isScreenFacingUser since we aren't moving on the canvas, just scaling
		let horizontalDelta = -getDelta(hand.middle.joints[FINGER_INDICES.PIP].x, prevHand.middle.joints[FINGER_INDICES.PIP].x)

		// prevent jitters
		if (Math.abs(horizontalDelta) > 0.004) {
			let scale = horizontalDelta * SCALE_MULTIPLIER
			// for some reason, z-axis scaling starts at -1 => to increase it, we subtract
			this.mesh.scaling.addInPlaceFromFloats(scale, scale, -scale)
		}
	}

	/**
	 * Reset the cube's position, rotation, and scale to its original.
	 */
	reset() {
		this.mesh.scaling = new BABYLON.Vector3(1, 1, -1) // z axis has to be negative
		this.mesh.position = new BABYLON.Vector3(0, 0, 0)
		this.mesh.rotation = new BABYLON.Vector3(0, 0, 0)
	}

}
