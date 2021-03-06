import React from "react"
import translate from "assets/img/translate.png"
import rotateY from "assets/img/rotate_y.png"
import rotateX from "assets/img/rotate_x.png"
import scale from "assets/img/scale.png"
import reset from "assets/img/reset.png"
import five from "assets/img/five.png"
import "./index.css"

export default function Viewer3DInstruction() {
  return (
    <div className='instructionScreen'>
			<span id="startMsg">
				<img src={five} alt='Start gesture'/>TO START
			</span>
			<div className="gesturesCommandDiv">
				<img className="instruction" src={translate} alt='Translate instruction'/>
				<img className="instruction" src={rotateY}  alt='Rotate Y instruction'/>
				<img className="instruction" src={rotateX} alt='Rotate X instruction'/>
				<img className="instruction" src={scale} alt='Zoom instruction'/>
				<img className="instruction" src={reset} alt='Reset instruction'/>
				<div className="instructionText">MOVE</div>
				<div className="instructionText">ROTATE Y</div>
				<div className="instructionText">ROTATE X</div>
				<div className="instructionText">SCALE</div>
				<div className="instructionText">RESET</div>
			</div>
		</div>
  )
}
