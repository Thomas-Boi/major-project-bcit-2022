import style from "./index.module.css"
import React from "react"
import { SceneProps } from "react-app-env"
import Hand from "services/Hand"
import {Incantation, INCANTATION_SIZE} from "components/Incantation"
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
  activeIncants: Array<IncantationData>
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
      this.intervalObj = setInterval(this.spawn, SPAWNER_TIMESTEP_MILISEC)
    }

    // check gestures and see if it matches anything on screen
    // if it does, we set it as active
    let active = this.state.activeIncants.find(incant => {
      return incantsConfig[incant.name].gesture === this.state.curGesture
    })

    // render the incantations
    let items = this.state.activeIncants.map((data, index) => {
      let selected = data.name === active?.name
      return <Incantation key={index} x={data.x} y={data.y} imgUrl={incantsConfig[data.name].imgUrl} selected={selected} />
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
      return incantsConfig[incant.name].gesture === this.state.curGesture
    })

    if (active?.name === this.selectedIncantName) {
      // check time hold
			if (Date.now() - this.state.gestureStartTime >= PLAY_VID_THRESHOLD_TIME_MILI) {
        // stop spawning for now
        clearInterval(this.intervalObj)
        this.intervalObj = null

        // remove all gestures
        this.setState({activeIncants: []})
        this.playVideo(incantsConfig[active.name].vidUrl)
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
			Object.values(incantsConfig)
				.map(config => config.gesture))

    this.intervalObj = setInterval(this.spawn, SPAWNER_TIMESTEP_MILISEC)
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
    if (this.state.activeIncants.length >= MAX_INCANTATION_AMOUNT) {
      return
    }

    // randomly spawn an incantation
    if (getRandomInt(1, 10) <= SPAWN_PROBABILITY_NUM) {
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
  createNewIncantation(): IncantationData {
    // get an inactive incants
    let inactiveIncants = this.getInactiveIncantNames()
    let incant = getRandomValue(inactiveIncants)

    // calculate the x and y values so that our new gesture won't overlap with them
    // first, just pick a random coord
    let possibleX = getRandomInt(0, SPAWN_X_UPPER_BOUND)
    let possibleY = getRandomInt(0, SPAWN_Y_UPPER_BOUND)
    for (let {x, y} of this.state.activeIncants) {
      // test whether the dimensions would overlap
      let overlapped = areRangesOverlap(x, x + INCANTATION_SIZE, possibleX, possibleX + INCANTATION_SIZE) 
        && areRangesOverlap(y, y + INCANTATION_SIZE, possibleY, possibleY + INCANTATION_SIZE)

      if (overlapped) {
        // get a new random value
        possibleX = getRandomInt(0, SPAWN_X_UPPER_BOUND)
        possibleY = getRandomInt(0, SPAWN_Y_UPPER_BOUND)
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

    for (let name of Object.keys(incantsConfig)) {
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


/////////////// SPAWNER CONFIG //////////////////

/**
 * An object mapping the gesture image to its name.
 */
const gestures = {
  [Gesture.FIVE.name]: fiveImg,
  [Gesture.ONE.name]: oneImg,
  [Gesture.TWO.name]: twoImg
}

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

interface IncantationData {
  /**
   * Name of the incantation.
   */
  name: string

  /**
   * The x position as a pixel value.
   */
  x: number;

  /**
   * The y position as a pixel value.
   */
  y: number;
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

const PLAY_VID_THRESHOLD_TIME_MILI = 3000