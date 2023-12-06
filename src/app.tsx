import 'bootstrap/dist/css/bootstrap.min.css';
import {KeyboardEvent, useEffect, useState} from 'react';
import {useElementSize} from 'usehooks-ts';
import {PumpkinRows} from './pumpkin-rows';
import {WindowTooSmallBanner} from './window-too-small-banner';
import {WonBanner} from './won-banner';
import Confetti from 'react-confetti';

/** Minimum stage width to be able to play the game. */
const MIN_STAGE_WIDTH = 800;

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
  | {
      status: GameStatus.PLAYING;
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
        // Do nothing.
        break;
      case GameStatus.PLAYING: {
        let {inputValue, count} = gameState;
        if (inputValue === count.toString()) {
          // We already won, but getting another keypress while playing audio.
          // So don't need to do anything.
          break;
        }

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
        setGameState({...gameState, inputValue});
        if (inputValue === count.toString()) {
          const onAudioComplete = () => setGameState({status: GameStatus.WON});
          const audio = new Audio(`./success.mp3`);
          audio.addEventListener('ended', onAudioComplete);
          audio.addEventListener('error', onAudioComplete);
          audio.play();
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
        className="d-flex flex-column justify-content-center align-items-center h-100"
      >
        {gameState.status === GameStatus.INIT &&
          stageWidth > 0 &&
          stageWidth < MIN_STAGE_WIDTH && <WindowTooSmallBanner />}

        {gameState.status === GameStatus.PLAYING && (
          <>
            <PumpkinRows count={gameState.count} />
            <div className="my-4" />
            <div
              className={`h1 ${
                gameState.inputValue === gameState.count.toString()
                  ? 'text-danger'
                  : ''
              }`}
            >
              {gameState.inputValue || '?'}
            </div>
            {gameState.inputValue === gameState.count.toString() && (
              <Confetti width={stageWidth - 5} height={stageHeight - 5} />
            )}
          </>
        )}

        {gameState.status === GameStatus.WON && <WonBanner />}
      </div>
    </>
  );
}

export default App;
