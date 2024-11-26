import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import Confetti from 'react-confetti';
import {Helmet} from 'react-helmet';
import {useResizeObserver} from 'usehooks-ts';
import {GameSelector} from '../common/game-selector';
import {PumpkinShelf} from '../common/pumpkin-shelf';
import {PumpkinSprite, getRandomStyleId} from '../common/pumpkin-sprite';
import {Throttler} from '../common/throttler';
import {Toolbar} from '../common/toolbar';
import {WindowTooSmallBanner} from '../common/window-too-small-banner';
import {CellCoords, CellIndex, Maze, generateMaze} from './maze';
import {useSettings} from './settings';
import {SettingsButton} from './settings-ui';

/** Minimum stage width to be able to play the game. */
const MIN_STAGE_WIDTH = 650;

/** Number of monster styles. See public/monster-XX.png. */
const NUM_MONSTER_STYLES = 10;

function getRandomMonsterStyleId() {
  return Math.floor(Math.random() * NUM_MONSTER_STYLES);
}

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

const CELL_SIZE = 65;
const SPRITE_SIZE = CELL_SIZE * 0.7;
const WALL_COLOR = '#606060';
const WALL_WIDTH = 3;
const WALL_STYLE = `${WALL_WIDTH}px solid ${WALL_COLOR}`;
const MONSTER_SAFE_ZONE_SIZE = 3;

/** State of a pumpkin in the maze. */
type PumpkinInMaze = CellCoords & {styleId: number};
type MonsterInMaze = CellCoords & {
  styleId: number;
  prevCoords: CellCoords | null;
};

/** Current state of the game. */
type GameState =
  | {status: GameStatus.INIT}
  | {
      status: GameStatus.PLAYING | GameStatus.WON | GameStatus.LOST;
      maze: Maze;
      avatarCoords: CellCoords;
      pumpkinsInMaze: Map<CellIndex, PumpkinInMaze>;
      monstersInMaze: Map<CellIndex, Array<MonsterInMaze>>;
      capturedPumpkins: Array<{styleId: number}>;
    };

