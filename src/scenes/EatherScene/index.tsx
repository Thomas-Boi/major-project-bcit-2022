import style from "./index.module.css"
import React from "react"
import { SceneProps } from "react-app-env"
import {getVid} from "services/util"
import IncantationManager from "components/IncantationManager"
import Hand from "services/Hand"
import * as Gesture from "services/Gesture"

interface IState {
	/**
	 * The current video name 
	 */
	curVideoName: string

	curGesture: Gesture.Gesture | null

	/**
	 * The time when the user started the gesture.
	 */
	gestureStartTime: number
}

/**
 * An object mapping the gesture image to its name.
 */
const vidIncantations = {
  "lightning": Gesture.FIVE,
  "snow": Gesture.ONE,
  "rain": Gesture.TWO
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
					vidIncantations={vidIncantations}/>
        <video className={style.video} src={getVid(this.state.curVideoName)} onEnded={this.onVideoEnded}></video>
      </div>
    )
  }

	componentDidMount(): void {
		// /**
		//  * First step: add a check for removing the instruction.
		//  */
		// this.props.gestureDetector.addObserver(this.removeInstruction)
		// this.props.gestureDetector.addGesturesToDetect([Gesture.FIVE])

		this.props.gestureDetector.addObserver(this.update)
		this.props.gestureDetector.addGesturesToDetect(Object.values(vidIncantations))
		
	}

	update = (hand: Hand | null, prevHand: Hand | null, curGesture: Gesture.Gesture | null, gestureStartTime: number) => {
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