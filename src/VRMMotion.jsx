import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

function convert(l) {
  return {
    x: l.x * 2 - 1,
    y: -(l.y * 2 - 1),
    z: l.z,
  };
}

export default function VRMMotion({ pose, hand, face, model }) {
  const { clock } = useThree();
  function controlFinger(key, p, n1, n2, n3, factor) {
    if (p[n1] === undefined || p[n2] === undefined || p[n3] === undefined)
      return;
    const v1 = convert(p[n1]);
    const v2 = convert(p[n2]);
    const v3 = convert(p[n3]);
    const va = new THREE.Vector3(
      v3.x - v2.x,
      v3.y - v2.y,
      v3.z - v2.z
    ).normalize();
    const vb = new THREE.Vector3(
      v2.x - v1.x,
      v2.y - v1.y,
      v2.z - v1.z
    ).normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(va, vb);

    model.humanoid
      .getNormalizedBoneNode(key)
      .quaternion.slerp(quaternion, factor);
  }

  function controlNeckFromShouldersAndNose(
    key,
    shoulderLeft,
    shoulderRight,
    noseIndex,
    offset = [0, 0, 0]
  ) {
    if (
      pose.landmarks[0][shoulderLeft] === undefined ||
      pose.landmarks[0][shoulderRight] === undefined ||
      pose.landmarks[0][noseIndex] === undefined
    )
      return;

    const leftShoulder = convert(pose.landmarks[0][shoulderLeft]);
    const rightShoulder = convert(pose.landmarks[0][shoulderRight]);
    const nose = convert(pose.landmarks[0][noseIndex]);

    // 両肩の中点を計算
    const neckBase = new THREE.Vector3(
      (leftShoulder.x + rightShoulder.x) / 2,
      (leftShoulder.y + rightShoulder.y) / 2,
      (leftShoulder.z + rightShoulder.z) / 2
    );

    // 胸の回転を基準に動的な「上方向ベクトル」を計算
    const chestBone = model.humanoid.getNormalizedBoneNode("chest");
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(chestBone.quaternion);

    // 肩の方向ベクトルを計算
    const shoulderDirection = new THREE.Vector3(
      rightShoulder.x - leftShoulder.x,
      rightShoulder.y - leftShoulder.y,
      rightShoulder.z - leftShoulder.z
    ).normalize();

    // 肩の方向に垂直な平面の法線を計算
    const planeNormal = shoulderDirection.clone().cross(up).normalize();

    // 鼻の方向ベクトルを肩平面上に投影
    const noseDirection = new THREE.Vector3(
      nose.x - neckBase.x,
      nose.y - neckBase.y,
      nose.z - neckBase.z
    ).normalize();
    const projectedNoseDirection = noseDirection
      .clone()
      .projectOnPlane(planeNormal)
      .normalize();

    // 回転を計算
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      up,
      projectedNoseDirection
    );

    // 初期オフセットを適用
    const offsetQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(...offset)
    );
    quaternion.multiply(offsetQuaternion);

    // 首ボーンに適用
    model.humanoid.getNormalizedBoneNode(key).quaternion.slerp(quaternion, 0.1);
  }
  function controlTorso(
    key,
    shoulderLeft,
    shoulderRight,
    upVector = [0, 0, 1]
  ) {
    if (
      pose.landmarks[0][shoulderLeft] === undefined ||
      pose.landmarks[0][shoulderRight] === undefined
    )
      return;
    const leftShoulder = convert(pose.landmarks[0][shoulderLeft]);
    const rightShoulder = convert(pose.landmarks[0][shoulderRight]);
    const shoulderDirection = new THREE.Vector3(
      rightShoulder.x - leftShoulder.x,
      rightShoulder.y - leftShoulder.y,
      rightShoulder.z - leftShoulder.z
    ).normalize();
    const up = new THREE.Vector3(...upVector);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      up,
      shoulderDirection
    );
    model.humanoid.getNormalizedBoneNode(key).quaternion.slerp(quaternion, 0.1);
  }

  function control(key, p, n1, n2, c, factor = 0.3) {
    if (p[n1] === undefined || p[n2] === undefined) return;
    const v1 = convert(p[n1]);
    const v2 = convert(p[n2]);
    const v = new THREE.Vector3(
      v2.x - v1.x,
      v2.y - v1.y,
      v2.z - v1.z
    ).normalize();
    const up = new THREE.Vector3(...c);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, v);
    //model.humanoid.getNormalizedBoneNode(key).quaternion.copy(quaternion);
    model.humanoid
      .getNormalizedBoneNode(key)
      .quaternion.slerp(quaternion, factor);
  }

  function calculateMouthOpen(faceLandmarks) {
    if (!faceLandmarks) return 0;

    // 上唇と下唇のランドマーク（例: 13と14）
    const upperLip = faceLandmarks[13];
    const lowerLip = faceLandmarks[14];

    if (!upperLip || !lowerLip) return 0;

    // 距離を計算
    const distance = Math.sqrt(
      Math.pow(lowerLip.x - upperLip.x, 2) +
        Math.pow(lowerLip.y - upperLip.y, 2) +
        Math.pow(lowerLip.z - upperLip.z, 2)
    );

    // 正規化（適宜調整）
    const maxDistance = 0.05; // 開いた状態の最大値
    const normalizedValue = Math.min(distance / maxDistance, 1);

    return normalizedValue;
  }

  function calculateEyeOpen(
    faceLandmarks,
    upperLidIndex,
    lowerLidIndex,
    leftCornerIndex,
    rightCornerIndex,
    threshold = 0.1
  ) {
    if (
      !faceLandmarks ||
      !faceLandmarks[upperLidIndex] ||
      !faceLandmarks[lowerLidIndex] ||
      !faceLandmarks[leftCornerIndex] ||
      !faceLandmarks[rightCornerIndex]
    ) {
      return 1; // デフォルトで目を開いている状態
    }

    // 上まぶたと下まぶたの距離
    const upperLid = faceLandmarks[upperLidIndex];
    const lowerLid = faceLandmarks[lowerLidIndex];
    const lidDistance = Math.sqrt(
      Math.pow(lowerLid.x - upperLid.x, 2) +
        Math.pow(lowerLid.y - upperLid.y, 2) +
        Math.pow(lowerLid.z - upperLid.z, 2)
    );

    // 目の横幅
    const leftCorner = faceLandmarks[leftCornerIndex];
    const rightCorner = faceLandmarks[rightCornerIndex];
    const eyeWidth = Math.sqrt(
      Math.pow(rightCorner.x - leftCorner.x, 2) +
        Math.pow(rightCorner.y - leftCorner.y, 2) +
        Math.pow(rightCorner.z - leftCorner.z, 2)
    );

    // 距離を横幅で正規化
    const normalizedValue = lidDistance * 2 / eyeWidth;

    // 閾値を考慮して開閉具合を計算
    if (normalizedValue <= threshold) {
      return 1; // 完全に閉じている
    }

    return 1 - Math.min(normalizedValue, 1); // 目が閉じるほど値が1に近づく
  }
  useEffect(() => {
    if (!pose || !model || !pose.landmarks[0]) return;
    const delta = clock.getDelta();
    controlTorso("chest", 11, 12, [-1, 0, 0]);
    controlNeckFromShouldersAndNose("neck", 11, 12, 0, [0, 0, 0]);

    const p = pose.landmarks[0];
    control("leftUpperArm", p, 14, 12, [1, 0, 0]);
    control("rightUpperArm", p, 13, 11, [-1, 0, 0]);
    control("leftLowerArm", p, 16, 14, [1, 0, 0]);
    control("rightLowerArm", p, 15, 13, [-1, 0, 0]);
    control("leftHand", p, 18, 16, [0, 0, 1]);
    control("rightHand", p, 17, 15, [0, 0, 1]);

    let factor = 0.8;
    let idx, h;
    // 左手の制御
    idx = hand.handedness.findIndex((x) => x[0].categoryName === "Left");
    if (idx >= 0) {
      h = hand.landmarks[idx];
      controlFinger("leftIndexIntermediate", h, 5, 6, 7, factor);
      controlFinger("leftIndexDistal", h, 6, 7, 8, factor);
      controlFinger("leftMiddleIntermediate", h, 9, 10, 11, factor);
      controlFinger("leftMiddleDistal", h, 10, 11, 12, factor);
      controlFinger("leftRingIntermediate", h, 13, 14, 15, factor);
      controlFinger("leftRingDistal", h, 14, 15, 16, factor);
      controlFinger("leftLittleIntermediate", h, 17, 18, 19, factor);
      controlFinger("leftLittleDistal", h, 18, 19, 20, factor);
    }
    // 右手の制御
    idx = hand.handedness.findIndex((x) => x[0].categoryName === "Right");
    if (idx >= 0) {
      h = hand.landmarks[idx];
      controlFinger("rightIndexIntermediate", h, 5, 6, 7, factor);
      controlFinger("rightIndexDistal", h, 6, 7, 8, factor);
      controlFinger("rightMiddleIntermediate", h, 9, 10, 11, factor);
      controlFinger("rightMiddleDistal", h, 10, 11, 12, factor);
      controlFinger("rightRingIntermediate", h, 13, 14, 15, factor);
      controlFinger("rightRingDistal", h, 14, 15, 16, factor);
      controlFinger("rightLittleIntermediate", h, 17, 18, 19, factor);
      controlFinger("rightLittleDistal", h, 18, 19, 20, factor);
    }

    // 顔の制御
    // 口
    const mouthOpen = calculateMouthOpen(face.faceLandmarks[0]);
    if (model.expressionManager) {
      model.expressionManager.setValue("aa", mouthOpen);
    }
    // 目
    const leftEyeOpen = calculateEyeOpen(face.faceLandmarks[0], 159, 145, 33, 133, 0.2);
    const rightEyeOpen = calculateEyeOpen(face.faceLandmarks[0], 386, 374, 362, 263, 0.2);
    if (model.expressionManager) {
      model.expressionManager.setValue("blinkLeft", leftEyeOpen);
      model.expressionManager.setValue("blinkRight", rightEyeOpen);
    }

    model.update(delta);
    // eslint-disable-next-line
  }, [pose]);
}
