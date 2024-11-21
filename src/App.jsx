import './App.scss'
import View from './View'
import CameraView from './CameraView'
import { useEffect, useRef, useState } from 'react'
import Button from 'react-bootstrap/Button'
import ModelControls from './ModelControls'

function App() {
  const [model, setModel] = useState(null)
  const [detectFlag, setDetectFlag] = useState(false)
  const [pose, setPose] = useState();
  const [hide, setHide] = useState(false)
  const listenerRef = useRef()
  const [cameraPos, setCameraPos] = useState([0, 1.6, -3])

  useEffect(() => {
    // qキーをおしたとき
    if (listenerRef.current) return;
    listenerRef.current = document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'q':
          setHide(h => !h)
          break
        default:
          break
      }
    })
    // eslint-disable-next-line
  }, [])
  return (
    <div>
      <CameraView
        detectFlag={detectFlag} pose={pose} setPose={setPose}
        hidden={hide}
      />
      <View model={model} setModel={setModel} pose={pose} cameraPos={cameraPos} />
      <ModelControls hide={hide} cameraPos={cameraPos} setCameraPos={setCameraPos} />
      <Button
        hidden={hide}
        onClick={() => setDetectFlag(!detectFlag)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
        }}
      >
        {detectFlag ? 'Stop' : 'Start'}
      </Button>
    </div>
  )
}

export default App
