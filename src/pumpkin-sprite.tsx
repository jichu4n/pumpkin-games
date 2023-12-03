/** Props for PumpkinSprite. */
export interface PumpkinSpriteProps {
  /** A single letter to display on the pumpkin. */
  letter: string;
  /** X position of the pumpkin. If not provided, will be rendered at default
   * location in HTML tree. */
  x?: number;
  /** Y position of the pumpkin. If not provided, will be rendered at default
   * location in HTML tree. */
  y?: number;
  /** Size of the pumpkin in pixels. */
  size: number;
  /** Which pumpkin image to render. The number corresponds to the file suffix
   * in public/pumpkin-XX.png. */
  styleId: number;
}

/** Default pumpkin size before scaling. */
const PUMPKIN_SIZE = 512;

/** Renders a pumpkin with a centered letter. */
export function PumpkinSprite({
  letter,
  x,
  y,
  size,
  styleId,
}: PumpkinSpriteProps) {
  let sizeBasis: number;
  let layoutStyles: React.CSSProperties;
  if (x !== undefined && y !== undefined) {
    sizeBasis = PUMPKIN_SIZE;
    layoutStyles = {
      height: PUMPKIN_SIZE,
      width: PUMPKIN_SIZE,
      transformOrigin: 'top left',
      transform: [
        `translateX(${x}px)`,
        `translateY(${y}px)`,
        `scale(${size / PUMPKIN_SIZE})`,
      ].join(' '),
    };
  } else {
    sizeBasis = size;
    layoutStyles = {
      height: size,
      width: size,
    };
  }
  return (
    <div
      style={{
        backgroundImage: `url(./pumpkin-${styleId}.png)`,
        backgroundSize: 'contain',
        ...layoutStyles,
      }}
    >
      <div
        className="text-center"
        style={{
          lineHeight: `${sizeBasis * 0.7}px`,
          paddingTop: sizeBasis * 0.275,
          fontSize: `${sizeBasis * 0.5}px`,
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        {letter}
      </div>
    </div>
  );
}
