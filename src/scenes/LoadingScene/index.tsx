import "./index.css"
import React from "react"
import { SceneProps } from "react-app-env"

export default class LoadingScene extends React.Component<SceneProps> {
  constructor(props: SceneProps) {
    super(props)

    // don't need to detect any gesture. The moment the pipeline is active
    // we remove the loading scene
    this.props.gestureDetector.addObserver(this.removeScene)
  }

  render() {
    return (
      <div className='loadingScreen'>
        <span className='loadingUI'>
          <div className='spinner'> </div>
          <div className="spinnerText">LOADING</div>
        </span>
      </div>
    )
  }

  componentWillUnmount() {
		this.props.gestureDetector.removeObserver(this.removeScene)
  }

  removeScene = () => {
    this.props.loadSceneCallback("MENU")
  }
}