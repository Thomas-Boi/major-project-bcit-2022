import style from "./index.module.css"
import React from "react"
import { SceneProps } from "react-app-env"
import {getVid} from "services/util"
import IncantationManager, {incantsConfig} from "components/IncantationManager"
import Hand from "services/Hand"
import * as Gesture from "services/Gesture"

interface IState {
	/**
	 * The current video name 
	 */
	curVideoName: string

	/**
	 * The current gesture the user is making.
	 */
	curGesture: Gesture.Gesture | null

	/**
	 * The time when the user started the gesture.
	 */
	gestureStartTime: number
}

export default class EatherScene extends React.Component<SceneProps, IState> {
	/**
	 * Whether the video is playing. During this time,
	 * the incantations shouldn't be loaded.
	 */
	videoPlaying: boolean

	constructor(props: SceneProps) {
		super(props)
		this.state = {
			curVideoName: "lightning",
			curGesture: null,
			gestureStartTime: 0
		}

		this.videoPlaying = false
	}

  render() {
    return (
      <div>
				<IncantationManager 
					playVideoCallback={this.playVideo} 
					curGesture={this.state.curGesture} 
					gestureStartTime={this.state.gestureStartTime} 
					videoPlaying={this.videoPlaying}/>
        <video className={style.video} src={this.state.curVideoName} autoPlay onEnded={this.onVideoEnded}></video>
      </div>
    )
  }

	componentDidMount(): void {
		// /**
		//  * First step: add a check for removing the instruction.
		//  */
		// this.props.gestureDetector.addObserver(this.removeInstruction)
		// this.props.gestureDetector.addGesturesToDetect([Gesture.FIVE])

		this.props.gestureDetector.addObserver(this.update, this.update.name)
		this.props.gestureDetector.addGesturesToDetect(
			Object.values(incantsConfig)
				.map(config => config.gesture))
		
	}

	update = (hand: Hand | null, prevHand: Hand | null, curGesture: Gesture.Gesture, gestureStartTime: number) => {
		if (this.videoPlaying) {
			return
		}

		this.setState({
			curGesture,
			gestureStartTime
		})
	}

	/**
	 * Play the video specified by vidName.
	 * @param vidName the video name
	 */
	playVideo = (vidName: string) => {
		if (this.videoPlaying) return
		this.videoPlaying = true
		this.setState({curVideoName: vidName})
	}

	/**
	 * Handle the event when a video finishes playing.
	 */
	onVideoEnded = () => {
		this.videoPlaying = false
	}
}