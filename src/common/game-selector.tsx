import React, {Ref, forwardRef} from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import {MenuIcon} from './icons';

const GAMES = Object.freeze([
  {
    name: 'Pumpkin Counting Game',
    route: 'counting-game',
  },
  {
    name: 'Pumpkin Letter Game',
    route: 'letter-game',
  },
  {
    name: 'Pumpkin Maze Game',
    route: 'maze-game',
  },
]);

const GameSelectorButton = forwardRef(function GameSelectorButton(
  {onClick}: {onClick: (e: React.MouseEvent) => void},
  ref: Ref<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      role="button"
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      <MenuIcon />
    </div>
  );
});

export function GameSelector() {
  return (
    <Dropdown>
      <Dropdown.Toggle as={GameSelectorButton} />
      <Dropdown.Menu className="mt-2">
        {GAMES.map(({name, route}) => (
          <Dropdown.Item
            key={route}
            href={`#/${route}`}
            style={{
              color: '#ff6f00',
            }}
            active={window.location.href.endsWith(`/${route}`)}
          >
            {name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
