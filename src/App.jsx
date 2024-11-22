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
  const [hand, setHand] = useState();
  const [face, setFace] = useState();
  const [hide, setHide] = useState(false)
  const [allHide, setAllHide] = useState(false)
  const firstRef = useRef()
  const [modelURL, setModelURL] = useState("./model/sample.vrm")
  const [cameraPos, setCameraPos] = useState([0, 1.6, 500])
  const [bgColor, setBgColor] = useState("none")

  useEffect(() => {
    // qキーをおしたとき
    if (firstRef.current) return;
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'q':
          setAllHide(h => !h)
          setHide(h => !h)
          break
        default:
          break
      }
    })
    window.addEventListener("dragover", (e) => {
      e.preventDefault();
    })
    window.addEventListener("drop", (e) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length === 0) return;
      const file = files[0];
      const blob = new Blob([file], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      setModelURL(url);
    })
    firstRef.current = true
  }, [])
  return (
    <div>
      <CameraView
        detectFlag={detectFlag}
        pose={pose}
        setPose={setPose}
        hand={hand}
        setHand={setHand}
        face={face}
        setFace={setFace}
        hidden={hide}
      />
      <View
        model={model}
        setModel={setModel}
        pose={pose}
        hand={hand}
        face={face}
        cameraPos={cameraPos}
        modelURL={modelURL}
        bgColor={bgColor}
      />
      <ModelControls
        hide={hide}
        cameraPos={cameraPos}
        setCameraPos={setCameraPos}
        bgColor={bgColor}
        setBgColor={setBgColor}
      />
      <Button
        hidden={hide}
        onClick={() => setDetectFlag(!detectFlag)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
        }}
      >
        {detectFlag ? "Stop" : "Start"}
      </Button>
      <Button
        hidden={allHide}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
        }}
        onClick={() => {
          setHide(!hide);
        }}
      >
        {hide ? "表示" : "隠す"}
      </Button>
    </div>
  );
}

export default App
