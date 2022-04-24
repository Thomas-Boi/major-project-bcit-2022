import style from "./index.module.css"
import React from "react"
import { SceneProps } from "react-app-env"
import Hand from "services/Hand"
import {Incantation, INCANTATION_SIZE, IncantationData} from "components/Incantation"
import {getRandomInt, getRandomValue, areRangesOverlap} from "services/util"
import * as Gesture from "services/Gesture"

// assets
import fiveImg from "assets/img/five.png"
import oneImg from "assets/img/one.png"
import twoImg from "assets/img/two.png"
// @ts-ignore
import lightningVid from "assets/video/lightning.mp4"

/* See configs at bottom of file */

interface IState {
	/**
	 * The current video source.
	 */
	curVideoSrc: string

	/**
	 * The current gesture the user is making.
	 */
	curGesture: Gesture.Gesture | null

	/**
	 * The time when the user started the gesture.
	 */
	gestureStartTime: number

  /**
   * The incantation pool we can use to display things on the screen.
   */
  incantPool: Array<IncantationData>
}

export default class EatherScene extends React.Component<SceneProps, IState> {
	/**
	 * Whether the video is playing. During this time,
	 * the incantations shouldn't be loaded.
	 */
	videoPlaying: boolean

  /**
   * Store the spawn interval object so we can remove it when dismount.
   */
  intervalObj: ReturnType<typeof setInterval>

  /**
   * The incantation name the user is selecting.
   */
  selectedIncantName: string

	constructor(props: SceneProps) {
		super(props)
    
    // init the incants (object pool pattern)
    let incantPool = []
    for (let i = 0; i < MAX_INCANTATION_AMOUNT; i++) {
      incantPool.push(new IncantationData())
    }

		this.state = {
			curVideoSrc: "",
			curGesture: null,
			gestureStartTime: 0,
			incantPool
		}

		this.videoPlaying = false

    this.selectedIncantName = ""
	}

  render() {
    // render the incantations
    let items = this.state.incantPool.map((data, index) => {
      return <Incantation key={index} // keep key constant 
        {...data}
				imgUrl={incantsConfig[data.name]?.imgUrl} 
				selected={data.name === this.selectedIncantName} 
				removeIncant={this.removeIncantation.bind(this, index)}/> 
    })

    return (
			<div className={style.container}>
				{items}
        <video className={style.video} src={this.state.curVideoSrc} autoPlay onEnded={this.onVideoEnded}></video>
      </div>
    )
  }

	/**
	 * After scene is rendered, check whether the user is performing any gesture
	 * that matches one on the screen. 
   * This code MUST be in this lifecycle method because it will modify 
   * the state of the component.
	 */
  componentDidUpdate(): void {
    let active = this.state.incantPool.find(incant => {
      return incantsConfig[incant.name]?.gesture === this.state.curGesture
    })

		// check if the active gesture is the same one we have been holding
    if (active?.name === this.selectedIncantName) {
      // check time hold
			if (Date.now() - this.state.gestureStartTime >= PLAY_VID_THRESHOLD_TIME_MILI) {
        // remove all gestures
        this.playVideo(incantsConfig[active.name].vidUrl)
        // this.setState({incantPool: []})
			}
    }
		// if not the same one, set it to this new one
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
			Object.values(incantsConfig)
				.map(config => config.gesture))

