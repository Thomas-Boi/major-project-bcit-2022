import React from 'react'
// import Viewer3DScene from './Viewer3DScene'
import InputSource from "../inputSource/InputSource"
import HandTracker from "../hands/HandTracker"
import GestureDetector from '../hands/GestureDetector'

// main()
// function main() {
//   // set up components
//   const tracker = new HandTracker()
//   const inputSource = new InputSource()
//   const controller = new Controller(inputSource.facingMode)

//   // connect the pipeline
//   // input -> tracker -> controller
//   inputSource.initCamera(tracker)
//   controller.subscribe(tracker)

//   inputSource.start()
// }

class App extends React.Component {
  /**
   * The current scene index.
   */
  curScene: number

  /**
   * All the scenes that we have in this app.
   */
  scenes: Array<React.Component>

  ///// PIPELINE /////
  /**
   * The HandTracker that parses our camera input.
   */
  handTracker: HandTracker

  /**
   * The GestureDetector that parses the raw hand data and determines
   * the gesture the user is making.
   */
  gestureDetector: GestureDetector

  constructor(props) {
    super(props)
    this.state = {
      
    }
    this.curScene = 0
    this.scenes = [
    ]

    // note that 
    this.handTracker = new HandTracker()
    this.gestureDetector = new GestureDetector()

    // connect the pipeline
    // input -> tracker -> gestureDetector -> scene
    // set up tracker -> gestureDetector first then
    // scene and input finally
    this.handTracker.addObserver(this.gestureDetector.onResultsCallback)
  }

  render() {
    // after the input source is mounted, it will start the pipeline
    // process
    return (
      <div className="App">
        <InputSource tracker={this.handTracker}/>
      </div>
    );
  }
}

export default App;
