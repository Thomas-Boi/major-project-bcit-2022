import React from "react"
import "./index.css"

/**
 * Report the status to the user.
 * */ 
export default function StatusBar(props: {detected: boolean, gestureName: string}) {
	return (
		<div id="statuses">
			<span id="detectedSign" style={{backgroundColor: props.detected ? "#02fd49" : "#ff0007"}}></span>
			<span id="gestureName">{props.gestureName}</span>
		</div>
	)

}