import React from 'react'
import Viewer3DScene from './Viewer3DScene'
import InputSource from "../inputSource/InputSource"
import HandTracker from "../hands/HandTracker"

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

  constructor(props) {
    super(props)
    this.curScene = 0
    this.scenes = [
      <Viewer3DScene/>
    ]
  }

  render() {
    return (
      <div className="App">
      </div>
    );
  }
}

export default App;
