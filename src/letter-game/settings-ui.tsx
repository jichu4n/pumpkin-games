import {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import {LetterTypes, useSettings} from './settings';
import {SettingsIcon} from '../common/icons';

/** React component for the settings dialog. */
export function SettingsDialog({
  isShown,
  setIsShown,
}: {
  isShown: boolean;
  setIsShown: (isShown: boolean) => void;
}) {
  const {
    isLetterTypeEnabled,
    toggleLetterType,
    canToggleLetterType,
    speed,
    setSpeed,
  } = useSettings();

  const hide = () => setIsShown(false);

  return (
    <Modal show={isShown} onHide={hide} centered={true}>
      <Modal.Header closeButton={true}>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Letter types</Form.Label>
            <Form.Check
              type="checkbox"
              label="Uppercase letters"
              checked={isLetterTypeEnabled(LetterTypes.UPPERCASE)}
              disabled={!canToggleLetterType(LetterTypes.UPPERCASE)}
              onChange={() => toggleLetterType(LetterTypes.UPPERCASE)}
            />
            <Form.Check
              type="checkbox"
              label="Lowercase letters"
              checked={isLetterTypeEnabled(LetterTypes.LOWERCASE)}
              disabled={!canToggleLetterType(LetterTypes.LOWERCASE)}
              onChange={() => toggleLetterType(LetterTypes.LOWERCASE)}
            />
            <Form.Check
              type="checkbox"
              label="Numbers"
              checked={isLetterTypeEnabled(LetterTypes.NUMBER)}
              disabled={!canToggleLetterType(LetterTypes.NUMBER)}
              onChange={() => toggleLetterType(LetterTypes.NUMBER)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Game speed</Form.Label>
            <Form.Range
              min={1}
              max={15}
              value={speed}
              onChange={(e) => setSpeed(e.target.valueAsNumber)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={hide}>
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

/** React component for the settings button. */
export function SettingsButton() {
  const [isSettingsShown, setIsSettingsShown] = useState(false);

  return (
    <>
      <div role="button" onClick={() => setIsSettingsShown(true)}>
        <SettingsIcon />
      </div>

      <SettingsDialog
        isShown={isSettingsShown}
        setIsShown={setIsSettingsShown}
      />
    </>
  );
}
