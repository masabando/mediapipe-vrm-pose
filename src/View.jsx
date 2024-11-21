import { useRef } from "react";
import VRMFileLoader from "./VRMFileLoader";
import { Canvas, useThree } from "@react-three/fiber";
import VRMMotion from "./VRMMotion";

export default function View({ model, setModel, pose, cameraPos }) {
  const lightRef = useRef();
  function CameraControls() {
    const { camera } = useThree();
    camera.lookAt(cameraPos[0], cameraPos[1], 0);
    return null;
  }
  return (
    <div>
      <VRMFileLoader setModel={setModel} />
      <Canvas
        shadows
        orthographic
        style={{ height: "100vh", width: "100vw" }}
        camera={{
          zoom: 500,
          position: cameraPos,
        }}
      >
        <VRMMotion model={model} pose={pose} />
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
        {model && <primitive object={model.scene} />}
      </Canvas>
    </div>
  );
}
