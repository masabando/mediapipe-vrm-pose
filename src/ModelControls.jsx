import Form from 'react-bootstrap/Form';
import styles from './ModelControls.module.scss';

export default function ModelControls({ hide, cameraPos, setCameraPos }) {
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
          min={-3}
          max={3}
          step={0.01}
          defaultValue={cameraPos[0]}
          onChange={(e) =>
            setCameraPos([cameraPos[0], cameraPos[1], e.target.value])
          }
        />
      </div>
    </div>
  );
}