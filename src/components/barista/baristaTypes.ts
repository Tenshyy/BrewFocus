import type { BaristaColors } from "@/types/theme";

export type { BaristaColors };

export type BaristaState = "idle" | "brewing" | "serving" | "paused" | "celebrating";

export type IdleSub =
  | "wipe"
  | "shelf"
  | "organize"
  | "espresso"
  | "lookAround"
  | "readBook"
  | "checkPhone"
  | "stretch";

export type ClientPhase = "entering" | "sitting" | "waiting" | "drinking" | "leaving";

export type NpcActivity = "idle" | "laptop" | "newspaper" | "wave" | "chat";

export type FacialExpression = "neutral" | "smile" | "focused";

export interface ClientNPC {
  id: number;
  phase: ClientPhase;
  seatX: number;
  walkX: number;
  frame: number;
  shirtColor: string;
  hairColor: string;
  skinColor: string;
  hasHat: boolean;
  hasGlasses: boolean;
  bodyType: "slim" | "regular";
  activity: NpcActivity;
}

export interface SteamParticle {
  x: number;
  y: number;
  alpha: number;
  speed: number;
}

export interface AmbientCat {
  x: number;
  active: boolean;
  direction: 1 | -1;
}

export interface BaristaScene {
  frame: number;
  baristaX: number;
  isWalking: boolean;
  state: BaristaState;
  idleSub: IdleSub;
  idleSubFrame: number;
  idleSubIdx: number;
  clients: ClientNPC[];
  clientIdCounter: number;
  nextClientFrame: number;
  steamParticles: SteamParticle[];
  cat: AmbientCat;
  expression: FacialExpression;
}

// Canvas constants
export const W = 160;
export const H = 48;
export const FPS = 6;
export const WALK_SPEED = 2;
export const SEAT_POSITIONS = [32, 57, 102];
