/**
 * This file stores the global variables, interfaces and configs
 * required for the index.tsx.
 */
import {INCANTATION_SIZE} from "components/Incantation"
import * as Gesture from "services/Gesture"

// assets
import fiveImg from "assets/img/five.png"
import oneImg from "assets/img/one.png"
import twoImg from "assets/img/two.png"
// @ts-ignore
import lightningVid from "assets/video/lightning.mp4"


/////////////// SPAWNER CONFIG //////////////////
/**
 * How often the manager will try to spawn a new Incantation.
 */
export const SPAWNER_TIMESTEP_MILISEC = 1000

/**
 * The maximum amount of incantation that can be on the screen.
 */
export const MAX_INCANTATION_AMOUNT = 3

/**
 * The probability of spawning an incantation out of 10.
 */
export const SPAWN_PROBABILITY_NUM = 4

/**
 * The maximum x value an Incantation can be spawned with.
 */
export const SPAWN_X_UPPER_BOUND = window.innerWidth - INCANTATION_SIZE 

/**
 * The maximum y value an Incantation can be spawned with.
 */
export const SPAWN_Y_UPPER_BOUND = window.innerHeight - INCANTATION_SIZE 


/////////////// SPAWNER CONFIG //////////////////

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
export interface IncantationConfig {
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

export interface IncantationData {
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

export const PLAY_VID_THRESHOLD_TIME_MILI = 3000