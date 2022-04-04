import React from "react"
import style from "./index.module.css"

/**
 * Report the status to the user.
 * */ 
export default function StatusBar(props: {detected: boolean, gestureName: string}) {
	// detected == green, else red
	return (
		<div className={style.statuses}>
			<span className={style.detectedSign} style={{backgroundColor: props.detected ? "#02fd49" : "#ff0007"}}></span>
			<span className={style.gestureName}>{props.gestureName}</span>
		</div>
	)

}