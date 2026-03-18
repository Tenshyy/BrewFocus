// 16x16 pixel art coffee cup - side view
// Each cell is a color hex or null (transparent)
// C = cream outline (#F0EBE5)
// D = coffee dark (#3D2815)
// M = coffee mid (#6B4423)
// L = coffee light (#8A5A30)
// S = saucer / cream dim (#B8A48E)
// null = transparent

const C = "#F0EBE5"; // cream outline
const S = "#B8A48E"; // saucer

// Row types for the cup shape
// Rows 0-1: empty (steam area)
// Row 2: top rim of cup
// Rows 3-11: cup body (with liquid fill area rows 3-10)
// Row 12: cup base
// Rows 13-14: saucer
// Row 15: empty

type PixelColor = string | null;

// Cup outline shape - liquid fill rows are 3-10
export const CUP_OUTLINE: (PixelColor)[][] = [
  //0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15
  [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null], // 0 - steam
  [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null], // 1 - steam
  [null,null,null,   C,   C,   C,   C,   C,   C,   C,   C,null,null,null,null,null], // 2 - top rim
  [null,null,   C,null,null,null,null,null,null,null,null,   C,null,   C,null,null], // 3 - body + handle top
  [null,null,   C,null,null,null,null,null,null,null,null,   C,   C,null,   C,null], // 4 - body + handle
  [null,null,   C,null,null,null,null,null,null,null,null,   C,null,null,   C,null], // 5 - body + handle
  [null,null,   C,null,null,null,null,null,null,null,null,   C,null,null,   C,null], // 6 - body + handle
  [null,null,   C,null,null,null,null,null,null,null,null,   C,   C,null,   C,null], // 7 - body + handle
  [null,null,   C,null,null,null,null,null,null,null,null,   C,null,   C,null,null], // 8 - body + handle bottom
  [null,null,   C,null,null,null,null,null,null,null,null,   C,null,null,null,null], // 9 - body
  [null,null,   C,null,null,null,null,null,null,null,null,   C,null,null,null,null], // 10 - body
  [null,null,null,   C,null,null,null,null,null,null,   C,null,null,null,null,null], // 11 - body taper
  [null,null,null,null,   C,   C,   C,   C,   C,   C,null,null,null,null,null,null], // 12 - base
  [null,null,null,   S,   S,   S,   S,   S,   S,   S,   S,null,null,null,null,null], // 13 - saucer top
  [null,   S,   S,   S,   S,   S,   S,   S,   S,   S,   S,   S,   S,null,null,null], // 14 - saucer bottom
  [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null], // 15 - empty
];

// Liquid fill area: defines which cells can be filled with coffee
// [row, colStart, colEnd] (inclusive)
export const LIQUID_FILL_ROWS: { row: number; colStart: number; colEnd: number }[] = [
  { row: 3, colStart: 3, colEnd: 10 },
  { row: 4, colStart: 3, colEnd: 10 },
  { row: 5, colStart: 3, colEnd: 10 },
  { row: 6, colStart: 3, colEnd: 10 },
  { row: 7, colStart: 3, colEnd: 10 },
  { row: 8, colStart: 3, colEnd: 10 },
  { row: 9, colStart: 3, colEnd: 10 },
  { row: 10, colStart: 3, colEnd: 10 },
];

// Total fillable rows count (for drain calculation)
export const TOTAL_LIQUID_ROWS = LIQUID_FILL_ROWS.length; // 8 rows
