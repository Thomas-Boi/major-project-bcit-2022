import style from "./index.module.css"
import React from "react"
import { SceneProps } from "react-app-env"
import Hand from "services/Hand"
import * as h from "./helper"
import {Incantation, INCANTATION_SIZE} from "components/Incantation"
import {getRandomInt, getRandomValue, areRangesOverlap} from "services/util"
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

  /**
   * The items we will be rendering on the screen.
   */
  activeIncants: Array<h.IncantationData>
}

export default class EatherScene extends React.Component<SceneProps, IState> {
	/**
	 * Whether the video is playing. During this time,
	 * the incantations shouldn't be loaded.
	 */
	videoPlaying: boolean

  /**
   * Store the interval object so we can remove it when dismount.
   */
  intervalObj: ReturnType<typeof setInterval>

  /**
   * The incantation name the user is selecting.
   */
  selectedIncantName: string

	constructor(props: SceneProps) {
		super(props)
		this.state = {
			curVideoName: "lightning",
			curGesture: null,
			gestureStartTime: 0,
			activeIncants: []
		}

		this.videoPlaying = false

    this.selectedIncantName = ""
	}

  render() {
    if (!this.videoPlaying && this.intervalObj === null) {
      this.intervalObj = setInterval(this.spawn, h.SPAWNER_TIMESTEP_MILISEC)
    }

    // check gestures and see if it matches anything on screen
    // if it does, we set it as active
    let active = this.state.activeIncants.find(incant => {
      return h.incantsConfig[incant.name].gesture === this.state.curGesture
    })

    // render the incantations
    let items = this.state.activeIncants.map((data, index) => {
      let selected = data.name === active?.name
      return <Incantation key={index} x={data.x} y={data.y} imgUrl={h.incantsConfig[data.name].imgUrl} selected={selected} />
    })

    return (
			<div className={style.container}>
				{items}
        <video className={style.video} src={this.state.curVideoName} autoPlay onEnded={this.onVideoEnded}></video>
      </div>
    )
  }

  componentDidUpdate(): void {
    let active = this.state.activeIncants.find(incant => {
      return h.incantsConfig[incant.name].gesture === this.state.curGesture
    })

    if (active?.name === this.selectedIncantName) {
      // check time hold
			if (Date.now() - this.state.gestureStartTime >= h.PLAY_VID_THRESHOLD_TIME_MILI) {
        // stop spawning for now
        clearInterval(this.intervalObj)
        this.intervalObj = null

        // remove all gestures
        this.setState({activeIncants: []})
        this.playVideo(h.incantsConfig[active.name].vidUrl)
			}
    }
    else this.selectedIncantName = active?.name ? active.name : ""
    
  }


	/**
	 * Add gestures to detect and start the spawning process.
	 */
	componentDidMount(): void {
		// /**
		//  * First step: add a check for removing the instruction.
		//  */
		// this.props.gestureDetector.addObserver(this.removeInstruction)
		// this.props.gestureDetector.addGesturesToDetect([Gesture.FIVE])

		this.props.gestureDetector.addObserver(this.update, this.update.name)
		this.props.gestureDetector.addGesturesToDetect(
			Object.values(h.incantsConfig)
				.map(config => config.gesture))

    this.intervalObj = setInterval(this.spawn, h.SPAWNER_TIMESTEP_MILISEC)
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

  spawn = () => {
    // check if we can add more incantation
    if (this.state.activeIncants.length >= h.MAX_INCANTATION_AMOUNT) {
      return
    }

    // randomly spawn an incantation
    if (getRandomInt(1, 10) <= h.SPAWN_PROBABILITY_NUM) {
      let copy = this.state.activeIncants.slice()
      copy.push(this.createNewIncantation())
      this.setState({activeIncants: copy})
    }
  }

  /**
   * Create a new incantation, This must not 
   * be an incantation already on the screen.
   * @returns 
   */
  createNewIncantation(): h.IncantationData {
    // get an inactive incants
    let inactiveIncants = this.getInactiveIncantNames()
    let incant = getRandomValue(inactiveIncants)

    // calculate the x and y values so that our new gesture won't overlap with them
    // first, just pick a random coord
    let possibleX = getRandomInt(0, h.SPAWN_X_UPPER_BOUND)
    let possibleY = getRandomInt(0, h.SPAWN_Y_UPPER_BOUND)
    for (let {x, y} of this.state.activeIncants) {
      // test whether the dimensions would overlap
      let overlapped = areRangesOverlap(x, x + INCANTATION_SIZE, possibleX, possibleX + INCANTATION_SIZE) 
        && areRangesOverlap(y, y + INCANTATION_SIZE, possibleY, possibleY + INCANTATION_SIZE)

      if (overlapped) {
        // get a new random value
        possibleX = getRandomInt(0, h.SPAWN_X_UPPER_BOUND)
        possibleY = getRandomInt(0, h.SPAWN_Y_UPPER_BOUND)
      }
    }

    return {
      name: incant,
      x: possibleX,
      y: possibleY
    }
  }

  /**
   * Get all the unused incantations.
   */
  getInactiveIncantNames(): Array<string> {
    let inactive = []
    let activeNames = Object.values(this.state.activeIncants)
      .map(active => active.name)

    for (let name of Object.keys(h.incantsConfig)) {
      // check if they are in the activeIncants
      if (!activeNames.includes(name)) {
        inactive.push(name)
      }
    }
    return inactive
  }

  /**
   * Remove the incantation at this index.
   * @param index the key 
   */
  removeIncantation(index: number) {
    // make a copy then modify it
    let copy = this.state.activeIncants.slice()
    copy.splice(index, 1) // remove one item at this space
    this.setState({activeIncants: copy})
  }

  /**
   * Clean up before we get unmount.
   */
  componentWillUnmount(): void {
    clearInterval(this.intervalObj)
  }
}