import React from 'react'
import InputSource from "components/InputSource"
import HandTracker from "services/HandTracker"
import GestureDetector from 'services/GestureDetector'
import LoadingScene from './LoadingScene'
import MenuScene from './MenuScene'
import Viewer3DScene from './Viewer3DScene'
import EatherScene from './EatherScene'
import HolographicScene from './HolographicScene'
import {Scenes} from "services/util"
import "./App.css"

interface IState {
  /**
   * The current scene index.
   */
  curScene: Scenes
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
      curScene: Scenes.LOADING      
    }

    // connect the pipeline
    // input -> tracker -> gestureDetector -> scene
    // set up tracker -> gestureDetector first then
    // scene and input finally
    this.handTracker = new HandTracker()
    this.gestureDetector = new GestureDetector()
    this.handTracker.addObserver(this.gestureDetector.onResultsCallback)

    // detect whether we should go into flip mode or not based
    // on the URL passed.
    // to go into flip mode, add a `?flip` to the end of the URL
    // if screen is facing user => no flip
		this.isScreenFacingUser = window.location.href.match(/\?flip/) ? false : true
  }

  render() {
    // default scene is the loading scene 
    let scene = <LoadingScene isScreenFacingUser={this.isScreenFacingUser} gestureDetector={this.gestureDetector} loadSceneCallback={this.loadScene}/>
    if (this.state.curScene === Scenes.MENU) {
      scene = <MenuScene isScreenFacingUser={this.isScreenFacingUser} gestureDetector={this.gestureDetector} loadSceneCallback={this.loadScene}/>
    }
    else if (this.state.curScene === Scenes.VIEWER_3D) {
      scene = <Viewer3DScene isScreenFacingUser={this.isScreenFacingUser} gestureDetector={this.gestureDetector} loadSceneCallback={this.loadScene}/>
    }
    else if (this.state.curScene === Scenes.HOLOGRAPHIC) {
      scene = <HolographicScene isScreenFacingUser={this.isScreenFacingUser} gestureDetector={this.gestureDetector} loadSceneCallback={this.loadScene}/>
    }
    else if (this.state.curScene === Scenes.EATHER) {
      scene = <EatherScene isScreenFacingUser={this.isScreenFacingUser} gestureDetector={this.gestureDetector} loadSceneCallback={this.loadScene}/>
    }

    // after the input source is mounted, it will start the pipeline process
    return (
      <div className={this.isScreenFacingUser ? "App" : "flippedApp"}>
        <InputSource tracker={this.handTracker} isScreenFacingUser={this.isScreenFacingUser}/>
        {scene}
      </div>
    );
  }

  loadScene = (scene: Scenes) => {
    this.setState({curScene: scene})
  }
}

export default App;
