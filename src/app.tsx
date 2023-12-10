import 'bootstrap/dist/css/bootstrap.min.css';
import {KeyboardEvent, useEffect, useState} from 'react';
import Confetti from 'react-confetti';
import {useElementSize} from 'usehooks-ts';
import './app.css';
import {LABEL_TYPES, LabelType, PumpkinRows} from './pumpkin-rows';
import {WindowTooSmallBanner} from './window-too-small-banner';

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
      status: GameStatus.PLAYING | GameStatus.WON;
      /** Number of pumpkins displayed. */
      count: number;
      /** Text entered by the player. */
      inputValue: string;
    };

function App() {
  /** The current game state. */
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.INIT,
  });

  /** Current label display type. */
  const [labelType, setLabelType] = useState<LabelType>(LabelType.NONE);

  /** The main game area element. */
  const [stageRef, {width: stageWidth, height: stageHeight}] =
    useElementSize<HTMLDivElement>();

  useEffect(() => {
    // If game state is INIT, transition to PLAYING IFF initial rendering is
    // complete and we've determined the stage is big enough.
    if (gameState.status === GameStatus.INIT) {
      if (stageWidth > MIN_STAGE_WIDTH && stageHeight > 0) {
        setGameState(() => ({
          status: GameStatus.PLAYING,
          count: Math.floor(Math.random() * 50) + 1,
          inputValue: '',
        }));
      }
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
        if (/^[0-9]$/.test(e.key)) {
          inputValue += e.key;
        } else if (e.key === 'Backspace' && inputValue.length > 0) {
          inputValue = inputValue.slice(0, -1);
        } else if (
          ['Enter', 'Delete', 'Escape'].includes(e.key) &&
          inputValue.length > 0
        ) {
          inputValue = '';
        } else if (e.key === ' ') {
          setLabelType(
            (labelType) =>
              LABEL_TYPES[
                (LABEL_TYPES.indexOf(labelType) + 1) % LABEL_TYPES.length
              ]
          );
          break;
        } else {
          break;
        }
        if (inputValue === count.toString()) {
          setGameState({
            ...gameState,
            status: GameStatus.WON,
            inputValue,
          });
          const audio = new Audio(`./success.mp3`);
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
          gameState.status === GameStatus.WON) && (
          <>
            <PumpkinRows
              count={gameState.count}
              labelType={labelType}
              className={`pumpkin-rows ${
                gameState.status === GameStatus.WON ? 'opacity-75' : ''
              }`}
            />
            <div className="my-4" />
            <div
              className={`h1 number-display ${
                gameState.status === GameStatus.WON
                  ? 'text-danger number-display-won'
                  : ''
              }`}
            >
              {gameState.inputValue || '?'}
            </div>
          </>
        )}

        <div className="fixed-bottom text-start px-2 py-1 text-uppercase fw-bold opacity-25">
          {gameState.status === GameStatus.PLAYING && (
            <span>press Space for hints</span>
          )}
          {gameState.status === GameStatus.WON && (
            <span>press Space to play again</span>
          )}
        </div>

        {gameState.status === GameStatus.WON && (
          <Confetti width={stageWidth - 5} height={stageHeight - 5} />
        )}
      </div>
    </>
  );
}

export default App;
