import {useMemo} from 'react';
import {PumpkinSprite} from '../common/pumpkin-sprite';

/** Number of pumpkin styles. See public/pumpkin-XX.png. */
const NUM_PUMPKIN_STYLES = 11;
/** Default size of pumpkins. */
const PUMPKIN_SIZE = 60;

/** Which numbers to show on pumpkins. */
export enum LabelType {
  /** Don't display any numbers. */
  NONE = 'none',
  /** Display numbers on last pumpkin in row (10, 20, 30, etc). */
  LAST_IN_ROW = 'lastInRow',
  /** Display numbers on every pumpkin. */
  ALL = 'all',
}
export const LABEL_TYPES = Object.values(LabelType);

/** Renders pumpkins in rows of 10. */
export function PumpkinRows({
  count,
  labelType,
  className,
}: {
  count: number;
  labelType: LabelType;
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
    <div className={`d-flex flex-column justify-content-start ${className}`}>
      {...Array(numRows)
        .fill(0)
        .map((_, rowId) => (
          <div key={`${rowId}`} className="d-inline-flex">
            {...Array(rowId === numRows - 1 ? count % 10 || 10 : 10)
              .fill(0)
              .map((_, colId) => (
                <div
                  key={`${rowId}-${colId}`}
                  className={`col-1 mx-2 mb-4 p-0 ${colId === 4 ? 'me-4' : ''}`}
                  style={{width: PUMPKIN_SIZE}}
                >
                  <PumpkinSprite
                    letter={
                      labelType === LabelType.ALL ||
                      (labelType === LabelType.LAST_IN_ROW && colId === 9)
                        ? `${rowId * 10 + colId + 1}`
                        : ' '
                    }
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
