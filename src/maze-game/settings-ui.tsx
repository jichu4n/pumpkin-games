import {useCallback, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import {SettingsIcon} from '../common/icons';
import {Avatars, useSettings} from './settings';

/** React component for the settings dialog. */
export function SettingsDialog({
  isShown,
  setIsShown,
  onSettingsChange,
}: {
  isShown: boolean;
  setIsShown: (isShown: boolean) => void;
  onSettingsChange: () => void;
}) {
  const {
    mazeWidth,
    setMazeWidth,
    mazeHeight,
    setMazeHeight,
    numPumpkins,
    setNumPumpkins,
    avatarKey,
    setAvatarKey,
  } = useSettings();
  const [newMazeWidth, setNewMazeWidth] = useState(mazeWidth);
  const [newMazeHeight, setNewMazeHeight] = useState(mazeHeight);
  const [newNumPumpkins, setNewNumPumpkins] = useState(numPumpkins);

  const hide = useCallback(() => setIsShown(false), [setIsShown]);
  const onDone = useCallback(() => {
    let hasSettingsChanged = false;
    if (newMazeWidth !== mazeWidth) {
      setMazeWidth(newMazeWidth);
      hasSettingsChanged = true;
    }
    if (newMazeHeight !== mazeHeight) {
      setMazeHeight(newMazeHeight);
      hasSettingsChanged = true;
    }
    if (newNumPumpkins !== numPumpkins) {
      setNumPumpkins(newNumPumpkins);
      hasSettingsChanged = true;
    }
    if (hasSettingsChanged) {
      onSettingsChange();
    }
    hide();
  }, [
    newMazeWidth,
    mazeWidth,
    newMazeHeight,
    mazeHeight,
    newNumPumpkins,
    numPumpkins,
    hide,
    setMazeWidth,
    setMazeHeight,
    setNumPumpkins,
    onSettingsChange,
  ]);

  return (
    <Modal show={isShown} onHide={hide} centered={true}>
      <Modal.Header closeButton={true}>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Avatar</Form.Label>
            <div>
              {Avatars.map(({key, label}) => (
                <Form.Check
                  key={key}
                  type="radio"
                  inline
                  label={label}
                  checked={avatarKey === key}
                  onChange={() => setAvatarKey(key)}
                />
              ))}
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Maze width</Form.Label>
            <Form.Range
              min={5}
              max={15}
              value={newMazeWidth}
              onChange={(e) => setNewMazeWidth(e.target.valueAsNumber)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Maze height</Form.Label>
            <Form.Range
              min={5}
              max={15}
              value={newMazeHeight}
              onChange={(e) => setNewMazeHeight(e.target.valueAsNumber)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Pumpkins</Form.Label>
            <Form.Range
              min={0}
              max={10}
              value={newNumPumpkins}
              onChange={(e) => setNewNumPumpkins(e.target.valueAsNumber)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onDone}>
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

/** React component for the settings button. */
export function SettingsButton({
  onSettingsChange,
  onClose,
}: {
  onSettingsChange: () => void;
  onClose: () => void;
}) {
  const [isSettingsShown, setIsSettingsShown] = useState(false);

  return (
    <>
      <div role="button" onClick={() => setIsSettingsShown(true)}>
        <SettingsIcon />
      </div>

      <SettingsDialog
        isShown={isSettingsShown}
        setIsShown={(isShown: boolean) => {
          setIsSettingsShown(isShown);
          if (!isShown) {
            onClose();
          }
        }}
        onSettingsChange={onSettingsChange}
      />
    </>
  );
}
