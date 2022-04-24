import style from "./index.module.css"
import React  from "react"
import { SceneProps } from "react-app-env"
// @ts-ignore
import video from "assets/video/HolographicShowMusic.mp4"

const removeKeyName = "loadRemove"

export default class HolographicScene extends React.Component<SceneProps> {
  /**
   * The video element in the scene.
   */
  video: React.RefObject<HTMLVideoElement>

  constructor(props: SceneProps) {
    super(props)

    this.video = React.createRef()
    // don't need to detect any gesture. The moment the pipeline is active
    // we remove the loading scene
    // this.props.gestureDetector.addObserver(this.removeScene, removeKeyName)
  }

  render() {
    return (
      <video src={video} className={style.video} onEnded={this.replay} ref={this.video}/>
    )
  }

  componentDidMount() {
    setTimeout(
      () => this.video.current.play(),
      1500) // wait time before starting to play
    
  }

  componentWillUnmount() {
		this.props.gestureDetector.removeObserver(removeKeyName)
  }

  /**
   * Wait a little bit then replay the video.
   */
  replay = () => {
    setTimeout(() => {
      this.video.current.currentTime = 0
      this.video.current.play()
    }, 2500) // wait time before replay
  }

}