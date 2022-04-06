import React from "react"
import style from "./index.module.css"
import {Gesture, NONE, NOT_SEEN} from "services/Gesture"

interface IProps {
	/**
	 * The gesture the user is making.
	 */
	gesture: Gesture

	/**
	 * The custom name the status bar will display. 
	 * If leave blank or passed null/undefined in, will use the gesture's name.
	 */
	name?: string | null | undefined

	/**
	 * An optional progress bar using the colored span. 
	 * Pass in a number in range [0, 1] to represent the completion
	 * of a task. Any number bigger than that will be clamped to the 
	 * bound.
	 */
	progress?: number
}

/**
 * Report the status to the user.
 * */ 
export default function StatusBar(props: IProps) {
	// if out of bound or there's nothing, say it as not detected
	let gesture = props.gesture
	let detected = !(gesture === NONE || gesture === NOT_SEEN)

	let colorStatusStyle = {
		backgroundColor: detected ? "#02fd49" : "#ff0007",
		transform: ""
	}

	// check for progress
	if (props.progress !== undefined) {
		let progress = props.progress
		if (progress < 0) progress = 0
		if (progress > 1) progress = 1
		colorStatusStyle["transform"] = `scaleX(${progress})`
	}

	// detected color == green, else red
	return (
		<div className={style.statuses}>
			<span className={style.colorStatus}>
				<span className={style.detectedSign} style={colorStatusStyle}></span>
			</span>
			<span className={style.gestureName}>{props.name ? props.name : gesture.name}</span>
		</div>
	)

}