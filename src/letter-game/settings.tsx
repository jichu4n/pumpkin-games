import {useLocalStorage} from 'usehooks-ts';

/** Types of letters to attach to pumpkins. */
export enum LetterTypes {
  UPPERCASE = 'uppercase',
  LOWERCASE = 'lowercase',
  NUMBER = 'number',
}

enum SettingsKeys {
  LETTER_TYPES = 'letter-game/letterTypes',
  SPEED = 'letter-game/speed',
}

/** React hook for manipulating settings. */
export function useSettings() {
  const [letterTypes, setLetterTypes] = useLocalStorage<LetterTypes[]>(
    SettingsKeys.LETTER_TYPES,
    [LetterTypes.UPPERCASE]
  );
  const isLetterTypeEnabled = (letterType: LetterTypes) =>
    letterTypes.includes(letterType);
  const canToggleLetterType = (letterType: LetterTypes) =>
    !(letterTypes.length === 1 && letterTypes[0] === letterType);
  const toggleLetterType = (letterType: LetterTypes) =>
    setLetterTypes((letterTypes) =>
      letterTypes.includes(letterType)
        ? letterTypes.filter((lt) => lt !== letterType)
        : [...letterTypes, letterType].sort()
    );
  const [speed, setSpeed] = useLocalStorage<number>(SettingsKeys.SPEED, 3);
  return {
    letterTypes,
    setLetterTypes,
    isLetterTypeEnabled,
    canToggleLetterType,
    toggleLetterType,
    speed,
    setSpeed,
  };
}
