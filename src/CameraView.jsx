import { useEffect, useRef } from "react";
import Webcam from "react-webcam";
import styles from "./CameraView.module.scss";
import PoseScanner from "./PoseScanner";
import { DrawingUtils, PoseLandmarker } from "@mediapipe/tasks-vision";

export default function CameraView({ detectFlag, pose, setPose, hidden }) {
  const refs = {
    canvas: useRef(null),
    ctx: useRef(null),
    camera: useRef(null),
    drawingUtils: useRef(),
  };
  useEffect(() => {
    refs.ctx.current = refs.canvas.current.getContext("2d");
    refs.drawingUtils.current = new DrawingUtils(refs.ctx.current);
  });
  useEffect(() => {
    if (!pose) return;
    refs.canvas.current.width = refs.camera.current.video.videoWidth;
    refs.canvas.current.height = refs.camera.current.video.videoHeight;
    refs.ctx.current.clearRect(
      0,
      0,
      refs.canvas.current.width,
      refs.canvas.current.height
    );
    for (const landmark of pose?.landmarks || []) {
      refs.drawingUtils.current.drawLandmarks(landmark, {
        radius: 7, //d => DrawingUtils.lerp(d.from.z, -0.15, 0.1, 5, 1),
        color: "blue",
      });
      refs.drawingUtils.current.drawConnectors(
        landmark,
        PoseLandmarker.POSE_CONNECTIONS,
        { color: "#00FF00", lineWidth: 6 }
      );
    }
    // eslint-disable-next-line
  }, [pose]);
  return (
    <div className={styles.poseScannerContainer} hidden={hidden}>
      <Webcam ref={refs.camera} mirrored className={styles.webcam} />
      <canvas ref={refs.canvas} className={styles.canvas} />
      <PoseScanner
        detectFlag={detectFlag}
        camRef={refs.camera}
        setPose={setPose}
      />
    </div>
  );
}