function generatePumpkinsAndMonsters({
  mazeWidth,
  mazeHeight,
  coordsToIndex,
  numPumpkins,
  numMonsters,
}: {
  mazeWidth: number;
  mazeHeight: number;
  coordsToIndex: (coords: CellCoords) => CellIndex;
  numPumpkins: number;
  numMonsters: number;
}): {
  pumpkins: Map<CellIndex, PumpkinInMaze>;
  monsters: Map<CellIndex, Array<MonsterInMaze>>;
} {
  const pumpkins = new Map<CellIndex, PumpkinInMaze>();
  for (let i = 0; i < numPumpkins; ++i) {
    for (;;) {
      const x = Math.floor(Math.random() * mazeWidth);
      const y = Math.floor(Math.random() * mazeHeight);
      const index = coordsToIndex({x, y});
      if (
        (x === 0 && y === 0) ||
        (x === mazeWidth - 1 && y === mazeHeight - 1) ||
        pumpkins.has(index)
      ) {
        continue;
      }
      pumpkins.set(index, {x, y, styleId: getRandomStyleId()});
      break;
    }
  }

  const monsters = new Map<CellIndex, Array<MonsterInMaze>>();
  for (let i = 0; i < numMonsters; ++i) {
    for (;;) {
      const x = Math.floor(Math.random() * mazeWidth);
      const y = Math.floor(Math.random() * mazeHeight);
      const index = coordsToIndex({x, y});
      if (
        x < MONSTER_SAFE_ZONE_SIZE ||
        y < MONSTER_SAFE_ZONE_SIZE ||
        (x === mazeWidth - 1 && y === mazeHeight - 1) ||
        monsters.has(index) ||
        pumpkins.has(index)
      ) {
        continue;
      }
      monsters.set(index, [
        {
          x,
          y,
          styleId: getRandomMonsterStyleId(),
          prevCoords: null,
        },
      ]);
      break;
    }
  }
  return {pumpkins, monsters};
}

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

  const {
    mazeWidth,
    mazeHeight,
    numPumpkins,
    numMonsters,
    coordsToIndex,
    monsterSpeed,
  } = useSettings();

  // Main game loop.
  useEffect(() => {
    switch (gameState.status) {
      case GameStatus.INIT: {
        console.log('Init!');
        if (stageWidth > MIN_STAGE_WIDTH && stageHeight > 0) {
          const maze = generateMaze(mazeWidth, mazeHeight);
          const {pumpkins, monsters} = generatePumpkinsAndMonsters({
            mazeWidth,
            mazeHeight,
            coordsToIndex,
            numPumpkins,
            numMonsters,
          });
          setGameState({
            status: GameStatus.PLAYING,
            maze,
            avatarCoords: {x: 0, y: 0},
            pumpkinsInMaze: pumpkins,
            monstersInMaze: monsters,
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
  }, [
    gameState,
    stageWidth,
    stageHeight,
    mazeWidth,
    mazeHeight,
    coordsToIndex,
    numPumpkins,
    numMonsters,
  ]);

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
          let hasWon = false;
          switch (e.key) {
            case 'ArrowUp':
              e.preventDefault();
              if (!cell.topWall && avatarCoords.y > 0) {
                --newAvatarCoords.y;
              }
              break;
            case 'ArrowDown':
              e.preventDefault();
              if (!cell.bottomWall && avatarCoords.y < mazeHeight - 1) {
                ++newAvatarCoords.y;
              }
              break;
            case 'ArrowLeft':
              e.preventDefault();
              if (!cell.leftWall && avatarCoords.x > 0) {
                --newAvatarCoords.x;
              }
              break;
            case 'ArrowRight':
              e.preventDefault();
              if (!cell.rightWall && avatarCoords.x < mazeWidth - 1) {
                ++newAvatarCoords.x;
              } else if (
                avatarCoords.x === mazeWidth - 1 &&
                avatarCoords.y === mazeHeight - 1
              ) {
                hasWon = true;
              }
              break;
            default:
              break;
          }
          if (
            newAvatarCoords.x !== avatarCoords.x ||
            newAvatarCoords.y !== avatarCoords.y ||
            hasWon
          ) {
            setGameState((gameState) => ({
              ...gameState,
              avatarCoords: newAvatarCoords,
            }));
            const newAvatarIndex = coordsToIndex(newAvatarCoords);
            let soundEffect: HTMLAudioElement | null = null;
            if (gameState.monstersInMaze.has(newAvatarIndex)) {
              setGameState((gameState) =>
                gameState.status === GameStatus.PLAYING
                  ? {
                      ...gameState,
                      status: GameStatus.LOST,
                    }
                  : gameState
              );
              soundEffect = soundEffects.LOST;
            } else if (gameState.pumpkinsInMaze.has(newAvatarIndex)) {
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
            if (hasWon) {
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
      coordsToIndex,
      gameState,
      mazeHeight,
      mazeWidth,
      soundEffects.CAUGHT_PUMPKIN,
      soundEffects.LOST,
      soundEffects.WON,
    ]
  );

  // Move monsters.
  const moveMonsters = useCallback(() => {
    setGameState((gameState) => {
      if (gameState.status !== GameStatus.PLAYING) {
        return gameState;
      }
      let newStatus = GameStatus.PLAYING;
      const {maze, avatarCoords, monstersInMaze} = gameState;
      const newMonstersInMaze = new Map<CellIndex, Array<MonsterInMaze>>();
      for (const monsters of monstersInMaze.values()) {
        for (const monster of monsters) {
          const cell = maze[monster.y][monster.x];
          let possibleNewCoords = [
            {x: monster.x, y: monster.y - 1, wall: cell.topWall},
            {x: monster.x, y: monster.y + 1, wall: cell.bottomWall},
            {x: monster.x - 1, y: monster.y, wall: cell.leftWall},
            {x: monster.x + 1, y: monster.y, wall: cell.rightWall},
          ].filter(
            ({x, y, wall}) =>
              x >= MONSTER_SAFE_ZONE_SIZE &&
              y >= MONSTER_SAFE_ZONE_SIZE &&
              x < mazeWidth &&
              y < mazeHeight &&
              !wall
          );
          let newCoords: CellCoords;
          if (
            possibleNewCoords.some(
              ({x, y}) => x === avatarCoords.x && y === avatarCoords.y
            )
          ) {
            // Prefer catching the avatar if possible.
            newCoords = avatarCoords;
            newStatus = GameStatus.LOST;
            soundEffects.LOST.load();
            soundEffects.LOST.play().then(
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              () => {},
              (e) => {
                console.error(e);
              }
            );
          } else {
            // Prefer moving away from the previous position.
            if (monster.prevCoords) {
              const possibleMovesWithoutPrevCoords = possibleNewCoords.filter(
                ({x, y}) =>
                  x !== monster.prevCoords?.x || y !== monster.prevCoords?.y
              );
              if (possibleMovesWithoutPrevCoords.length > 0) {
                possibleNewCoords = possibleMovesWithoutPrevCoords;
              }
            }
            // Pick random position.
            newCoords =
              possibleNewCoords[
                Math.floor(Math.random() * possibleNewCoords.length)
              ];
          }
          const newMonster = {
            ...monster,
            x: newCoords.x,
            y: newCoords.y,
            prevCoords: {x: monster.x, y: monster.y},
          };
          const newIndex = coordsToIndex(newCoords);
          if (newMonstersInMaze.has(newIndex)) {
            newMonstersInMaze.get(newIndex)!.push(newMonster);
          } else {
            newMonstersInMaze.set(newIndex, [newMonster]);
          }
        }
      }
      return {
        ...gameState,
        status: newStatus,
        monstersInMaze: newMonstersInMaze,
      };
    });
  }, [mazeWidth, mazeHeight, coordsToIndex, soundEffects.LOST]);

  useEffect(() => {
    const interval = setInterval(moveMonsters, 5000 / monsterSpeed);
    return () => clearInterval(interval);
  }, [moveMonsters, monsterSpeed]);

  const onSettingsChange = useCallback(() => {
    setGameState({status: GameStatus.INIT});
  }, []);

  const grabFocus = useCallback(() => {
    if (!stageRef.current) {
      return;
    }
    if (document.activeElement !== stageRef.current) {
      console.log('Grab focus');
      stageRef.current.focus();
      setTimeout(grabFocus, 50);
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Pumpkin Maze Game</title>
      </Helmet>

      <Container className="w-100 mw-100 h-100 p-0 m-0">
        <Row
          ref={(el: HTMLDivElement) => {
            stageRef.current = el;
            grabFocus();
          }}
          className="h-100 g-0 justify-content-center"
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          <Col
            xs="auto"
            className="d-flex flex-column align-items-center justify-content-center"
          >
            <div
              style={{
                display: 'inline-grid',
                gridTemplateColumns: `repeat(${mazeWidth}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${mazeHeight}, ${CELL_SIZE}px)`,
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
                            ...(x === mazeWidth - 1 &&
                              cell.rightWall && {borderRight: WALL_STYLE}),
                            ...(y === mazeHeight - 1 &&
                              cell.bottomWall && {borderBottom: WALL_STYLE}),
                          }}
                        />
                        {
                          // Draw pumpkins
                          gameState.pumpkinsInMaze.has(coordsToIndex({x, y})) &&
                            !gameState.monstersInMaze.has(
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
                        {
                          // Draw monsters
                          gameState.monstersInMaze.has(coordsToIndex({x, y})) &&
                            gameState.monstersInMaze
                              .get(coordsToIndex({x, y}))
                              ?.slice(0, 1)
                              ?.map((monster, idx) => (
                                <MonsterSprite
                                  key={idx}
                                  size={SPRITE_SIZE}
                                  styleId={monster.styleId}
                                />
                              ))
                        }
                        {
                          // Draw avatar
                          gameState.avatarCoords.x === x &&
                            gameState.avatarCoords.y === y && (
                              <AvatarSprite
                                size={SPRITE_SIZE}
                                style={{
                                  position: 'absolute',
                                  ...((gameState.status === GameStatus.WON ||
                                    gameState.status === GameStatus.LOST) && {
                                    marginLeft: CELL_SIZE,
                                  }),
                                }}
                              />
                            )
                        }
                        {
                          // Draw goal next to last element
                          x === mazeWidth - 1 && y === mazeHeight - 1 && (
                            <div
                              style={{
                                position: 'absolute',
                                left: CELL_SIZE * 1.5,
                                backgroundImage: 'url(./goal.png)',
                                backgroundSize: 'contain',
                                width: SPRITE_SIZE * 0.8,
                                height: SPRITE_SIZE * 0.8,
                              }}
                            />
                          )
                        }
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
        <>
          <Confetti width={stageWidth - 5} height={stageHeight - 5} />
          <div className="fixed-bottom text-start px-2 py-1 text-uppercase fw-bold opacity-25">
            press Space to play again
          </div>
        </>
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
        <SettingsButton
          onSettingsChange={onSettingsChange}
          onClose={grabFocus}
        />
        <GameSelector />
      </Toolbar>
    </>
  );
}

export function AvatarSprite({
  size,
  style,
}: {
  /** Size of the avatar in pixels. */
  size: number;
  style?: React.CSSProperties;
}) {
  const {avatar} = useSettings();
  return (
    <div
      style={{
        height: size,
        width: size,
        backgroundImage: `url(${avatar?.src})`,
        backgroundSize: 'contain',
        ...style,
      }}
    />
  );
}

export function MonsterSprite({
  styleId,
  size,
  style,
}: {
  styleId: number;
  size: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        height: size,
        width: size,
        backgroundImage: `url(./monster-${styleId}.png)`,
        backgroundSize: 'contain',
        ...style,
      }}
    />
  );
}
