import styles from "./index.module.css"
import React from "react";
import { SceneProps } from "react-app-env";
import Hand from "services/Hand"
import {Gesture, ONE, TWO, THREE, NONE } from "services/Gesture"
import StatusBar from "components/StatusBar";
import one from "assets/img/one.png"
import two from "assets/img/two.png"
// import three from "assets/img/three.png"
import {Scenes} from "services/util"

const GESTURE_TRIGGER_TIME_MILISEC = 1000
const updateKeyName = "menuUpdate"

interface IState {
	/**
	 * The name of the gesture to display on the screen.
	 */
	gesture: Gesture

	/**
	 * The progress for the progress bar in the StatusBar component.
	 */
	progress: undefined | number
}

/**
 * Convert the valid gesture name to a command name.
 */
const gestureCommandObj = {
	[ONE.name]: "3D VIEWER",
	[TWO.name]: "SLIDESHOW",
}

export default class MenuScene extends React.Component<SceneProps, IState> {
	/**
	 * Whether the scene is unmounted
	 */
	isUnmounted: boolean

	constructor(props: SceneProps) {
		super(props)

		this.state = {
			gesture: NONE,
			progress: undefined
		}

		// set up the control to move to the other scenes
		this.props.gestureDetector.addObserver(this.update, updateKeyName)
		this.props.gestureDetector.removeAllGesturesToDetect()
		this.props.gestureDetector.addGesturesToDetect([ONE, TWO])
		this.isUnmounted = false
	}

	render() {
		return (
			<div className={styles.scene}>
				<StatusBar gesture={this.state.gesture} name={gestureCommandObj[this.state.gesture.name]} progress={this.state.progress}/>
				<span className={styles.rightHandTxt}>*RIGHT HAND ONLY</span>
				<img className={styles.img} src={one} alt='One: select 3D Viewer'/>
				<img className={styles.img} src={two} alt='Two: holographic slideshow'/>
				{/* <img className={styles.img} src={three} alt='Three: holographic slideshow'/> */}
				<div className={styles.text}>3D Viewer</div>
				<div className={styles.text}>Slideshow</div>
			</div>
		)
	}

	/**
	 * Remove the listeners.
	 */
	componentWillUnmount() {
		this.isUnmounted = true
		this.props.gestureDetector.removeObserver(updateKeyName)
	}
		
	update = (hand: Hand | null, prevHand: Hand | null, curGesture: Gesture, gestureStartTime: number) => {
		// has to set state before the callback are called
		this.setState({gesture: curGesture})

		if (!(hand && prevHand)) {
			// do nothing, just end the if chain early
			// for prevHand
			// if there's a none flash in between
			// two valid gestures, the 2nd valid gesture will have
			// a null prevHand => this checks avoid it
			return
		}

		if (curGesture === ONE) {
			let progress = (Date.now() - gestureStartTime) / GESTURE_TRIGGER_TIME_MILISEC
			this.setState({progress})
			if (Date.now() - gestureStartTime >= GESTURE_TRIGGER_TIME_MILISEC) {
				this.props.loadSceneCallback(Scenes.VIEWER_3D)
			}
		}
		else if (curGesture === TWO) {
			let progress = (Date.now() - gestureStartTime) / GESTURE_TRIGGER_TIME_MILISEC
			this.setState({progress})
			if (Date.now() - gestureStartTime >= GESTURE_TRIGGER_TIME_MILISEC) {
				this.props.loadSceneCallback(Scenes.HOLOGRAPHIC)
			}
		}
		// else if (curGesture === THREE) {
		// 	if (Date.now() - gestureStartTime >= GESTURE_TRIGGER_TIME_MILISEC) {
		// 		scene = Scenes.EATHER
		// 	}
		// }
	}

}