import React from "react"
import style from "./index.module.css"
import {Incantation, IncantationData, INCANTATION_SIZE} from "components/Incantation"
import five from "assets/img/five.png"
import one from "assets/img/one.png"
import two from "assets/img/two.png"
import * as Gesture from "services/Gesture"
import {getRandomInt, getRandomValue, areRangesOverlap} from "services/util"

interface IState {
  /**
   * The items we will be rendering on the screen.
   */
  items: Array<IncantationData>
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
  [Gesture.FIVE.name]: five,
  [Gesture.ONE.name]: one,
  [Gesture.TWO.name]: two
}

export default class IncantationManager extends React.Component<any, IState> {
  /**
   * Store the interval object so we can remove it when dismount.
   */
  intervalObj: ReturnType<typeof setInterval>

	constructor(props: any) {
		super(props)
    // init all the incantations we will have and set them to not appear
		this.state = {
			items: []
    }

  }

  render() {
    let items = this.state.items.map((data, index) => {
      return <Incantation key={index} {...data} />
    })

    return (
      <div className={style.container}>
        {items}
      </div>
    )
  }

  /**
   * Only start spawning when we are sure all the elements are rendered.
   */
  componentDidMount(): void {
    this.intervalObj = setInterval(this.spawn, SPAWNER_TIMESTEP_MILISEC)
  }

  spawn = () => {
    // check if we can add more incantation
    if (this.state.items.length >= MAX_INCANTATION_AMOUNT) {
      return
    }

    // randomly spawn an incantation
    if (getRandomInt(1, 10) <= SPAWN_PROBABILITY_NUM) {
      let copy = this.state.items.slice()
      copy.push(this.createNewIncantation())
      this.setState({items: copy})
    }
  }

  /**
   * Create a new incantation
   * @returns 
   */
  createNewIncantation(): IncantationData {
    let activeImgUrl: Array<string> = []
    for (let data of this.state.items) {
      activeImgUrl.push(data.imgUrl)
    }

    let imgUrl = getRandomValue(Object.values(gestures).filter(value => !activeImgUrl.includes(value)))

    // calculate the x and y values so that our new gesture won't overlap with them
    // first, just pick a random coord
    let possibleX = getRandomInt(0, SPAWN_X_UPPER_BOUND)
    let possibleY = getRandomInt(0, SPAWN_Y_UPPER_BOUND)
    for (let {x, y} of this.state.items) {
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
      imgUrl,
      x: possibleX,
      y: possibleY
    }
  }

  /**
   * Check whether an incantation is active (being shown on screen)
   * by checking whether its gestureUrl is being used.
   * @param gestureUrl the url of the gesture image.
   * @return true if the incantation is on the screen, else false.
   */
  isIncantationActive(gestureUrl: string): boolean {
    for (let data of this.state.items) {
      if (data.imgUrl === gestureUrl) return true
    }
    return false
  }

  /**
   * 
   * @param key the key 
   */
  removeIncantation(key: number) {
    // make a copy then modify it
    let copy = this.state.items.slice()
    copy.splice(key, 1) // remove one item at this space
    this.setState({items: copy})
  }

  /**
   * Clean up before we get unmount.
   */
  componentWillUnmount(): void {
    clearInterval(this.intervalObj)
  }
}