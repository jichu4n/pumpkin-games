import React, {Ref, forwardRef} from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

const GAMES = Object.freeze([
  {
    name: 'Pumpkin Counting Game',
    route: 'counting-game',
  },
  {
    name: 'Pumpkin Letter Game',
    route: 'letter-game',
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
      {/* Icon from Font Awesome */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        width="21"
        viewBox="0 0 448 512"
        fill="#ff6f00"
      >
        <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
      </svg>
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
