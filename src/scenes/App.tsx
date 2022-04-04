import React from 'react'
import InputSource from "components/InputSource"
import HandTracker from "services/HandTracker"
import GestureDetector from 'services/GestureDetector'
import LoadingScene from './LoadingScene'
import MenuScene from './MenuScene'
import Viewer3DScene from './Viewer3DScene'
import EatherScene from './EatherScene'

const SCENES =  {
  "LOADING": 0,
  "MENU": 1,
  "3D": 2,
  "EATHER": 3
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

  /**
   * Whether the screen is facing the user.
   */
  isScreenFacingUser: boolean

  constructor(props: any) {
    super(props)
    this.state = {
      curScene: SCENES.LOADING      
    }

    // connect the pipeline
    // input -> tracker -> gestureDetector -> scene
    // set up tracker -> gestureDetector first then
    // scene and input finally
    this.handTracker = new HandTracker()
    this.gestureDetector = new GestureDetector()
    this.handTracker.addObserver(this.gestureDetector.onResultsCallback)

    this.isScreenFacingUser = true
  }

  render() {
    // default scene is the loading scene 
    let scene = <LoadingScene isScreenFacingUser={this.isScreenFacingUser} gestureDetector={this.gestureDetector} loadSceneCallback={this.loadScene}/>
    if (this.state.curScene === SCENES['MENU']) {
      scene = <MenuScene isScreenFacingUser={this.isScreenFacingUser} gestureDetector={this.gestureDetector} loadSceneCallback={this.loadScene}/>
    }
    else if (this.state.curScene === SCENES['3D']) {
      scene = <Viewer3DScene isScreenFacingUser={this.isScreenFacingUser} gestureDetector={this.gestureDetector} loadSceneCallback={this.loadScene}/>
    }
    else if (this.state.curScene === SCENES['EATHER']) {
      scene = <EatherScene isScreenFacingUser={this.isScreenFacingUser} gestureDetector={this.gestureDetector} loadSceneCallback={this.loadScene}/>
    }

    // after the input source is mounted, it will start the pipeline process
    return (
      <div className="App">
        <InputSource tracker={this.handTracker}/>
        {scene}
      </div>
    );
  }

  loadScene = (sceneName: "MENU"|"3D"|"EATHER"|"LOADING") => {
    this.setState({curScene: SCENES[sceneName]})
  }
}

export default App;
