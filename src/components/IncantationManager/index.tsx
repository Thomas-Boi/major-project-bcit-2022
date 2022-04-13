import React from "react"
import style from "./index.module.css"
import {Incantation, INCANTATION_SIZE} from "components/Incantation"
import * as Gesture from "services/Gesture"
import {getRandomInt, getRandomValue, areRangesOverlap} from "services/util"

// assets
import fiveImg from "assets/img/five.png"
import oneImg from "assets/img/one.png"
import twoImg from "assets/img/two.png"
// @ts-ignore
import lightningVid from "assets/video/lightning.mp4"

interface IProps {
  /**
   * A callback that will play a video.
   */
  playVideoCallback: (vidName: string) => void

  /**
   * The current gesture that the user is making.
   */
	curGesture: Gesture.Gesture | null

	/**
	 * The time when the user started the gesture.
	 */
	gestureStartTime: number

  videoPlaying: boolean
}

interface IState {
  /**
   * The items we will be rendering on the screen.
   */
  activeIncants: Array<IncantationData>
}

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

/**
 * An object mapping the gesture image to its name.
 */
export const gestures = {
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
export const incantsConfig: {[key: string]: IncantationConfig} = {
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

export default class IncantationManager extends React.Component<IProps, IState> {
  /**
   * Store the interval object so we can remove it when dismount.
   */
  intervalObj: ReturnType<typeof setInterval>

  /**
   * The incantation name the user is selecting.
   */
  selectedIncantName: string

	constructor(props: IProps) {
		super(props)
		this.state = {
			activeIncants: []
    }

    this.selectedIncantName = ""
  }

  render() {
    if (!this.props.videoPlaying && this.intervalObj === null) {
      this.intervalObj = setInterval(this.spawn, SPAWNER_TIMESTEP_MILISEC)
    }

    // check gestures and see if it matches anything on screen
    // if it does, we set it as active
    let active = this.state.activeIncants.find(incant => {
      return incantsConfig[incant.name].gesture === this.props.curGesture
    })

    // render the incantations
    let items = this.state.activeIncants.map((data, index) => {
      let selected = data.name === active?.name
      return <Incantation key={index} x={data.x} y={data.y} imgUrl={incantsConfig[data.name].imgUrl} selected={selected} />
    })

    return (
      <div className={style.container}>
          {items}
      </div>
    )
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any): void {
    let active = this.state.activeIncants.find(incant => {
      return incantsConfig[incant.name].gesture === this.props.curGesture
    })

    if (active?.name === this.selectedIncantName) {
      // check time hold
			if (Date.now() - this.props.gestureStartTime >= PLAY_VID_THRESHOLD_TIME_MILI) {
        // stop spawning for now
        clearInterval(this.intervalObj)
        this.intervalObj = null

        // remove all gestures
        this.setState({activeIncants: []})
        this.props.playVideoCallback(incantsConfig[active.name].vidUrl)
			}
    }
    else this.selectedIncantName = active?.name ? active.name : ""
    
  }

  /**
   * Only start spawning when we are sure all the elements are rendered.
   */
  componentDidMount(): void {
    this.intervalObj = setInterval(this.spawn, SPAWNER_TIMESTEP_MILISEC)
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