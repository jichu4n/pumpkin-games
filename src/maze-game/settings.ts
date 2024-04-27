import {useLocalStorage} from 'usehooks-ts';

enum SettingsKeys {
  MAZE_WIDTH = 'maze-game/width',
  MAZE_HEIGHT = 'maze-game/height',
  NUM_PUMPKINS = 'maze-game/numPumpkins',
  AVATAR = 'maze-game/avatar',
}

export const Avatars = [
  {
    key: 'boy',
    label: 'Boy',
    src: './boy.png',
  },
  {
    key: 'girl',
    label: 'Girl',
    src: './girl.png',
  },
  {
    key: 'ghost',
    label: 'Ghost',
    src: './ghost.png',
  },
] as const;
export type AvatarKey = (typeof Avatars)[number]['key'];

export function useSettings() {
  const [mazeWidth, setMazeWidth] = useLocalStorage<number>(
    SettingsKeys.MAZE_WIDTH,
    10
  );
  const coordsToIndex = ({x, y}: {x: number; y: number}) => y * mazeWidth + x;
  const [mazeHeight, setMazeHeight] = useLocalStorage<number>(
    SettingsKeys.MAZE_HEIGHT,
    6
  );
  const [numPumpkins, setNumPumpkins] = useLocalStorage<number>(
    SettingsKeys.NUM_PUMPKINS,
    4
  );
  const [avatarKey, setAvatarKey] = useLocalStorage<AvatarKey>(
    SettingsKeys.AVATAR,
    Avatars[2].key
  );
  const avatar = Avatars.find((a) => a.key === avatarKey);

  return {
    mazeWidth,
    setMazeWidth,
    coordsToIndex,
    mazeHeight,
    setMazeHeight,
    numPumpkins,
    setNumPumpkins,
    avatarKey,
    setAvatarKey,
    avatar,
  };
}
