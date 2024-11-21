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

export default function VRMMotion({ pose, model }) {
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

  function control(key, n1, n2, c) {
    if (
      pose.landmarks[0][n1] === undefined ||
      pose.landmarks[0][n2] === undefined
    )
      return;
    const v1 = convert(pose.landmarks[0][n1]);
    const v2 = convert(pose.landmarks[0][n2]);
    const v = new THREE.Vector3(
      v2.x - v1.x,
      v2.y - v1.y,
      v2.z - v1.z
    ).normalize();
    const up = new THREE.Vector3(...c);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, v);
    //model.humanoid.getNormalizedBoneNode(key).quaternion.copy(quaternion);
    model.humanoid.getNormalizedBoneNode(key).quaternion.slerp(quaternion, 0.1);
  }
  useEffect(() => {
    if (!pose || !model || !pose.landmarks[0]) return;
    const delta = clock.getDelta();
    //console.log(up)
    controlTorso("chest", 11, 12, [-1, 0, 0]);
    controlNeckFromShouldersAndNose("neck", 11, 12, 0, [0, 0, 0]);
    control("leftUpperArm", 14, 12, [1, 0, 0]);
    control("rightUpperArm", 13, 11, [-1, 0, 0]);
    control("leftLowerArm", 16, 14, [1, 0, 0]);
    control("rightLowerArm", 15, 13, [-1, 0, 0]);
    control("leftHand", 18, 16, [0, 0, 1]);
    control("rightHand", 17, 15, [0, 0, 1]);
    //control("leftUpperLeg", 26, 24, [0, 1, 0])
    //control("rightUpperLeg", 25, 23, [0, 1, 0])
    //control("leftLowerLeg", 28, 26, [0, 1, 0])
    //control("rightLowerLeg", 27, 25, [0, 1, 0])

    model.update(delta);
    // eslint-disable-next-line
  }, [pose]);
}
