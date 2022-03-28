import style from "./index.module.css"
import React from "react"
import { SceneProps } from "react-app-env"
import {getVid} from "services/util"
import IncantationManager from "components/IncantationManager"

interface IState {
	/**
	 * The current video name 
	 */
	curVideoName: string
}

export default class EatherScene extends React.Component<SceneProps, IState> {
	constructor(props: SceneProps) {
		super(props)
		this.state = {
			curVideoName: "lightning"
		}

		// /**
		//  * First step: add a check for removing the instruction.
		//  */
		// this.props.gestureDetector.addObserver(this.removeInstruction)
		// this.props.gestureDetector.addGesturesToDetect([Gesture.FIVE])
	}

  render() {
    return (
      <div>
				<IncantationManager />
        <video className={style.video} src={getVid(this.state.curVideoName)} autoPlay></video>
      </div>
    )
  }
}