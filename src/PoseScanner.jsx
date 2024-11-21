import { PoseLandmarker, HandLandmarker, FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useEffect, useRef } from "react";

export default function PoseScanner({ detectFlag, camRef, setPose, setHand, setFace }) {
  const poseLandmarker = useRef();
  const handLandmarker = useRef();
  const faceLandmarker = useRef();
  const loopStop = useRef();
  useEffect(() => {
    const createPoseLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      poseLandmarker.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "landmarkerModel/pose_landmarker_full.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });
      handLandmarker.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "landmarkerModel/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });
      faceLandmarker.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "landmarkerModel/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
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
    const _hand = handLandmarker.current.detectForVideo(
      camRef.current.video,
      startTime
    );
    setHand(_hand);
    const _face = faceLandmarker.current.detectForVideo(
      camRef.current.video,
      startTime
    );
    setFace(_face);
    loopStop.current = requestAnimationFrame(loop);
  }
}
