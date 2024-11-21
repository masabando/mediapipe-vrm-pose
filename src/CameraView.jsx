import { useEffect, useRef } from "react";
import Webcam from "react-webcam";
import styles from "./CameraView.module.scss";
import PoseScanner from "./PoseScanner";
import { DrawingUtils, PoseLandmarker, HandLandmarker } from "@mediapipe/tasks-vision";

export default function CameraView({
  detectFlag, pose, setPose, hand, setHand, hidden
}) {
  const refs = {
    canvas: useRef(null),
    ctx: useRef(null),
    camera: useRef(null),
    drawingUtils: useRef(),
  };
  useEffect(() => {
    refs.ctx.current = refs.canvas.current.getContext("2d");
    refs.drawingUtils.current = new DrawingUtils(refs.ctx.current);
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    if (!pose || hidden) return;
    refs.canvas.current.width = refs.camera.current.video.videoWidth;
    refs.canvas.current.height = refs.camera.current.video.videoHeight;
    refs.ctx.current.clearRect(
      0,
      0,
      refs.canvas.current.width,
      refs.canvas.current.height
    );
    for (const landmark of pose?.landmarks || []) {
      refs.drawingUtils.current.drawConnectors(
        landmark.map((d, i) => (
          [
            ...Array(11).fill(0).map((_, i) => i),
            ...Array(6).fill(0).map((_, i) => i + 17),
          ].includes(i) ? null : d)
        ),
        PoseLandmarker.POSE_CONNECTIONS,
        { color: "#aaffaa", lineWidth: 6 }
      );
      refs.drawingUtils.current.drawLandmarks(
        [
          ...landmark.slice(0, 17),
          ...landmark.slice(23)
        ].slice(11),
        {
          radius: 9, //d => DrawingUtils.lerp(d.from.z, -0.15, 0.1, 5, 1),
          fillColor: "#00ff00",
          lineWidth: 0,
        });
    }
    // eslint-disable-next-line
  }, [pose]);
  useEffect(() => {
    if (!hand || hidden) return;
    for (const handLandmark of hand?.landmarks || []) {
      refs.drawingUtils.current.drawConnectors(
        handLandmark,
        HandLandmarker.HAND_CONNECTIONS,
        { color: "#ffaaaa", lineWidth: 6 }
      );
      refs.drawingUtils.current.drawLandmarks(handLandmark, {
        radius: 7,
        color: "#ff0000",
      });
    }
    // eslint-disable-next-line
  }, [hand]);
  return (
    <div className={styles.poseScannerContainer} hidden={hidden}>
      <Webcam ref={refs.camera} mirrored className={styles.webcam} />
      <canvas ref={refs.canvas} className={styles.canvas} />
      <PoseScanner
        detectFlag={detectFlag}
        camRef={refs.camera}
        setPose={setPose}
        setHand={setHand}
      />
    </div>
  );
}
