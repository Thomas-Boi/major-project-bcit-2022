import React from "react"
import cssFile from "./index.module.css"


/**
 * The incantation props.
 */
export interface IncantationProps {
	/**
	 * The image associated with the incantation.
	 * Include extension name (e.g "lightning.png").
	 */
  imgUrl: string

  /**
   * The x position as a pixel value.
   */
  x: number;

  /**
   * The y position as a pixel value.
   */
  y: number;

  /**
   * Whether the incantation is selected by the user.
   */
  selected: boolean;
}

/**
 * The size (width or height) of an incantation image in pixel.
 */
export const INCANTATION_SIZE = document.body.clientWidth * 0.2

/**
 * An incantation that the user can interact with.
 * @param props 
 * @returns 
 */
export function Incantation(props: IncantationProps) {
  let style: {transform: string, opacity?: number} = {
    "transform": `translate(${props.x}px, ${props.y}px)`
  }

  if (props.selected) {
    style.transform += " scale(1.2)"
    style.opacity = 1
  }

  return (
    <img src={props.imgUrl} className={cssFile.img} style={style} alt='An Incantation'/>
  )
}