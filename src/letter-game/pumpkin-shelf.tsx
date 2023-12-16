import {PumpkinSprite, PumpkinSpriteProps} from '../common/pumpkin-sprite';

interface PumpkinShelfProps {
  /** The pumpkins to render. */
  pumpkins: Array<PumpkinSpriteProps>;
}

/** Renders a shelf of pumpkins. */
export function PumpkinShelf({pumpkins}: PumpkinShelfProps) {
  return (
    <div className="d-flex flex-wrap align-items-start justify-content-center align-self-center p-3">
      {pumpkins.map(({letter, styleId, size}, idx) => (
        <div key={idx} className="p-2">
          <PumpkinSprite styleId={styleId} letter={letter} size={size} />
        </div>
      ))}
    </div>
  );
}
