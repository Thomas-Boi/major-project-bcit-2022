import React from "react"
import {Camera} from "@mediapipe/camera_utils"
import HandTracker from "../../services/HandTracker"
import style from "./index.module.css"

/**
 * Tracks how many steps/update we can do per second.
 * This frame cap improve performance (doesn't update unless needed).
 * Also prevent the camera from taking duplicate images where the
 * user's hand hasn't move => also improve performance so we don't
 * update the app when we don't need to.
 */
const STEPS_PER_SEC = 20

/**
 * Tracks how long in second each step should take.
 */
const UPDATE_STEP_IN_A_SEC = 1000 / STEPS_PER_SEC


interface IProps {
	tracker: HandTracker
}

/**
 * Handle work related to the camera.
 */
export default class InputSource extends React.Component<IProps> {
	/**
	 * The video element that we are storing the stream in.
	 */
	videoRef: React.RefObject<HTMLVideoElement>

	/**
	 * Whether we have processed the frame within this step.
	 */
	processedFrame: boolean

	/**
	 * The camera input we are getting.
	 * "User" means front facing (relavtive to screen) aka selfie mode.
	 * "Environment" means back facing aka normal camera mode.
	 */
	facingMode: "user" | "environment"

	constructor(props: IProps) {
		super(props)
		
		// store these things not in state cause we have no need to re-render here
		this.videoRef = React.createRef<HTMLVideoElement>()
		this.processedFrame = false
		
		// detect whether we are on a mobile phone
		// if we are on a phone, switch to env facing mode
		// if we are on a desktop => front facing 
		this.facingMode = /Mobi/.test(navigator.userAgent) ? "environment" : "user"
	}

	render() {
		return (
			<video className={style.video} ref={this.videoRef}></video>
		)
	}

	/**
	 * Init the camera.
	 * @note the left and right side of the input image
	 * is depended on the camera type. For a camera,
	 * moving your hand to the left will yield a video showing
	 * your hand moving to the right (in your POV). This is because 
	 * your hand is moving at (-1, 0). However, since the camera is opposite of
	 * you, it sees that your hand is moving at (1, 0). Thus, it will draw
	 * your hand moving at (1, 0) on the canvas => for us, it will
	 * be moving to the right. 
	 */
	componentDidMount() {
		const camera = new Camera(this.videoRef.current, {
			onFrame: async () => {
				// do this to ensure that we only process the frame
				// according to the interval set below
				if (!this.processedFrame) {
					await this.props.tracker.hands.send({image: this.videoRef.current})
					this.processedFrame = true
				}
			},
			// only need a small resolution
			width: 128,
			height: 72,
			facingMode: this.facingMode
		})

		setInterval(this.setProcessedFrame.bind(this, false), UPDATE_STEP_IN_A_SEC)
		camera.start()
	}

	/**
	 * @param value the new value.
	 */
	setProcessedFrame(value: boolean) {
		this.processedFrame = value
	}
}