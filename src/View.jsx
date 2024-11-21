import { useRef, useState } from "react";
import VRMFileLoader from "./VRMFileLoader";
import { Canvas, useThree } from "@react-three/fiber";
import VRMMotion from "./VRMMotion";
import { Html } from "@react-three/drei";

export default function View({ model, setModel, pose, hand, cameraPos, modelURL, bgColor }) {
  const lightRef = useRef();
  const [loading, setLoading] = useState(null);
  function CameraControls() {
    const { camera } = useThree();
    camera.lookAt(cameraPos[0], cameraPos[1], 0);
    camera.zoom = cameraPos[2];
    camera.updateProjectionMatrix();
    return null;
  }
  return (
    <div>
      <VRMFileLoader setModel={setModel} modelURL={modelURL} setLoading={setLoading} />
      <Canvas
        shadows
        orthographic
        style={{ height: "100vh", width: "100vw" }}
        camera={{
          zoom: cameraPos[2],
          position: [cameraPos[0], cameraPos[1], -3],
        }}
      >
        <color attach="background" args={[bgColor]} />
        <VRMMotion model={model} pose={pose} hand={hand} />
        <CameraControls />
        <ambientLight intensity={0.5} />
        {/* <pointLight position={[4, 4, -4]} intensity={2} castShadow /> */}
        <directionalLight
          intensity={1.5}
          castShadow
          ref={lightRef}
          position={[1, 2, -1]}
          shadow-mapSize={[1024, 1024]}
        />
        {
          model ? <primitive object={model.scene} />
            : <Html
              //transform
              position={[cameraPos[0], cameraPos[1], 0]}
              center
            >
              {
                modelURL ? <div style={{
                  width: "100vw",
                  color: "black",
                  fontSize: "20px",
                  background: "#abf",
                  textAlign: "center",
                  padding: "10px",
                }}>
                  <div>モデルを読み込んでいます...</div>
                  <div>{loading}%</div>
                </div>
                  : <div style={{
                    width: "100vw",
                    background: "#faa",
                    color: "black",
                    fontSize: "20px",
                    textAlign: "center",
                    padding: "10px",
                  }}>
                    VRM形式のモデルファイルを<br />
                    ここにドラッグ＆ドロップしてください
                  </div>
              }
            </Html>
        }
      </Canvas>
    </div>
  );
}
