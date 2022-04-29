import React from "react"
import cssFile from "./index.module.css"
import CSS from "csstype"

// see configs data at the bottom of file
interface IState {
  /**
   * When the incantation should start fading out.
   */
  startFadingOut: boolean
}

/**
 * The incantation props (see IncantationData at bottom of file).
 */
export interface IncantationProps extends IncantationData {

	/**
	 * The image associated with the incantation.
	 * Include extension name (e.g "lightning.png").
	 */
  imgUrl: string

  /**
   * Whether the incantation is selected by the user.
   */
  selected: boolean;

  /**
   * Remove the incantation from the screen.
   */
  removeIncant: () => void

  /**
   * Fade out the screen. 
   */
  fadeOutScreen: (gestureName: string) => void
}

/**
 * An incantation that the user can interact with.
 * @param props 
 * @returns 
 */
export class Incantation extends React.Component<IncantationProps, IState> {
  /**
   * The timer for how long the incantation has to live.
   */
  timeToLiveTimer: ReturnType<typeof setTimeout>

  /**
   * The timer for when the incantation should fade out.
   */
  fadeOutTimer: ReturnType<typeof setTimeout>

  /**
   * The timer for when the incantation should fade out.
   */
  selectedTimer: ReturnType<typeof setTimeout>
  
  /**
   * Whether the incantation is in the process of fading out.
   */
  isFadingOut: boolean


  constructor(props: IncantationProps) {
    super(props)
    this.state = {
      startFadingOut: false
    }

    this.isFadingOut = false
  }

  render() {
    // default styling is nothing
    let style: CSS.Properties = { }

    // change the style based on whether it's visible
    if (this.props.isVisible) {
      style =  {
        "transform": `translate(${this.props.x}px, ${this.props.y}px)`,
        "transition": `opacity ${FADE_TIME_MILI}ms`,
        "opacity": FADE_IN_OPACITY
      }
      
      // force fadeout overrides everything else below it
      if (this.props.forceFadeOut) {
        style.opacity = 0
        style.transition = ""
      }
      else {
        // add on styling => this depends on the order
        // if incant is being selected => it cannot fade away
        // if incant is fading away => it cannot be selected
        
        // only go into select mode if we aren't fading out currently
        if (this.props.selected && !this.isFadingOut) {
          style.transform += " scale(1.2)"
          style.transition = SELECTED_TRANSITION
          style.opacity = 1
        }
        // use else if so we never start fade out while being selected
        else if (this.state.startFadingOut) {
          style.opacity = 0
          this.isFadingOut = true
          // this timer has to be set here since it starts when 
          // we start fading out
          if (this.fadeOutTimer === undefined)  {
            this.fadeOutTimer = this.fadeOutCleanUp(FADE_TIME_MILI) 
          }
        }
      }
    }

    return (
      <div className={cssFile.container} style={style}>
        <img src={this.props.imgUrl} className={cssFile.img} alt='An Incantation'/>
        <div>{this.props.displayName}</div>
      </div>
    )
  }

  /**
   * Set the timer for things that relies on props. These are the timeToLive (relies on props.isVisible)
   * and forceFadeOut.
   * @param prevProps 
   * @param prevState 
   * @param snapshot 
   */
  componentDidUpdate(prevProps: Readonly<IncantationProps>, prevState: Readonly<IState>, snapshot?: any): void {

    // check for timeToLiveTimer
    // false then true => incant is now visible
    if (!prevProps.isVisible && this.props.isVisible) {
      this.timeToLiveTimer = setTimeout(() => {
        this.setState({startFadingOut: true})
      }, this.props.timeToLive + FADE_TIME_MILI) // includes the fade in time
    }

    // if false then true => we swapped to force fade out.
    if (!prevProps.forceFadeOut && this.props.forceFadeOut) {
      this.isFadingOut = true
      clearTimeout(this.timeToLiveTimer)
      clearTimeout(this.fadeOutTimer)
      this.fadeOutCleanUp(0)
    }
  
    // false then true => user just selected
    if (!prevProps.selected && this.props.selected) {
      this.selectedTimer = setTimeout(() => {
        // only play the video if we aren't fading out
        if (!this.isFadingOut) this.props.fadeOutScreen(this.props.name)
      }, PLAY_VID_THRESHOLD_TIME_MILI)    
    }
    // true then false => user deselect
    else if (prevProps.selected && !this.props.selected) {
      clearTimeout(this.selectedTimer)
    }
  }

  /**
   * Handle cleanup after a fade out event (clearing fade out timer etc.).
   * @param time the number of milisecs passed before the clean up function is called.
   */
  fadeOutCleanUp(time: number) {
    return setTimeout(() => {
      // order matters here -> we don't want the startFadingOut to stay true
      this.setState({startFadingOut: false}) // not fading away anymore
      this.props.removeIncant()
      this.isFadingOut = false
      this.fadeOutTimer = undefined
      clearTimeout(this.selectedTimer) // incase there's a selected timer that was started
    }, time + 10) // buffer time to ensure gesture faded away completely

  }
}

/**
 * The size (width or height) of an incantation image in pixel.
 */
export const INCANTATION_SIZE = window.innerWidth * 0.2

/**
 * The height of the text for the incantation.
 */
export const TEXT_HEIGHT = (function () {
  // use anon function so we don't have cluttered global
  let root = document.documentElement
  let style = window.getComputedStyle(root).fontSize
  return parseFloat(style) * 2 // add a bit of a buffer since some text go below others
})()

/**
 * Time it takes for the incantation to fade away.
 */
const FADE_TIME_MILI = 3000

/**
 * Time it takes for the incantation to fade away.
 */
export const FORCE_FADE_TIME_MILI = 1000

/**
 * The opacity for when the incantation finish fading in.
 */
const FADE_IN_OPACITY = 0.5

/**
 * The time for how long the process of selecting an incant last.
 */
const SELECTED_TIME_MILI = 3000

/**
 * The transition specifically for when the incantation is selected.
 */
const SELECTED_TRANSITION = `transform ${SELECTED_TIME_MILI}ms, opacity ${SELECTED_TIME_MILI}ms`

/**
 * How long the user need to select a gesture before we play the video.
 */
const PLAY_VID_THRESHOLD_TIME_MILI = 3000



/**
 * Represent the base data passed in to the Incantation.
 * For a full list, also see IncantationProp.
 */
export class IncantationData {
  /**
   * Name of the incantation (logic, not meant for UI).
   */
  name: string
  
  /**
   * The gesture name that we will display to the user.
   */
  displayName: string

  /**
   * The x position as a pixel value.
   */
  x: number;

  /**
   * The y position as a pixel value.
   */
  y: number;
	
  /**
   * How long the incantation has after it is spawned until it's removed
   * from the screen.
   */
  timeToLive: number;

  /**
   * Whether the incantation is visible to the user.
   */
  isVisible: boolean;

  /**
   * Whether the incantation should start fading out right away (even before
   * its timeTolive finishes).
   */
  forceFadeOut: boolean
}
