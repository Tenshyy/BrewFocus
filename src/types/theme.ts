export type CafeTheme = "parisien" | "japonais" | "nordique" | "urbain";

export interface ThemeColors {
  bg: string;
  panel: string;
  border: string;
  orange: string;
  orangeGlow: string;
  orangeDim: string;
  cream: string;
  creamDim: string;
  gray: string;
  coffeeDark: string;
  coffeeMid: string;
  coffeeLight: string;
}

export interface BaristaColors {
  BG: string;
  SHELF: string;
  SHELF_HI: string;
  CTR_TOP: string;
  CTR: string;
  CTR_LINE: string;
  SKIN: string;
  SKIN2: string;
  HAIR: string;
  HAIR_LT: string;
  HAT: string;
  HAT_BAND: string;
  SHIRT: string;
  APRON: string;
  APRON_STR: string;
  EYE: string;
  MOUTH: string;
  CUP: string;
  CUP_O: string;
  COFFEE: string;
  MACH: string;
  MACH_DK: string;
  BOTTLE_G: string;
  BOTTLE_R: string;
  BLACK: string;
  MENU_TXT: string;
  GREEN_LED: string;
  LAMP: string;
  CLI_SHIRT1: string;
  CLI_SHIRT2: string;
  CLI_SHIRT3: string;
  CLI_HAT: string;
  STOOL: string;
  STOOL_HI: string;
}

export interface CafeThemeDefinition {
  id: CafeTheme;
  labelKey: string;
  colors: ThemeColors;
  baristaColors: BaristaColors;
}