		// start spawning
    this.intervalObj = setInterval(this.spawn, SPAWNER_TIMESTEP_MILISEC)
	}

	update = (hand: Hand | null, prevHand: Hand | null, curGesture: Gesture.Gesture, gestureStartTime: number) => {
		// do nothing if a video is playing => save computation cycles
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
		this.setState({curVideoSrc: vidName})
	}

	/**
	 * Handle the event when a video finishes playing.
	 */
	onVideoEnded = () => {
		this.videoPlaying = false
	}

  spawn = () => {
    // check if we can add more incantation by seeing whether there are any
    // inactive incant we can use
    let invisibleIncantIndex = this.state.incantPool.findIndex(incant => !incant.isVisible)
    if (this.videoPlaying || invisibleIncantIndex === -1) {
      return
    }

    // randomly spawn an incantation by activating an invisible incantation.
    if (getRandomInt(1, 10) <= SPAWN_PROBABILITY_NUM) {
      let copy = this.state.incantPool.slice()
      // console.log("before", copy[invisibleIncantIndex])
      this.activateIncantation(copy[invisibleIncantIndex])
      // console.log("after", copy[invisibleIncantIndex])
      this.setState({incantPool: copy})
    }
  }

  /**
   * Active the incantation passed in. This will modify the
   * object directly.
   */
  activateIncantation(incant: IncantationData) {
    // calculate the x and y values so that our new gesture won't overlap with them
    // first, just pick a random coord
    let possibleX = getRandomInt(0, SPAWN_X_UPPER_BOUND)
    let possibleY = getRandomInt(0, SPAWN_Y_UPPER_BOUND)
    for (let {x, y, isVisible} of this.state.incantPool) {
      if (!isVisible) continue

      // test whether the dimensions would overlap
      let overlapped = areRangesOverlap(x, x + INCANTATION_SIZE, possibleX, possibleX + INCANTATION_SIZE) 
        && areRangesOverlap(y, y + INCANTATION_SIZE, possibleY, possibleY + INCANTATION_SIZE)

      if (overlapped) {
        // get a new random value
        possibleX = getRandomInt(0, SPAWN_X_UPPER_BOUND)
        possibleY = getRandomInt(0, SPAWN_Y_UPPER_BOUND)
      }
    }

    // get the new name
    let availableNames = this.getUnusedIncantNames()
    // set the values needed so the incant will be shown on the screen.
    incant.activate(
      possibleX, possibleY, 
      getRandomInt(INCANT_TIME_TO_LIVE_MIN, INCANT_TIME_TO_LIVE_MAX),
      getRandomValue(availableNames))
  }

  /**
   * Get unused incantation name.
   */
  getUnusedIncantNames(): Array<string> {
    let inactiveNames = Object.keys(incantsConfig)
    for (let incant of this.state.incantPool) {
      if (!incant.isVisible) continue

      let index = inactiveNames.findIndex(name => name === incant.name)
      if (index !== -1) {
        inactiveNames.splice(-1, 1)
      }
    }
    return inactiveNames
  }

  /**
   * Remove the incantation at this index.
   * This just means set it to invisible.
   * @param index - the index of the incantation we 
   * are "removing".
   */
  removeIncantation = (index: number) => {
    // make a copy then modify it
    let copy = this.state.incantPool.slice()
    copy[index].isVisible = false
    this.setState({incantPool: copy})
  }

  /**
   * Clean up before we get unmount.
   */
  componentWillUnmount(): void {
    clearInterval(this.intervalObj)
  }
}


/////////////// SPAWNER CONFIG //////////////////
/**
 * How often the manager will try to spawn a new Incantation.
 */
const SPAWNER_TIMESTEP_MILISEC = 1000

/**
 * The maximum amount of incantation that can be on the screen.
 */
const MAX_INCANTATION_AMOUNT = 3

/**
 * The probability of spawning an incantation out of 10.
 */
const SPAWN_PROBABILITY_NUM = 4

/**
 * The maximum x value an Incantation can be spawned with.
 */
const SPAWN_X_UPPER_BOUND = window.innerWidth - INCANTATION_SIZE 

/**
 * The maximum y value an Incantation can be spawned with.
 */
const SPAWN_Y_UPPER_BOUND = window.innerHeight - INCANTATION_SIZE 



/////////////// INCANTATION CONFIG //////////////////
/**
 * The minimum time an incantation has to live.
 */
const INCANT_TIME_TO_LIVE_MIN = 2000

/**
 * The maximum time an incantation has to live.
 */
const INCANT_TIME_TO_LIVE_MAX = 5000

/**
 * The configuration detail of an incantation.
 * This means the static aspects.
 */
interface IncantationConfig {
	/**
	 * The image associated with the incantation.
	 * Include extension name (e.g "lightning.png").
	 */
  imgUrl: string

	/**
	 * The image associated with the incantation.
	 * Include extension name (e.g "lightning.mp4").
	 */
  vidUrl: string

  /**
   * The gesture associated with this Incantation.
   */
  gesture: Gesture.Gesture
}


/**
 * An object mapping an incantation to its properties: image, video, and gestures.
 */
const incantsConfig: {[key: string]: IncantationConfig} = {
  "lightning": {
    "gesture": Gesture.FIVE,
    "vidUrl": lightningVid,
    "imgUrl": fiveImg
  },
  "snow": {
    "gesture": Gesture.ONE,
    "vidUrl": lightningVid,
    "imgUrl": oneImg
  },
  "rain": {
    "gesture": Gesture.TWO,
    "vidUrl": lightningVid,
    "imgUrl": twoImg
  }
}

/**
 * How long the user need to hold the gesture before we play the video.
 */
const PLAY_VID_THRESHOLD_TIME_MILI = 3000