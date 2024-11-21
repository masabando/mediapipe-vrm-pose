import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useEffect, useRef } from "react";

export default function PoseScanner({ detectFlag, camRef, setPose }) {
  const poseLandmarker = useRef();
  const loopStop = useRef();
  useEffect(() => {
    const createPoseLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      poseLandmarker.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "poseLandmarkerModel/pose_landmarker_full.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });
    };
    createPoseLandmarker();
  }, []);

  useEffect(() => {
    if (detectFlag) {
      loop();
    } else {
      cancelAnimationFrame(loopStop.current);
    }
    // eslint-disable-next-line
  }, [detectFlag]);

  function loop() {
    let startTime = performance.now();
    poseLandmarker.current.detectForVideo(
      camRef.current.video,
      startTime,
      (result) => {
        setPose(result);
      }
    );
    loopStop.current = requestAnimationFrame(loop);
  }
}
