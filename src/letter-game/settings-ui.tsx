import {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import {LetterTypes, useSettings} from './settings';

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
      <div
        className="position-fixed top-0 end-0 p-2 ps-4 pb-4"
        role="button"
        onClick={() => setIsSettingsShown(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="#ff6f00"
          className="bi bi-gear-fill"
          viewBox="0 0 16 16"
        >
          <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
        </svg>
      </div>

      <SettingsDialog
        isShown={isSettingsShown}
        setIsShown={setIsSettingsShown}
      />
    </>
  );
}
