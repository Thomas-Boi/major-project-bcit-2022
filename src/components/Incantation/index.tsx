import React from "react"
import cssFile from "./index.module.css"

export interface IncantationData {
  /**
   * The url of the image we want to display.
   */
  imgUrl: string;

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
 * The size (width or height) of an incantation image in pixel.
 */
export const INCANTATION_SIZE = document.body.clientWidth * 0.2

/**
 * An incantation that the user can interact with.
 * @param props 
 * @returns 
 */
export function Incantation(props: IncantationData) {
  let style = {
    "transform": `translate(${props.x}px, ${props.y}px)`
  }
  return (
    <img src={props.imgUrl} className={cssFile.img} style={style} alt='An Incantation'/>
  )
}