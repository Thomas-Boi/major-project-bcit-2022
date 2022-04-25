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
}

/**
 * An incantation that the user can interact with.
 * @param props 
 * @returns 
 */
export class Incantation extends React.Component<IncantationProps, IState> {
  /**
   * The timer for when the incantation disappear.
   */
  timeoutTimer: ReturnType<typeof setInterval>
  
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
        "opacity": FADE_IN_OPACITY,
        "transition": `opacity ${FADE_TIME_MILI}ms`
      }
      if (this.timeoutTimer === undefined) {
        // start keepin track of live time only after it's visible FOR THE FIRST TIME
        this.timeoutTimer = setTimeout(this.fadeOut, this.props.timeToLive)
      }
    }

    // add on styling => this depends on the order
    // if incant is being selected => it cannot fade away
    // if incant is fading away => it cannot be selected
    // if both are true => select the one that happens first
    
    // only go into select mode is we aren't fading out currently
    if (this.props.selected && !this.isFadingOut) {
      style.transform += " scale(1.2)"
      style.opacity = 1
      style.transition = SELECTED_TRANSITION
    }
    // use else if so we never start fade out while being selected
    else if (this.state.startFadingOut) {
      style.opacity = 0
      this.isFadingOut = true
    }

    return (
      <div className={cssFile.container} style={style}>
        <img src={this.props.imgUrl} className={cssFile.img} alt='An Incantation'/>
        <div>{this.props.displayName}</div>
      </div>
    )
  }

  /**
   * Check whether the EatherScene want to force fade out => update the scene again.
   * @param prevProps 
   * @param prevState 
   * @param snapshot 
   */
  componentDidUpdate(prevProps: Readonly<IncantationProps>, prevState: Readonly<IState>, snapshot?: any): void {
    if (prevProps.forceFadeOut === this.props.forceFadeOut) return

    if (this.props.forceFadeOut) {
      // clear the timer since this was manually triggered
      clearTimeout(this.timeoutTimer)
      this.fadeOut() // manually start fading out
    }
    
  }

  /**
   * Fade out and disappear from the screen.
   */
  fadeOut = () => {
    this.setState({startFadingOut: true})
    setTimeout(() => {
      this.props.removeIncant()
      this.timeoutTimer = undefined // reset so we can now restart the timer
      this.setState({startFadingOut: false}) // not fading away anymore
      this.isFadingOut = false
    }, FADE_TIME_MILI + 100) // buffer time to ensure gesture faded away
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
  return parseFloat(style)
})()

/**
 * Time it takes for the incantation to fade away.
 */
const FADE_TIME_MILI = 3000

/**
 * The opacity for when the incantation finish fading in.
 */
const FADE_IN_OPACITY = 0.5

/**
 * The transition specifically for when the incantation is selected.
 */
const SELECTED_TRANSITION = "transform 3s, opacity 3s"


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
