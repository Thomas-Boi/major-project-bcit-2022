import React from 'react'
import InputSource from "components/InputSource"
import HandTracker from "services/HandTracker"
import GestureDetector from 'services/GestureDetector'
import MenuScene from './MenuScene'
import Viewer3DScene from './Viewer3DScene'
import EatherScene from './EatherScene'

const SCENES =  {
  "MENU": 0,
  "3D": 1,
  "EATHER": 2
}

interface IState {
  /**
   * The current scene index.
   */
  curScene: number
}

class App extends React.Component<any, IState> {
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

  constructor(props: any) {
    super(props)
    this.state = {
      curScene: SCENES.EATHER      
    }

    // connect the pipeline
    // input -> tracker -> gestureDetector -> scene
    // set up tracker -> gestureDetector first then
    // scene and input finally
    this.handTracker = new HandTracker()
    this.gestureDetector = new GestureDetector()
    this.handTracker.addObserver(this.gestureDetector.onResultsCallback)

  }

  render() {
    // default scene is the menu 
    let scene = <MenuScene isScreenFacingUser={true} gestureDetector={this.gestureDetector} loadSceneCallback={this.loadScene}/>
    if (this.state.curScene === 1) {
      scene = <Viewer3DScene isScreenFacingUser={true} gestureDetector={this.gestureDetector} loadSceneCallback={this.loadScene}/>
    }
    else if (this.state.curScene === 2) {
      scene = <EatherScene isScreenFacingUser={true} gestureDetector={this.gestureDetector} loadSceneCallback={this.loadScene}/>
    }

    // after the input source is mounted, it will start the pipeline process
    return (
      <div className="App">
        <InputSource tracker={this.handTracker}/>
        {scene}
      </div>
    );
  }

  loadScene = (sceneName: "MENU"|"3D"|"EATHER") => {
    this.setState({curScene: SCENES[sceneName]})
  }
}

export default App;
