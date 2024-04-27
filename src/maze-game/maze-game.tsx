import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import {Helmet} from 'react-helmet';
import {useResizeObserver} from 'usehooks-ts';
import {GameSelector} from '../common/game-selector';
import {DEFAULT_WAIT_MS, Throttler} from '../common/throttler';
import {Toolbar} from '../common/toolbar';
import {WindowTooSmallBanner} from '../common/window-too-small-banner';
import {Maze, generateMaze} from './maze';

/** Minimum stage width to be able to play the game. */
const MIN_STAGE_WIDTH = 650;

/** Status of the game. */
enum GameStatus {
  /** Game is initializing. */
  INIT,
  /** Game is running. */
  PLAYING,
  /** Player has won. */
  WON,
}

const MAZE_WIDTH = 10;
const MAZE_HEIGHT = 8;
const CELL_SIZE = 65;
const WALL_COLOR = '#606060';
const WALL_WIDTH = 3;
const WALL_STYLE = `${WALL_WIDTH}px solid ${WALL_COLOR}`;

/** Current state of the game. */
type GameState =
  | {status: GameStatus.INIT}
  | {status: GameStatus.PLAYING; maze: Maze}
  | {status: GameStatus.WON};

export function MazeGame() {
  /** The current game state. */
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.INIT,
  });

  /** The main game area element. */
  const stageRef = useRef<HTMLDivElement | null>(null);
  const {width: stageWidth = 0, height: stageHeight = 0} = useResizeObserver({
    ref: stageRef,
  });

  // Main game loop.
  useEffect(() => {
    switch (gameState.status) {
      case GameStatus.INIT: {
        console.log('Init!');
        if (stageWidth > MIN_STAGE_WIDTH && stageHeight > 0) {
          console.log('set state');
          setGameState({
            status: GameStatus.PLAYING,
            maze: generateMaze(MAZE_WIDTH, MAZE_HEIGHT),
          });
        }
        return;
      }
      case GameStatus.PLAYING: {
        console.log('Playing!');
        return;
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
  }, [gameState, stageWidth, stageHeight]);

  // Sound effects.
  const soundEffects = useMemo(() => {
    const soundEffects = {
      CAUGHT_PUMPKIN: new Audio('./tada.mp3'),
      WON: new Audio('./success.mp3'),
    };
    for (const soundEffect of Object.values(soundEffects)) {
      soundEffect.load();
    }
    return soundEffects;
  }, []);

  // Throttler for keyboard handler.
  const throttlerRef = useRef(
    new Throttler({
      waitMs: DEFAULT_WAIT_MS * 2,
    })
  );

  // Keyboard handler.
  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!throttlerRef.current.shouldProceed(e.key)) {
        return;
      }

      switch (gameState.status) {
        case GameStatus.INIT:
          // Do nothing
          break;
        case GameStatus.PLAYING: {
          const soundEffect: HTMLAudioElement = soundEffects.WON;
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
    },
    [gameState, soundEffects]
  );

  return (
    <>
      <Helmet>
        <title>Pumpkin Maze Game</title>
      </Helmet>

      <Container
        className="w-100 mw-100 h-100 p-0 m-0"
        tabIndex={0}
        ref={(el: HTMLDivElement) => el?.focus()}
        onKeyDown={onKeyDown}
      >
        <Row ref={stageRef} className="h-100 g-0 justify-content-center">
          <Col xs="auto" className="d-flex align-items-center">
            <div
              style={{
                display: 'inline-grid',
                gridTemplateColumns: `repeat(${MAZE_WIDTH}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${MAZE_HEIGHT}, ${CELL_SIZE}px)`,
              }}
            >
              {gameState.status === GameStatus.PLAYING &&
                gameState.maze.map((row, y) =>
                  row.map((cell, x) => (
                    <div key={`${x}-${y}`} style={{position: 'relative'}}>
                      {/*
                       * We use a slightly larger inner div to draw borders so that the borders
                       * are centered along the column / row lines.
                       */}
                      <div
                        style={{
                          position: 'absolute',
                          boxSizing: 'border-box',
                          width: CELL_SIZE + WALL_WIDTH / 2,
                          height: CELL_SIZE + WALL_WIDTH / 2,
                          top: -(WALL_WIDTH / 2),
                          left: -(WALL_WIDTH / 2),
                          ...(cell.topWall && {borderTop: WALL_STYLE}),
                          ...(cell.leftWall && {borderLeft: WALL_STYLE}),
                          ...(x === MAZE_WIDTH - 1 &&
                            cell.rightWall && {borderRight: WALL_STYLE}),
                          ...(y === MAZE_HEIGHT - 1 &&
                            cell.bottomWall && {borderBottom: WALL_STYLE}),
                        }}
                      />
                    </div>
                  ))
                )}
            </div>
          </Col>
        </Row>
      </Container>

      {gameState.status === GameStatus.INIT &&
        stageWidth > 0 &&
        stageWidth < MIN_STAGE_WIDTH && <WindowTooSmallBanner />}

      <Toolbar>
        <GameSelector />
      </Toolbar>
    </>
  );
}
