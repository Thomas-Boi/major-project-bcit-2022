import style from "./index.module.css"
import React from "react"
import { SceneProps } from "react-app-env"
import Hand from "services/Hand"
import {Incantation, INCANTATION_SIZE, TEXT_HEIGHT, FORCE_FADE_TIME_MILI, IncantationData} from "components/Incantation"
import {getRandomInt, getRandomValue } from "services/util"
import * as Gesture from "services/Gesture"
import RangeNode from "services/RangeNode"
import CSS from "csstype"

// assets
import fiveImg from "assets/img/eather/five_incant.png"
import oneImg from "assets/img/eather/one_incant.png"
import twoImg from "assets/img/eather/two_incant.png"
import oneHorizontalImg from "assets/img/eather/one_horizontal_incant.png"
import lShapeImg from "assets/img/eather/l_shape_incant.png"
import grabFistImg from "assets/img/eather/grab_fist_incant.png"

// @ts-ignore
import lightningVid from "assets/video/lightning.mp4"
// @ts-ignore
import hummingBirdVid from "assets/video/bird.mp4"
// @ts-ignore
import butterflyVid from "assets/video/butterfly.mp4"
// @ts-ignore
import fireVid from "assets/video/fire.mp4"
// @ts-ignore
import earthVid from "assets/video/earth.mp4"
// @ts-ignore
import jellyFishVid from "assets/video/jellyfish.mp4"
// @ts-ignore
import smokeVid from "assets/video/smoke.mp4"

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

  /**
   * The extra style of the scene. Used for fading in and out.
   */
  sceneStyle: CSS.Properties
}


