import styles from "./index.module.css"
import React from "react";
import { SceneProps } from "react-app-env";
import Hand from "services/Hand"
import {Gesture, ONE, TWO} from "services/Gesture"
import one from "assets/img/one.png"
import two from "assets/img/two.png"

const GESTURE_TRIGGER_TIME_MILISEC = 2500

export default class MenuScene extends React.Component<SceneProps> {

	constructor(props: SceneProps) {
		super(props)

		// set up the control to move to the other scenes
		this.props.gestureDetector.addObserver(this.update)
		this.props.gestureDetector.removeAllGesturesToDetect()
		this.props.gestureDetector.addGesturesToDetect([ONE, TWO])
	}

	render() {
		return (
			<div className={styles.scene}>
				<img className={styles.img} src={one} alt='One: select 3D Viewer'/>
				<img className={styles.img} src={two} alt='Two: eather app'/>
				<div className={styles.text}>3D Viewer</div>
				<div className={styles.text}>Eather</div>
			</div>
		)
	}
		
	update = (hand: Hand | null, prevHand: Hand | null, curGesture: Gesture, gestureStartTime: number) => {
		if (!(hand && prevHand)) {
			// for prevHand
			// if there's a none flash in between
			// two valid gestures, the 2nd valid gesture will have
			// a null prevHand => this checks avoid it
			return
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