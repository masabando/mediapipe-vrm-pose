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

export default function VRMMotion({ pose, hand, model }) {
  const { clock } = useThree();
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
    if (
      p[n1] === undefined ||
      p[n2] === undefined
    )
      return;
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
    model.humanoid.getNormalizedBoneNode(key).quaternion.slerp(quaternion, factor);
  }
  
  useEffect(() => {
    if (!pose || !model || !pose.landmarks[0]) return;
    const delta = clock.getDelta();
    //console.log(up)
    controlTorso("chest", 11, 12, [-1, 0, 0]);
    controlNeckFromShouldersAndNose("neck", 11, 12, 0, [0, 0, 0]);

    const p = pose.landmarks[0];
    control("leftUpperArm", p, 14, 12, [1, 0, 0]);
    control("rightUpperArm", p, 13, 11, [-1, 0, 0]);
    control("leftLowerArm", p, 16, 14, [1, 0, 0]);
    control("rightLowerArm", p, 15, 13, [-1, 0, 0]);
    control("leftHand", p, 18, 16, [0, 0, 1]);
    control("rightHand", p, 17, 15, [0, 0, 1]);

    let idx;
    let f = 0.5;
    let a = [0, 0, -1]
    idx = hand.handedness.findIndex(x => x[0].categoryName === "Left")
    if (idx >= 0) {
      let h = hand.landmarks[idx];
      controlHand("leftThumbDistal", h, 4, 3, a, f);
      controlHand("leftThumbMetacarpal", h, 3, 2, a, f);
      controlHand("leftIndexDistal", h, 8, 7, a, f);
      controlHand("leftIndexIntermediate", h, 7, 6, a, f);
      controlHand("leftMiddleDistal", h, 12, 11, a, f);
      controlHand("leftMiddleIntermediate", h, 11, 10, a, f);
      controlHand("leftRingDistal", h, 16, 15, a, f);
      controlHand("leftRingIntermediate", h, 15, 14, a, f);
      controlHand("leftLittleDistal", h, 20, 19, a, f);
      controlHand("leftLittleIntermediate", h, 19, 18, a, f);
    }
    idx = hand.handedness.findIndex(x => x[0].categoryName === "Right")
    if (idx >= 0) {
      let h = hand.landmarks[idx];
      control("rightThumbDistal", h, 3, 4, [0, 0, -1]);
      control("rightThumbMetacarpal", h, 2, 3, [0, 0, -1]);
    }

    model.update(delta);
    // eslint-disable-next-line
  }, [pose]);
}
