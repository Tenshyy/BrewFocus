import type { BaristaState, IdleSub, FacialExpression, BaristaScene } from "./baristaTypes";
import { WALK_SPEED } from "./baristaTypes";

// Extended idle subs list with new animations
const IDLE_SUBS: IdleSub[] = [
  "wipe", "lookAround", "shelf", "organize", "espresso",
  "readBook", "checkPhone", "stretch", "wipe", "lookAround",
];

/** Target X position per barista state/sub */
export function getBaristaTargetX(state: BaristaState, idleSub: IdleSub): number {
  if (state === "brewing") return 120;
  if (state === "serving") return 70;
  if (state === "celebrating") return 80;
  if (state === "paused") return 80;
  switch (idleSub) {
    case "shelf": return 20;
    case "espresso": return 120;
    case "organize": return 55;
    case "readBook": return 65;
    case "checkPhone": return 90;
    case "stretch": return 80;
    case "wipe": return 80;
    case "lookAround": return 80;
    default: return 80;
  }
}

/** Get facial expression based on state */
export function getExpression(state: BaristaState, idleSub: IdleSub): FacialExpression {
  if (state === "celebrating" || state === "serving") return "smile";
  if (state === "brewing" || (state === "idle" && idleSub === "espresso")) return "focused";
  return "neutral";
}

/** 8-frame walk cycle: returns { bobY, armSwingL, armSwingR } */
export function getWalkCycle(frame: number): { bobY: number; armSwingL: number; armSwingR: number } {
  const f = frame % 8;
  const bobPattern = [0, -1, -1, 0, 0, -1, -1, 0];
  const armLPattern = [-2, -1, 0, 1, 2, 1, 0, -1];
  const armRPattern = [2, 1, 0, -1, -2, -1, 0, 1];
  return {
    bobY: bobPattern[f],
    armSwingL: armLPattern[f],
    armSwingR: armRPattern[f],
  };
}

/** Get arm positions, look direction, held item, per idle sub */
export function getIdleSubParams(idleSub: IdleSub, frame: number): {
  look: number;
  laDx: number; laDy: number;
  raDx: number; raDy: number;
  item: "none" | "cup" | "cloth" | "bottle" | "shaker" | "book" | "phone";
  itemHand: "left" | "right";
  isFacingBack: boolean;
} {
  const base = { look: 0, laDx: 0, laDy: 0, raDx: 0, raDy: 0, item: "none" as const, itemHand: "right" as const, isFacingBack: false };

  switch (idleSub) {
    case "wipe": {
      const f = frame % 8;
      return { ...base, look: f < 4 ? -1 : 0, laDx: f < 2 ? -3 : f < 4 ? 3 : 0, laDy: f < 4 ? 2 : 0, item: f < 4 ? "cloth" : "none", itemHand: "left" };
    }
    case "organize": {
      const f = frame % 6;
      return { ...base, look: f < 3 ? -1 : 1, raDx: f < 3 ? -5 : 5, raDy: 2, item: "cup", itemHand: "right" };
    }
    case "espresso": {
      const f = frame % 6;
      return { ...base, look: 1, raDx: 5, raDy: f < 3 ? -2 : 0, laDx: 3, item: "cup", itemHand: "right" };
    }
    case "lookAround": {
      const f = frame % 12;
      return { ...base, look: f < 3 ? -1 : f < 6 ? 0 : f < 9 ? 1 : 0, raDx: 2, raDy: -2 };
    }
    case "shelf":
      return { ...base, isFacingBack: true };
    case "readBook": {
      const f = frame % 12;
      return { ...base, look: f < 6 ? -1 : 0, laDx: -2, laDy: 1, raDx: 2, raDy: 1, item: "book", itemHand: "left" };
    }
    case "checkPhone": {
      const f = frame % 10;
      return { ...base, look: f < 5 ? 0 : f < 8 ? -1 : 0, raDx: 1, raDy: 0, item: "phone", itemHand: "right" };
    }
    case "stretch": {
      const f = frame % 12;
      const lift = f < 6 ? Math.min(f, 3) : Math.max(6 - f, 0);
      return { ...base, look: 0, laDx: -2, laDy: -lift * 2, raDx: 2, raDy: -lift * 2 };
    }
    default:
      return base;
  }
}

/** Update the scene's barista state (pure function) */
export function updateBaristaScene(scene: BaristaScene, getTimerState: () => BaristaState): BaristaScene {
  const next = { ...scene };
  next.frame++;
  next.state = getTimerState();
  next.expression = getExpression(next.state, next.idleSub);

  // Idle sub-animation cycling
  if (next.state === "idle") {
    next.idleSubFrame++;
    if (next.idleSubFrame > 36) { // ~6 seconds
      next.idleSubFrame = 0;
      next.idleSubIdx = (next.idleSubIdx + 1) % IDLE_SUBS.length;
      next.idleSub = IDLE_SUBS[next.idleSubIdx];
    }
  } else {
    next.idleSubFrame = 0;
  }

  // Move barista toward target
  const targetX = getBaristaTargetX(next.state, next.idleSub);
  if (Math.abs(next.baristaX - targetX) > WALK_SPEED) {
    next.baristaX += next.baristaX < targetX ? WALK_SPEED : -WALK_SPEED;
    next.isWalking = true;
  } else {
    next.baristaX = targetX;
    next.isWalking = false;
  }

  // Cat ambient
  if (!next.cat.active && next.frame % 200 === 0) {
    next.cat = { x: -8, active: true, direction: 1 };
  }
  if (next.cat.active) {
    next.cat = { ...next.cat, x: next.cat.x + next.cat.direction };
    if (next.cat.x > 168) {
      next.cat = { ...next.cat, active: false };
    }
  }

  // Steam particles
  next.steamParticles = next.steamParticles
    .map((p) => ({ ...p, y: p.y - p.speed, alpha: p.alpha - 0.06 }))
    .filter((p) => p.alpha > 0);

  // Add new steam if brewing or espresso idle
  if (next.state === "brewing" || (next.state === "idle" && next.idleSub === "espresso")) {
    if (next.frame % 3 === 0) {
      next.steamParticles.push({
        x: 136 + (next.frame % 3) - 1,
        y: 20,
        alpha: 0.5,
        speed: 0.8 + (next.frame % 2) * 0.3,
      });
    }
  }
  // Ambient steam from left cup
  if (next.frame % 6 === 0) {
    next.steamParticles.push({
      x: 10 + (next.frame % 2),
      y: 23,
      alpha: 0.25,
      speed: 0.5,
    });
  }

  return next;
}

/** Create initial scene */
export function createInitialScene(): BaristaScene {
  return {
    frame: 0,
    baristaX: 80,
    isWalking: false,
    state: "idle",
    idleSub: "wipe",
    idleSubFrame: 0,
    idleSubIdx: 0,
    clients: [],
    clientIdCounter: 0,
    nextClientFrame: 30,
    steamParticles: [],
    cat: { x: -8, active: false, direction: 1 },
    expression: "neutral",
  };
}
