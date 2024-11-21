import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { useEffect } from "react";
import { notification } from "antd";

export default function VRMFileLoader({ setModel, modelURL, setLoading }) {
  const [api, contextHolder] = notification.useNotification();
  useEffect(() => {
    if (!modelURL) return;
    const loader = new GLTFLoader();
    loader.register(parser => new VRMLoaderPlugin(parser));
    loader.load(modelURL, (gltf) => {
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
      api.success({
        message: "モデルの読み込みに成功しました",
        duration: 2
      });
    },
      (xhr) => {
        setLoading(xhr.loaded / xhr.total * 100);
      },
      (error) => {
        api.error({
          message: "モデルの読み込みに失敗しました",
          description: error.message,
          duration: 2
        });
      }
    )
    // eslint-disable-next-line
  }, [modelURL, setModel])
  return (
    <>
      {contextHolder}
    </>
  );
}