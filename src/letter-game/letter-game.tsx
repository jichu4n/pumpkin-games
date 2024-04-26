import {KeyboardEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import {Helmet} from 'react-helmet';
import {useElementSize} from 'usehooks-ts';
import {GameSelector} from '../common/game-selector';
import {PumpkinSprite, PumpkinSpriteProps, getRandomStyleId} from '../common/pumpkin-sprite';
import {Toolbar} from '../common/toolbar';
import {WindowTooSmallBanner} from '../common/window-too-small-banner';
import {PumpkinShelf} from './pumpkin-shelf';
import {LetterTypes, useSettings} from './settings';
import {SettingsButton} from './settings-ui';
import {WonBanner} from './won-banner';

/** State of active pumpkin on stage. */
type PumpkinState = Required<PumpkinSpriteProps> & {
  /** Timestamp when the pumpkin was first displayed on screen. */
  createTs: number;
};
/** State of "caught" pumpkins on the shelf. */
type CaughtPumpkinState = Pick<PumpkinSpriteProps, 'letter' | 'styleId'>;

/** Default size of pumpkins. */
const PUMPKIN_SIZE = 60;
/** Number of pumpkins that need to be caught to win. */
const NUM_PUMPKINS_TO_WIN = 12;
/** Minimum stage width to be able to play the game. */
const MIN_STAGE_WIDTH = 450;

/** Status of the game. */
enum GameStatus {
  /** Game is initializing. */
  INIT,
  /** Game is running. */
  PLAYING,
  /** Player has won. */
  WON,
}

/** Current state of the game. */
type GameState =
  | {status: GameStatus.INIT}
  | ({
      status: GameStatus.PLAYING;
      /** Timestamp when the pumpkin was first displayed on screen. */
      createTs: number;
      /** Pumpkins caught by the player. */
      caughtPumpkins: Array<CaughtPumpkinState>;
    } & Required<PumpkinSpriteProps>)
  | {
      status: GameStatus.WON;
      /** Pumpkins caught by the player, which continue to be displayed on the
       * won screen. */
      caughtPumpkins: Array<CaughtPumpkinState>;
    };

export function LetterGame() {
  /** The current game state. */
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.INIT,
  });

  /** The main game area element. */
  const [stageRef, {width: stageWidth, height: stageHeight}] =
    useElementSize<HTMLDivElement>();

  const {letterTypes, speed} = useSettings();
  const generateRandomLetter = useCallback((): string => {
    const letterType =
      letterTypes[Math.floor(Math.random() * letterTypes.length)];
    switch (letterType) {
      case LetterTypes.UPPERCASE:
        return String.fromCharCode(
          Math.floor(Math.random() * 26) + 'A'.charCodeAt(0)
        );
      case LetterTypes.LOWERCASE:
        return String.fromCharCode(
          Math.floor(Math.random() * 26) + 'a'.charCodeAt(0)
        );
      case LetterTypes.NUMBER:
        return `${Math.floor(Math.random() * 10)}`;
      default: {
        const exhaustiveCheck: never = letterType;
        throw new Error(
          `Unknown letter type: ${JSON.stringify(exhaustiveCheck)}`
        );
      }
    }
  }, [letterTypes]);

  /** Generates a random pumpkin state. */
  const generateNewPumpkinState = useCallback(
    (): PumpkinState => ({
      letter: generateRandomLetter(),
      styleId: getRandomStyleId(),
      x:
        Math.floor(Math.random() * (stageWidth - 4 * PUMPKIN_SIZE)) +
        2 * PUMPKIN_SIZE,
      y: 0,
      size: 0,
      createTs: performance.now(),
    }),
    [generateRandomLetter, stageWidth]
  );

  // Main game loop.
  useEffect(() => {
    switch (gameState.status) {
      case GameStatus.INIT: {
        if (stageWidth > MIN_STAGE_WIDTH && stageHeight > 0) {
          setGameState({
            status: GameStatus.PLAYING,
            ...generateNewPumpkinState(),
            caughtPumpkins: [],
          });
        }
        return;
      }
      case GameStatus.PLAYING: {
        // If game state is PLAYING, run the main game loop.
        let frameId: number;
        const nextFrame = (ts: number) => {
          const y = Math.round(((ts - gameState.createTs) * speed * 2) / 100);
          // Don't re-render if the pumpkin hasn't moved.
          if (y !== gameState.y) {
            const {x} = gameState;
            const size = Math.round(PUMPKIN_SIZE * (y * 0.006));
            let nextGameState: GameState;
            if (x + size < 0 || x >= stageWidth || y >= stageHeight) {
              nextGameState = {
                ...gameState,
                ...generateNewPumpkinState(),
              };
            } else {
              nextGameState = {
                ...gameState,
                y,
                size,
              };
            }
            setGameState(nextGameState);
          }
          frameId = requestAnimationFrame(nextFrame);
        };
        frameId = requestAnimationFrame(nextFrame);
        return () => cancelAnimationFrame(frameId);
      }
      case GameStatus.WON:
        // If the game is already won, nothing to do.
        return;
      default: {
        const exhaustiveCheck: never = gameState;
        throw new Error(
          `Unknown game state: ${JSON.stringify(exhaustiveCheck)}`
        );
      }
    }
  }, [gameState, stageWidth, stageHeight, speed, generateNewPumpkinState]);

  // Sound effects.
  const soundEffects = useMemo(
    () => ({
      CAUGHT_PUMPKIN: new Audio('./tada.mp3'),
      WON: new Audio('./success.mp3'),
      WRONG_KEY: new Audio('./wrong.mp3'),
    }),
    []
  );

  // Keyboard handler.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    console.log(`onKeyDown: ${e.key}`);

    switch (gameState.status) {
      case GameStatus.INIT:
        // Do nothing
        break;
      case GameStatus.PLAYING: {
        let soundEffect: HTMLAudioElement;
        if (e.key.toUpperCase() === gameState.letter.toUpperCase()) {
          const caughtPumpkins = [
            ...gameState.caughtPumpkins,
            {
              letter: gameState.letter,
              styleId: gameState.styleId,
            },
          ];
          if (gameState.caughtPumpkins.length === NUM_PUMPKINS_TO_WIN - 1) {
            soundEffect = soundEffects.WON;
            setGameState({
              status: GameStatus.WON,
              caughtPumpkins,
            });
          } else {
            soundEffect = soundEffects.CAUGHT_PUMPKIN;
            setGameState({
              ...gameState,
              ...generateNewPumpkinState(),
              caughtPumpkins,
            });
          }
        } else {
          soundEffect = soundEffects.WRONG_KEY;
        }
        soundEffect.load();
        soundEffect.play().then(
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          () => {},
          (e) => {
            console.error(e);
          }
        );
        break;
      }
      case GameStatus.WON: {
        if (e.key === ' ') {
          setGameState({status: GameStatus.INIT});
        }
        break;
      }
      default: {
        const exhaustiveCheck: never = gameState;
        throw new Error(
          `Unknown game state: ${JSON.stringify(exhaustiveCheck)}`
        );
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Pumpkin Letter Game</title>
      </Helmet>

      <Container
        className="w-100 mw-100 h-100 p-0 m-0"
        tabIndex={0}
        ref={(el: HTMLDivElement) => el?.focus()}
        onKeyDown={onKeyDown}
      >
        <Row className="h-100 g-0">
          <Col className="d-none d-md-block"></Col>
          <Col
            ref={stageRef}
            xs={10}
            sm={8}
            md={6}
            className="h-100 overflow-hidden"
            style={{
              borderLeft: '4px solid var(--primary-color)',
              borderRight: '4px solid var(--primary-color)',
            }}
          >
            {gameState.status === GameStatus.PLAYING && (
              <PumpkinSprite
                letter={gameState.letter}
                styleId={gameState.styleId}
                x={gameState.x - gameState.size / 2}
                y={gameState.y}
                size={gameState.size}
              />
            )}
            {gameState.status === GameStatus.WON && <WonBanner />}
          </Col>
          <Col xs={2} sm={4} md={3} className="d-flex justify-content-center">
            {(gameState.status === GameStatus.PLAYING ||
              gameState.status === GameStatus.WON) && (
              <PumpkinShelf
                pumpkins={gameState.caughtPumpkins.map((pumpkin) => ({
                  ...pumpkin,
                  size: PUMPKIN_SIZE,
                }))}
              />
            )}
          </Col>
        </Row>
      </Container>

      {gameState.status === GameStatus.INIT &&
        stageWidth > 0 &&
        stageWidth < MIN_STAGE_WIDTH && <WindowTooSmallBanner />}

      <Toolbar>
        <SettingsButton />
        <GameSelector />
      </Toolbar>
    </>
  );
}
