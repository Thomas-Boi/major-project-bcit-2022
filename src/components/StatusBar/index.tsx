import React from "react"
import style from "./index.module.css"
import {Gesture, NONE, NOT_SEEN} from "services/Gesture"

/**
 * Report the status to the user.
 * */ 
export default function StatusBar(props: {gesture: Gesture}) {
	// if out of bound or there's nothing, say it as not detected
	let gesture = props.gesture
	let detected = !(gesture === NONE || gesture === NOT_SEEN)

	// detected color == green, else red
	return (
		<div className={style.statuses}>
			<span className={style.detectedSign} style={{backgroundColor: detected ? "#02fd49" : "#ff0007"}}></span>
			<span className={style.gestureName}>{gesture.name}</span>
		</div>
	)

}