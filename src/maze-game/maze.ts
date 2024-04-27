/** A maze cell. */
export interface BaseCell {
  topWall: boolean;
  rightWall: boolean;
  bottomWall: boolean;
  leftWall: boolean;
}

/** A maze is a two-dimensional matrix of cell values. */
export type Maze<T extends BaseCell = BaseCell> = Array<Array<T>>;

export function mazeToString(maze: Maze): string {
  const lines: Array<Array<string>> = [];
  for (let y = 0; y < maze.length; ++y) {
    const row = maze[y];
    const line1 = [
      '\t',
      ...row.map(
        (cell, x) =>
          (cell.leftWall || (y > 0 && maze[y - 1][x].leftWall)
            ? '+'
            : cell.topWall
              ? '-'
              : ' ') + (cell.topWall ? '-' : ' ')
      ),
      row[row.length - 1].rightWall ||
      (y > 0 && maze[y - 1][row.length - 1].rightWall)
        ? '+'
        : row[row.length - 1].topWall
          ? '-'
          : ' ',
    ];
    lines.push(line1);
    const line2 = [
      `${y + 1}\t`,
      ...row.map((cell) => (cell.leftWall ? '|' : ' ') + ' '),
      row[row.length - 1].rightWall ? '|' : ' ',
    ];
    lines.push(line2);
  }
  const lastRow = maze[maze.length - 1];
  const lastLine = [
    '\t',
    ...lastRow.map((cell) =>
      cell.bottomWall ? (cell.leftWall ? '+-' : '--') : '  '
    ),
    lastRow[lastRow.length - 1].bottomWall
      ? lastRow[lastRow.length - 1].rightWall
        ? '+'
        : '-'
      : ' ',
  ];
  lines.push(lastLine);
  return lines.map((line) => line.join('')).join('\n');
}

/** Coordinates of a cell. */
export interface CellCoords {
  x: number;
  y: number;
}

/** Cell index, representing y * width + x. */
export type CellIndex = number;

/** Generate a maze using Wilson's algorithm, i.e. loop-erased random walk. */
export function generateMaze(width: number, height: number): Maze {
  if (width <= 1 || height < 1) {
    throw new Error('Width and height must be at least 1.');
  }

  /** Convert coordinates of a cell to a numeric index. */
  const coordsToIndex = (coords: CellCoords): CellIndex =>
    coords.y * width + coords.x;
  /** Convert numeric index of a cell to coordinates. */
  const indexToCoords = (index: CellIndex): CellCoords => ({
    x: index % width,
    y: Math.floor(index / width),
  });

  // Start with a maze where all walls are present.
  const maze: Maze = Array(height)
    .fill(null)
    .map(() =>
      Array(width)
        .fill(null)
        .map(() => ({
          topWall: true,
          rightWall: true,
          bottomWall: true,
          leftWall: true,
        }))
    );

  // Whether the cell is part of the maze.
  const isPartOfMaze = Array(height * width).fill(false) as Array<boolean>;
  // Mark the top left cell as part of the maze.
  isPartOfMaze[0] = true;
  let cellsInMaze = 1;

  while (cellsInMaze < width * height) {
    // Pick a random cell that is not part of the maze.
    let k = Math.floor(Math.random() * (width * height - cellsInMaze));
    let startIndex = 0;
    do {
      do {
        ++startIndex;
      } while (isPartOfMaze[startIndex]);
    } while (k-- > 0);

    // Start a random walk from the picked cell.
    const path: Array<CellIndex> = [startIndex];
    const pathMap = new Map<CellIndex, number>([[startIndex, 0]]);
    let currentIndex = startIndex;
    for (;;) {
      const {x, y} = indexToCoords(currentIndex);
      const neighbors = [
        {x: x - 1, y},
        {x: x + 1, y},
        {x, y: y - 1},
        {x, y: y + 1},
      ].filter(
        ({x: nx, y: ny}) => nx >= 0 && nx < width && ny >= 0 && ny < height
      );
      const nextCoords =
        neighbors[Math.floor(Math.random() * neighbors.length)];
      const nextIndex = coordsToIndex(nextCoords);
      if (isPartOfMaze[nextIndex]) {
        // Reached a cell that is already part of the maze. Add the path to the
        // maze.
        path.push(nextIndex);
        for (let i = 0; i < path.length - 1; i++) {
          const {x: cx, y: cy} = indexToCoords(path[i]);
          const {x: nx, y: ny} = indexToCoords(path[i + 1]);
          if (cx < nx) {
            maze[cy][cx].rightWall = false;
            maze[ny][nx].leftWall = false;
          } else if (cx > nx) {
            maze[cy][cx].leftWall = false;
            maze[ny][nx].rightWall = false;
          } else if (cy < ny) {
            maze[cy][cx].bottomWall = false;
            maze[ny][nx].topWall = false;
          } else {
            maze[cy][cx].topWall = false;
            maze[ny][nx].bottomWall = false;
          }
          isPartOfMaze[path[i]] = true;
          cellsInMaze++;
        }
        console.log(mazeToString(maze) + '\n');
        break;
      } else if (pathMap.has(nextIndex)) {
        // Loop detected. Erase the loop.
        const loopStart = pathMap.get(nextIndex)! + 1;
        for (let i = loopStart; i < path.length; ++i) {
          pathMap.delete(path[i]);
        }
        path.splice(loopStart, path.length - loopStart);
        currentIndex = path[loopStart - 1];
      } else {
        // Continue the walk.
        path.push(nextIndex);
        pathMap.set(nextIndex, path.length - 1);
        currentIndex = nextIndex;
      }
    }
  }

  maze[0][0].leftWall = false;
  maze[height - 1][width - 1].rightWall = false;
  console.log(mazeToString(maze) + '\n');

  return maze;
}

// console.log(mazeToString(generateMaze(15, 15)));
