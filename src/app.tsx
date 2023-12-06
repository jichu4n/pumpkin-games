import 'bootstrap/dist/css/bootstrap.min.css';
import {KeyboardEvent, useEffect, useState} from 'react';
import Confetti from 'react-confetti';
import {useElementSize} from 'usehooks-ts';
import './app.css';
import {PumpkinRows} from './pumpkin-rows';
import {WindowTooSmallBanner} from './window-too-small-banner';
import {WonBanner} from './won-banner';

/** Minimum stage width to be able to play the game. */
const MIN_STAGE_WIDTH = 800;

/** Status of the game. */
enum GameStatus {
  /** Game is initializing. */
  INIT,
  /** Game is running. */
  PLAYING,
  /** Player has just won and we're transitioning to WON state. */
  TRANSITIONING_TO_WON,
  /** Player has won. */
  WON,
}

/** Current state of the game. */
type GameState =
  | {status: GameStatus.INIT}
  | {
      status: GameStatus.PLAYING | GameStatus.TRANSITIONING_TO_WON;
      /** Number of pumpkins displayed. */
      count: number;
      /** Text entered by the player. */
      inputValue: string;
    }
  | {status: GameStatus.WON};

function App() {
  /** The current game state. */
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.INIT,
  });

  /** The main game area element. */
  const [stageRef, {width: stageWidth, height: stageHeight}] =
    useElementSize<HTMLDivElement>();

  // Main game loop.
  useEffect(() => {
    // We (re)initialize the game loop when:
    //   1. Game state is INIT and stage size is known for the first time. We
    //      should then transition into PLAYING state.
    //   2. The game is in PLAYING state and the stage size changes.
    if (gameState.status === GameStatus.WON) {
      return;
    }

    if (gameState.status === GameStatus.INIT) {
      if (stageWidth > MIN_STAGE_WIDTH && stageHeight > 0) {
        setGameState(() => ({
          status: GameStatus.PLAYING,
          count: Math.floor(Math.random() * 50) + 1,
          inputValue: '',
        }));
      }
      return;
    }
  }, [gameState, stageWidth, stageHeight]);

  // Keyboard handler.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    console.log(`onKeyDown: ${e.key}`);

    switch (gameState.status) {
      case GameStatus.INIT:
      case GameStatus.TRANSITIONING_TO_WON:
        // Do nothing.
        break;
      case GameStatus.PLAYING: {
        let {inputValue, count} = gameState;
        if (/^[0-9]$/.test(e.key)) {
          inputValue += e.key;
        } else if (e.key === 'Backspace' && inputValue.length > 0) {
          inputValue = inputValue.slice(0, -1);
        } else if (
          ['Enter', 'Delete', 'Escape', ' '].includes(e.key) &&
          inputValue.length > 0
        ) {
          inputValue = '';
        } else {
          break;
        }
        if (inputValue === count.toString()) {
          setGameState({
            ...gameState,
            status: GameStatus.TRANSITIONING_TO_WON,
            inputValue,
          });
          const onAudioComplete = () => setGameState({status: GameStatus.WON});
          const audio = new Audio(`./success.mp3`);
          audio.addEventListener('ended', onAudioComplete);
          audio.addEventListener('error', onAudioComplete);
          audio.play();
        } else {
          setGameState({
            ...gameState,
            inputValue,
          });
        }
        break;
      }
      case GameStatus.WON:
        if (e.key === ' ') {
          window.location.reload();
        }
        break;
      default:
        const exhaustiveCheck: never = gameState;
        throw new Error(
          `Unhandled game state: ${JSON.stringify(exhaustiveCheck)}`
        );
    }
  };

  return (
    <>
      <div
        ref={(el: HTMLDivElement) => {
          stageRef(el);
          el?.focus();
        }}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="stage d-flex flex-column justify-content-center align-items-center h-100"
      >
        {gameState.status === GameStatus.INIT &&
          stageWidth > 0 &&
          stageWidth < MIN_STAGE_WIDTH && <WindowTooSmallBanner />}

        {(gameState.status === GameStatus.PLAYING ||
          gameState.status === GameStatus.TRANSITIONING_TO_WON) && (
          <>
            <PumpkinRows
              count={gameState.count}
              className={`pumpkin-rows ${
                gameState.status === GameStatus.TRANSITIONING_TO_WON
                  ? 'opacity-50'
                  : ''
              }`}
            />
            <div className="my-4" />
            <div
              className={`h1 number-display ${
                gameState.status === GameStatus.TRANSITIONING_TO_WON
                  ? 'text-danger number-display-won'
                  : ''
              }`}
            >
              {gameState.inputValue || '?'}
            </div>
          </>
        )}
        {(gameState.status === GameStatus.TRANSITIONING_TO_WON ||
          gameState.status === GameStatus.WON) && (
          <Confetti width={stageWidth - 5} height={stageHeight - 5} />
        )}

        {gameState.status === GameStatus.WON && <WonBanner />}
      </div>
    </>
  );
}

export default App;
