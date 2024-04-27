import Confetti from 'react-confetti';
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
import {getRandomStyleId} from '../common/pumpkin-sprite';
import {Throttler} from '../common/throttler';
import {Toolbar} from '../common/toolbar';
import {WindowTooSmallBanner} from '../common/window-too-small-banner';
import {CellCoords, CellIndex, Maze, generateMaze} from './maze';
import {PumpkinSprite} from '../common/pumpkin-sprite';
import {PumpkinShelf} from '../common/pumpkin-shelf';

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
  /** Player has lost. */
  LOST,
}

const MAZE_WIDTH = 10;
const MAZE_HEIGHT = 8;
const CELL_SIZE = 65;
const SPRITE_SIZE = CELL_SIZE * 0.7;
const WALL_COLOR = '#606060';
const WALL_WIDTH = 3;
const WALL_STYLE = `${WALL_WIDTH}px solid ${WALL_COLOR}`;
const NUM_PUMPKINS = 5;

/** State of a pumpkin in the maze. */
type PumpkinInMaze = CellCoords & {styleId: number};

/** Convert coords to index. */
const coordsToIndex = ({x, y}: CellCoords): CellIndex => y * MAZE_WIDTH + x;

/** Current state of the game. */
type GameState =
  | {status: GameStatus.INIT}
  | {
      status: GameStatus.PLAYING | GameStatus.WON | GameStatus.LOST;
      maze: Maze;
      avatarCoords: CellCoords;
      pumpkinsInMaze: Map<CellIndex, PumpkinInMaze>;
      capturedPumpkins: Array<{styleId: number}>;
    };

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
            avatarCoords: {x: 0, y: 0},
            pumpkinsInMaze: generatePumpkins(),
            capturedPumpkins: [],
          });
        }
        return;
      }
      case GameStatus.PLAYING: {
        console.log('Playing!');
        return;
      }
      case GameStatus.WON:
      case GameStatus.LOST:
        // If the game is already won or lost, nothing to do.
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
      CAUGHT_PUMPKIN: new Audio('./jingle-1.mp3'),
      WON: new Audio('./success-2.mp3'),
      LOST: new Audio('./lost.mp3'),
    };
    for (const soundEffect of Object.values(soundEffects)) {
      soundEffect.load();
    }
    return soundEffects;
  }, []);

  // Throttler for keyboard handler.
  const throttlerRef = useRef(
    new Throttler({
      waitMs: 100,
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
          const {avatarCoords, maze} = gameState;
          const cell = maze[avatarCoords.y][avatarCoords.x];
          const newAvatarCoords = {...avatarCoords};
          switch (e.key) {
            case 'ArrowUp':
              if (!cell.topWall && avatarCoords.y > 0) {
                --newAvatarCoords.y;
              }
              break;
            case 'ArrowDown':
              if (!cell.bottomWall && avatarCoords.y < MAZE_HEIGHT - 1) {
                ++newAvatarCoords.y;
              }
              break;
            case 'ArrowLeft':
              if (!cell.leftWall && avatarCoords.x > 0) {
                --newAvatarCoords.x;
              }
              break;
            case 'ArrowRight':
              if (!cell.rightWall && avatarCoords.x < MAZE_WIDTH - 1) {
                ++newAvatarCoords.x;
              }
              break;
            default:
              break;
          }
          if (
            newAvatarCoords.x !== avatarCoords.x ||
            newAvatarCoords.y !== avatarCoords.y
          ) {
            setGameState((gameState) => ({
              ...gameState,
              avatarCoords: newAvatarCoords,
            }));
            const newAvatarIndex = coordsToIndex(newAvatarCoords);
            let soundEffect: HTMLAudioElement | null = null;
            if (gameState.pumpkinsInMaze.has(newAvatarIndex)) {
              const {styleId} = gameState.pumpkinsInMaze.get(newAvatarIndex)!;
              setGameState((gameState) =>
                gameState.status === GameStatus.PLAYING
                  ? {
                      ...gameState,
                      pumpkinsInMaze: new Map(
                        [...gameState.pumpkinsInMaze].filter(
                          ([index]) => index !== newAvatarIndex
                        )
                      ),
                      capturedPumpkins: [
                        ...gameState.capturedPumpkins,
                        {styleId},
                      ],
                    }
                  : gameState
              );
              soundEffect = soundEffects.CAUGHT_PUMPKIN;
            }
            if (
              newAvatarCoords.x === MAZE_WIDTH - 1 &&
              newAvatarCoords.y === MAZE_HEIGHT - 1
            ) {
              if (gameState.pumpkinsInMaze.size === 0) {
                setGameState((gameState) =>
                  gameState.status === GameStatus.PLAYING
                    ? {
                        ...gameState,
                        status: GameStatus.WON,
                      }
                    : gameState
                );
                soundEffect = soundEffects.WON;
              } else {
                setGameState((gameState) =>
                  gameState.status === GameStatus.PLAYING
                    ? {
                        ...gameState,
                        status: GameStatus.LOST,
                      }
                    : gameState
                );
                soundEffect = soundEffects.LOST;
              }
            }
            if (soundEffect) {
              soundEffect.load();
              soundEffect.play().then(
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                () => {},
                (e) => {
                  console.error(e);
                }
              );
            }
          }
          break;
        }
        case GameStatus.WON:
        case GameStatus.LOST: {
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
    [
      gameState,
      soundEffects.CAUGHT_PUMPKIN,
      soundEffects.LOST,
      soundEffects.WON,
    ]
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
          <Col
            xs="auto"
            className="d-flex flex-column align-items-center justify-content-center"
          >
            <div
              style={{
                display: 'inline-grid',
                gridTemplateColumns: `repeat(${MAZE_WIDTH}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${MAZE_HEIGHT}, ${CELL_SIZE}px)`,
              }}
            >
              {(gameState.status === GameStatus.PLAYING ||
                gameState.status === GameStatus.WON ||
                gameState.status === GameStatus.LOST) && (
                <>
                  {gameState.maze.map((row, y) =>
                    row.map((cell, x) => (
                      <div
                        key={`${x}-${y}`}
                        className="d-flex justify-content-center align-items-center"
                        style={{position: 'relative'}}
                      >
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
                        {
                          // Draw pumpkins
                          gameState.pumpkinsInMaze.has(
                            coordsToIndex({x, y})
                          ) && (
                            <PumpkinSprite
                              letter=""
                              size={SPRITE_SIZE}
                              styleId={
                                gameState.pumpkinsInMaze.get(
                                  coordsToIndex({x, y})
                                )!.styleId
                              }
                            />
                          )
                        }
                        {gameState.avatarCoords.x === x &&
                          gameState.avatarCoords.y === y && (
                            <AvatarSprite size={SPRITE_SIZE} />
                          )}
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
            {(gameState.status === GameStatus.PLAYING ||
              gameState.status === GameStatus.WON ||
              gameState.status === GameStatus.LOST) && (
              <PumpkinShelf
                pumpkins={gameState.capturedPumpkins.map(({styleId}) => ({
                  styleId,
                  letter: '',
                }))}
                size={SPRITE_SIZE}
              />
            )}
          </Col>
        </Row>
      </Container>

      {gameState.status === GameStatus.WON && (
        <Confetti width={stageWidth - 5} height={stageHeight - 5} />
      )}

      {gameState.status === GameStatus.LOST && (
        <div
          className="w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
          }}
          onKeyDown={onKeyDown}
        >
          <div
            className="w-100 h-100"
            style={{
              position: 'absolute',
              backgroundColor: 'black',
              opacity: 0.4,
              zIndex: 1000,
            }}
          />
          <img src="./sad-pumpkin.png" width={200} style={{zIndex: 1001}} />
        </div>
      )}

      {gameState.status === GameStatus.INIT &&
        stageWidth > 0 &&
        stageWidth < MIN_STAGE_WIDTH && <WindowTooSmallBanner />}

      <Toolbar>
        <GameSelector />
      </Toolbar>
    </>
  );
}

function generatePumpkins(): Map<CellIndex, PumpkinInMaze> {
  const pumpkins = new Map<CellIndex, PumpkinInMaze>();
  for (let i = 0; i < NUM_PUMPKINS; ++i) {
    for (;;) {
      const x = Math.floor(Math.random() * MAZE_WIDTH);
      const y = Math.floor(Math.random() * MAZE_HEIGHT);
      const index = coordsToIndex({x, y});
      if (
        (x === 0 && y === 0) ||
        (x === MAZE_WIDTH - 1 && y === MAZE_HEIGHT - 1) ||
        pumpkins.has(index)
      ) {
        continue;
      }
      pumpkins.set(index, {x, y, styleId: getRandomStyleId()});
      break;
    }
  }
  return pumpkins;
}

export function AvatarSprite({
  size,
  style,
}: {
  /** Size of the avatar in pixels. */
  size: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        height: size,
        width: size,
        backgroundImage: `url(./boy.png)`,
        backgroundSize: 'contain',
        ...style,
      }}
    />
  );
}
