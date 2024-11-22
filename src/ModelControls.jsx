import Form from 'react-bootstrap/Form';
import styles from './ModelControls.module.scss';

export default function ModelControls({ hide, cameraPos, setCameraPos, bgColor, setBgColor }) {
  return (
    <div hidden={hide} className={`${styles.modelControls} p-2`}>
      <Form.Label>Camera Position</Form.Label>
      <div className="d-flex">
        <div className="text-nowrap me-2">x</div>
        <Form.Range
          min={-3}
          max={3}
          step={0.01}
          defaultValue={cameraPos[0]}
          onChange={(e) =>
            setCameraPos([e.target.value, cameraPos[1], cameraPos[2]])
          }
        />
      </div>
      <div className="d-flex">
        <div className="text-nowrap me-2">y</div>
        <Form.Range
          min={-3}
          max={3}
          step={0.01}
          defaultValue={cameraPos[1]}
          onChange={(e) =>
            setCameraPos([cameraPos[0], e.target.value, cameraPos[2]])
          }
        />
      </div>
      <div className="d-flex">
        <div className="text-nowrap me-2">z</div>
        <Form.Range
          min={300}
          max={1800}
          step={10}
          defaultValue={cameraPos[2]}
          onChange={(e) =>
            setCameraPos([cameraPos[0], cameraPos[1], e.target.value])
          }
        />
      </div>
      <Form.Label>背景</Form.Label>
      <Form.Select
        onChange={(e) => setBgColor(e.target.value)}
        defaultValue={bgColor}
      >
        <option value="none">透過(Appのみ)</option>
        <option value="#fff">白</option>
        <option value="#000">黒</option>
        <option value="#888">グレー</option>
        <option value="#0f0">緑</option>
      </Form.Select>
      <div className="text-center" style={{ fontSize: "80%" }}>
        PCの場合ドラッグ＆ドロップでモデルを読み込めます
      </div>
    </div>
  );
}