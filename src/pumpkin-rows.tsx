import {useMemo} from 'react';
import {PumpkinSprite} from './pumpkin-sprite';

/** Number of pumpkin styles. See public/pumpkin-XX.png. */
const NUM_PUMPKIN_STYLES = 11;
/** Default size of pumpkins. */
const PUMPKIN_SIZE = 60;

/** Renders pumpkins in rows of 10. */
export function PumpkinRows({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  const numRows = Math.ceil(count / 10);
  const styleIds = useMemo(() => {
    const styleIds: Array<number> = [];
    for (let i = 0; i < numRows; i++) {
      for (;;) {
        const styleId = Math.floor(Math.random() * NUM_PUMPKIN_STYLES);
        if (!styleIds.includes(styleId)) {
          styleIds.push(styleId);
          break;
        }
      }
    }
    return styleIds;
  }, [numRows]);
  return (
    <div className={`container-fluid ${className}`}>
      {...Array(numRows)
        .fill(0)
        .map((_, rowId) => (
          <div key={`${rowId}`} className="row justify-content-center">
            {...Array(rowId === numRows - 1 ? count % 10 || 10 : 10)
              .fill(0)
              .map((_, colId) => (
                <div
                  key={`${rowId}-${colId}`}
                  className="col-1 mx-2 my-2 p-0"
                  style={{width: PUMPKIN_SIZE}}
                >
                  <PumpkinSprite
                    letter={`${rowId * 10 + colId + 1}`}
                    size={PUMPKIN_SIZE}
                    styleId={styleIds[rowId]}
                  />
                </div>
              ))}
          </div>
        ))}
    </div>
  );
}
