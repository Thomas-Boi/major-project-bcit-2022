export default function Viewer3DScene(props) {
  return (
    <div>
      <Viewer3DLoadScene />
      <canvas id='canvas'></canvas>
    </div>
  )
}

function Viewer3DLoadScene() {
  return (
    <div id='loadingScreen'>
			<span id="loadingUI">
				<div className='spinner'>
				</div>
				<div className="spinnerText">LOADING</div>
			</span>
			<span id="startMsg">
				<img src="build/img/five.png" className="startGesture" alt='Start gesture'/>TO START
			</span>
			<div id="instructionDiv">
				<img className="instruction" src="build/img/translate.png" alt='Translate instruction'/>
				<img className="instruction" src="build/img/rotate_y.png"  alt='Rotate Y instruction'/>
				<img className="instruction" src="build/img/rotate_x.png" alt='Rotate X instruction'/>
				<img className="instruction" src="build/img/zoom.png" alt='Zoom instruction'/>
				<img className="instruction" src="build/img/reset.png" alt='Reset instruction'/>
				<div className="instructionText">TRANSLATE</div>
				<div className="instructionText">ROTATE Y</div>
				<div className="instructionText">ROTATE X</div>
				<div className="instructionText">ZOOM</div>
				<div className="instructionText">RESET</div>
			</div>
		</div>
  )
}
