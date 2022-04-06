import styles from "./index.module.css"
import React from "react";
import { SceneProps } from "react-app-env";
import Hand from "services/Hand"
import {Gesture, ONE, TWO, NONE, ROTATE_X} from "services/Gesture"
import StatusBar from "components/StatusBar";
import one from "assets/img/one.png"
import two from "assets/img/two.png"

const GESTURE_TRIGGER_TIME_MILISEC = 700
const updateKeyName = "menuUpdate"

interface IState {
	/**
	 * The name of the gesture to display on the screen.
	 */
	gesture: Gesture
}

export default class MenuScene extends React.Component<SceneProps, IState> {
	/**
	 * Whether the scene is unmounted
	 */
	isUnmounted: boolean

	constructor(props: SceneProps) {
		super(props)

		this.state = {
			gesture: NONE
		}

		// set up the control to move to the other scenes
		this.props.gestureDetector.addObserver(this.update, updateKeyName)
		this.props.gestureDetector.removeAllGesturesToDetect()
		this.props.gestureDetector.addGesturesToDetect([ONE, TWO, ROTATE_X])
		this.isUnmounted = false
	}

	render() {
		return (
			<div className={styles.scene}>
				<StatusBar gesture={this.state.gesture}/>
				<img className={styles.img} src={one} alt='One: select 3D Viewer'/>
				<img className={styles.img} src={two} alt='Two: eather app'/>
				<div className={styles.text}>3D Viewer</div>
				<div className={styles.text}>Eather</div>
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
		this.setState({gesture: curGesture})
		if (!(hand && prevHand)) {
			// do nothing, just end the if chain early
			// for prevHand
			// if there's a none flash in between
			// two valid gestures, the 2nd valid gesture will have
			// a null prevHand => this checks avoid it
		}
		else if (curGesture === ONE) {
			if (Date.now() - gestureStartTime >= GESTURE_TRIGGER_TIME_MILISEC) {
				this.props.loadSceneCallback("3D")
			}
		}
		else if (curGesture === TWO) {
			if (Date.now() - gestureStartTime >= GESTURE_TRIGGER_TIME_MILISEC) {
				this.props.loadSceneCallback("EATHER")
			}
		}
	}

}