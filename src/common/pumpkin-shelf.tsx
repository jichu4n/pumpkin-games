import {PumpkinSprite, PumpkinSpriteProps} from './pumpkin-sprite';

interface PumpkinShelfProps {
  /** The pumpkins to render. */
  pumpkins: Array<Omit<PumpkinSpriteProps, 'size'>>;
  /** Size of pumpkins. */
  size: number;
}

/** Renders a shelf of pumpkins. */
export function PumpkinShelf({pumpkins, size}: PumpkinShelfProps) {
  return (
    <div
      className="d-flex flex-wrap align-items-start justify-content-center align-self-center p-3"
      style={{minHeight: `calc(${size}px + 1rem + 2rem)`}} // 2 x p-2 + 2 x p-3
    >
      {pumpkins.map(({letter, styleId}, idx) => (
        <div key={idx} className="p-2">
          <PumpkinSprite styleId={styleId} letter={letter} size={size} />
        </div>
      ))}
    </div>
  );
}