export default class EatherScene extends React.Component<SceneProps, IState> {
	/**
	 * Whether the incantation video (one that needs an incant to be activated) 
   * is playing. During this time, the incantations shouldn't be loaded.
	 */
	incantVideoPlaying: boolean

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
			curVideoSrc: smokeVid,
			curGesture: null,
			gestureStartTime: 0,
			incantPool,
      sceneStyle: {}
		}

		this.incantVideoPlaying = false

    this.selectedIncantName = ""
	}

  render() {
    // render the incantations
    let items = this.state.incantPool.map((data, index) => {
      // get a random display name to show that matches the data.name
      return <Incantation key={index} // keep key constant 
        {...data}
				imgUrl={incantsConfig[data.name]?.imgUrl} 
				selected={data.name === this.selectedIncantName} 
				removeIncant={this.removeIncantation.bind(this, index)}
        fadeOutScreen={this.fadeOutScreen}/> 
    })

    return (
			<div className={style.container} style={this.state.sceneStyle}>
				{items}
        <video className={style.video} 
          src={this.state.curVideoSrc} 
          autoPlay onEnded={this.onVideoEnded} 
          loop={this.state.curVideoSrc === smokeVid}
          ></video>
      </div>
    )
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

  /**
   * Check whether the user is making a gesture that matches a gesture on the screen.
   * @param hand 
   * @param prevHand 
   * @param curGesture 
   * @param gestureStartTime 
   * @returns 
   */
	update = (hand: Hand | null, prevHand: Hand | null, curGesture: Gesture.Gesture, gestureStartTime: number) => {
		// do nothing if a video is playing => save computation cycles
		if (this.incantVideoPlaying) return 

    let active = this.state.incantPool.find(incant => {
      return incantsConfig[incant.name]?.gesture === curGesture
    })

		// check if the active gesture is the same one we have been holding
    this.selectedIncantName = active?.name ? active.name : ""
	}

  /**
   * Fade out the screen then start playing the video
   * with the gesture name.
   * @param gestureName name of the gesture.
   * @returns 
   */
  fadeOutScreen = (gestureName: string) => {
    // don't have to keep playing if video is already playing
    if (this.incantVideoPlaying) return

    // remove all gestures
    this.setState({
      sceneStyle: { // fade out the vid too
        opacity: 0,
        transition: `opacity ${FORCE_FADE_TIME_MILI}ms`
      },
      incantPool: this.state.incantPool.map(incant => {
        incant.forceFadeOut = true // remove gestures
        return incant
      })
    })

    // once screen is black, prepare to play vid
    setTimeout(() => {
      // settings back to normal
      this.setState({
        sceneStyle: {}
      })
      this.playVideo(incantsConfig[gestureName].vidUrl)
    }, FORCE_FADE_TIME_MILI + 10) // only play the video after all the incants disappear

  }

	/**
	 * Play the video specified by vidName.
	 * @param vidName the video name
	 */
	playVideo = (vidName: string) => {
		this.incantVideoPlaying = true
		this.setState({curVideoSrc: vidName})
	}

	/**
	 * Handle the event when a video finishes playing.
	 */
	onVideoEnded = () => {
    this.setState({
      sceneStyle: {
        opacity: 0 // prepare to fade in the video => has to be invisible first
      },
      incantPool: this.state.incantPool.map(incant => {
        incant.forceFadeOut = false
        return incant
      })
  }) 

    setTimeout(() => {
      this.setState({
        curVideoSrc: smokeVid,
        sceneStyle: {
          transition: `opacity ${VIDEO_END_WAIT_TIME - SMOKE_FADE_IN_TIME}ms`
        }
      }) 
    }, SMOKE_FADE_IN_TIME)

    setTimeout(() => {
      this.incantVideoPlaying = false
    }, VIDEO_END_WAIT_TIME)
		
	}

  spawn = () => {
    // check if we can add more incantation by seeing whether there are any
    // inactive incant we can use
    let invisibleIncantIndex = this.state.incantPool.findIndex(incant => !incant.isVisible)
    if (this.incantVideoPlaying || invisibleIncantIndex === -1) {
      return
    }

    // find how many incants are visible right now => adjust the spawn prob based on that
    let count = this.state.incantPool.reduce((count, val) => count + (val.isVisible ? 1 : 0), 0)
    // randomly spawn an incantation by activating an invisible incantation.
    if (getRandomInt(1, 10) <= BASE_SPAWN_PROBABILITY_NUM - SPAWN_PROBABILIY_DECREASE * count) {
      let copy = this.state.incantPool.slice()
      this.activateIncantation(copy[invisibleIncantIndex])
      this.setState({incantPool: copy})
    }
  }

  /**
   * Active the incantation passed in. This will modify the
   * object directly.
   */
  activateIncantation(incant: IncantationData) {
    // calculate the x and y values so that our new gesture won't overlap with them
    let availableSpacesX = this.findAvailableSpace(0, SPAWN_X_UPPER_BOUND, "x")
    let chosenRange = getRandomValue(availableSpacesX)
    let x = getRandomInt(chosenRange.start, chosenRange.end - INCANTATION_SIZE) // minus incant size so we don't overflow
    let y = getRandomInt(0, SPAWN_Y_UPPER_BOUND)


    // get the new name
    let availableNames = this.getUnusedIncantNames()
    // set the values needed so the incant will be shown on the screen.
    incant.x = x
    incant.y = y
    incant.timeToLive = getRandomInt(INCANT_TIME_TO_LIVE_MIN, INCANT_TIME_TO_LIVE_MAX)
    incant.name = getRandomValue(availableNames)
    let dictionary = incantsConfig[incant.name]?.dictionary
    incant.displayName = getRandomValue(dictionary)
    incant.isVisible = true
  }

  /**
   * Find the available space between start (inclusive) and end (exclusive)
   * where we can spawn the incantation.
   * @param start the start value of the range.
   * @param end the end value of the range.
   * @param coord the coordinate we want to look for ("x" or "y")
   */
  findAvailableSpace(start: number, end: number, coord: "x"|"y"): Array<RangeNode> {
    // use a tree like structure to do this 
    // start out with the range of a full screen (0, MAX).
    let ranges = [new RangeNode(start, end)]

    // then, we check whether there are any spots that are taken.
    // if there are, we split the tree into two branches.
    // each child will now represent a range on the left and right side of 
    // the taken spot.
    // note: we guarantee that the take spot are always within range of a node.
    // aka there are no situations where the taken spot overlaps both left and right child.
    for (let incant of this.state.incantPool) {
      if (!incant.isVisible) continue

      let takenRange = new RangeNode(incant[coord], incant[coord] + INCANTATION_SIZE)

      // find where this taken range fits aka which range contains it
      let i = 0
      for (i; i < ranges.length; i++) {
        if (ranges[i].start <= takenRange.start && takenRange.end <= ranges[i].end) {
          break
        }
      }

      // generate the new free ranges
      let curRange = ranges[i]
      let firstRange = new RangeNode(curRange.start, takenRange.start)
      let secondRange = new RangeNode(takenRange.end, curRange.end)

      ranges.splice(i, 1, firstRange, secondRange)
    }

    // only get the ranges that can fit an incantation
    return ranges.filter(range => range.end - range.start > INCANTATION_SIZE) // >, not >= since the end is exclusive`
  }



  /**
   * Get unused incantation name.
   */
  getUnusedIncantNames(): Array<string> {
    let inactiveNames = Object.keys(incantsConfig)
    for (let incant of this.state.incantPool) {
      // console.log(incant.name, incant.isVisible)
      if (!incant.isVisible) continue

      // remove the incantations that are visible
      let index = inactiveNames.findIndex(name => name === incant.name)
      if (index !== -1) {
        inactiveNames.splice(index, 1)
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
const BASE_SPAWN_PROBABILITY_NUM = 6

/**
 * The rate of decrease for spawning incantations.
 */
const SPAWN_PROBABILIY_DECREASE = 2

/**
 * The maximum x value an Incantation can be spawned with.
 */
const SPAWN_X_UPPER_BOUND = window.innerWidth 

/**
 * The maximum y value an Incantation can be spawned with.
 */
const SPAWN_Y_UPPER_BOUND = window.innerHeight - INCANTATION_SIZE - TEXT_HEIGHT


/////////////// INCANTATION CONFIG //////////////////
/**
 * The minimum time an incantation has to live.
 */
const INCANT_TIME_TO_LIVE_MIN = 2000

/**
 * The maximum time an incantation has to live.
 */
const INCANT_TIME_TO_LIVE_MAX = 4000

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

  /**
   * Hold the words in other languages associated 
   * with the Incantation name. The languages chosen are:
   * simplified chinese, vietnamese, tagalog, persian and french.
   */
  dictionary: Array<string>
}


/**
 * An object mapping an incantation to its properties: image, video, and gestures.
 */
const incantsConfig: {[key: string]: IncantationConfig} = {
  "lightning": {
    "gesture": Gesture.ONE,
    "vidUrl": lightningVid,
    "imgUrl": oneImg,
    "dictionary": ["闪电", "sấm chớp", "kidlat", "آذرخش", "éclair"]
  },
  "hummingbird": {
    "gesture": Gesture.ONE_HORIZONTAL,
    "vidUrl": hummingBirdVid,
    "imgUrl": oneHorizontalImg,
    "dictionary": ["蜂鸟", "chim ruồi", "ibon", "مرغ مگس خوار", "colibri"]
  },
  "butterfly": {
    "gesture": Gesture.TWO,
    "vidUrl": butterflyVid,
    "imgUrl": twoImg,
    "dictionary": ["蝴蝶", "bươm bướm", "paruparo", "پروانه", "papillon"]
  },
  "jellyfish": {
    "gesture": Gesture.L_SHAPE,
    "vidUrl": jellyFishVid,
    "imgUrl": lShapeImg,
    "dictionary": ["水母", "sứa", "dikya", "چتر دریایی", "méduse"]
  },
  "fire": {
    "gesture": Gesture.FIVE,
    "vidUrl": fireVid,
    "imgUrl": fiveImg,
    "dictionary": ["火灾", "lửa", "sunog", "آتش", "feu"]
  },
  "earth": {
    "gesture": Gesture.GRAB_FIST,
    "vidUrl": earthVid,
    "imgUrl": grabFistImg,
    "dictionary": ["地球", "Trái Đất", "Ang Mundo", "زمین", "La Terre"]
  }
}

/////////////// VIDEO RELATED CONFIG //////////////////

/**
 * The wait time after an incant video played before we return
 * to spawning incantations.
 */
const VIDEO_END_WAIT_TIME = 3000

/**
 * After an incantation vid finished playing, wait this
 * long before the smoke reappearts.
 */
const SMOKE_FADE_IN_TIME = 1000