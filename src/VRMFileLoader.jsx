import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { useEffect } from "react";

export default function VRMFileLoader({ setModel }) {
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register(parser => new VRMLoaderPlugin(parser));
    loader.load("model/Heine_Male_VRM.vrm", (gltf) => {
      const vrm = gltf.userData.vrm;
      VRMUtils.removeUnnecessaryVertices(vrm.scene);
      VRMUtils.removeUnnecessaryJoints(vrm.scene);
      vrm.scene.traverse((object) => {
        object.frustumCulled = false;
        if (object.isMesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      })
      setModel(vrm);
    })
  }, [setModel])
  return null;
}