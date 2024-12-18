# mediapipe-vrm-pose

![screenshot](screenshot.jpg)

任意のVRMモデルを、Webカメラで写した自身の姿勢に合わせて動かせるWebページです。

上半身の姿勢、顔(目と口)、指の動きに対応しています。

姿勢・顔・指の検出にはGoogleの
[MediaPipe](https://mediapipe-studio.webapps.google.com/home)
を使用しています。

VRMモデルの表示と姿勢の反映には
[@pixiv/three-vrm](https://github.com/pixiv/three-vrm)
を使用しています。

## アプリ版
[vrm-pose-app](https://github.com/masabando/vrm-pose-app)

アプリ版はPCで利用できます。  
背景を透過して、PC画面を見せつつVTuber的な配信ができます。

## 使い方
### デモページ
[デモページ](https://masabando.github.io/mediapipe-vrm-pose/)

### VRMモデルの変更
デフォルトのモデルからVRMモデルを変更する場合は、
任意のVRMモデルファイルを画面にドラッグ&ドロップしてください。

モデルファイルはクライアント側でのみ使用されるため、
**VRMファイルがサーバーにアップロードされることはありません** 。

### 検出の開始
画面左下の「Start」ボタンをクリックしてください。

カメラ映像はクライアント側でのみ使用されるため、
**カメラ映像がサーバーに送信されることはありません** 。

### UIの表示/非表示
画面右下の「隠す」ボタンで、UIの表示/非表示を切り替えることができます。

キーボードの `Q` キーを押すことで、「隠す」ボタンも含めてUIを非表示にすることができます。

