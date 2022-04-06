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
}

/**
 * Report the status to the user.
 * */ 
export default function StatusBar(props: IProps) {
	// if out of bound or there's nothing, say it as not detected
	let gesture = props.gesture
	let detected = !(gesture === NONE || gesture === NOT_SEEN)

	// detected color == green, else red
	return (
		<div className={style.statuses}>
			<span className={style.detectedSign} style={{backgroundColor: detected ? "#02fd49" : "#ff0007"}}></span>
			<span className={style.gestureName}>{props.name ? props.name : gesture.name}</span>
		</div>
	)

}