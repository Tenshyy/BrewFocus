import type { BaristaColors, ClientNPC, BaristaScene, FacialExpression } from "./baristaTypes";
import { W } from "./baristaTypes";
import { getBaristaTargetX, getWalkCycle, getIdleSubParams } from "./baristaState";

// ─── Pixel helper ───────────────────────────────────────────
function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// ─── Background ─────────────────────────────────────────────
function drawBackground(ctx: CanvasRenderingContext2D, frame: number, C: BaristaColors) {
  // Wall
  px(ctx, 0, 0, W, 30, C.BG);

  // === LEFT SECTION: shelves + cups ===
  px(ctx, 3, 6, 28, 2, C.SHELF);
  px(ctx, 3, 7, 28, 1, C.SHELF_HI);
  px(ctx, 6, 3, 4, 3, C.CUP);
  px(ctx, 7, 2, 2, 1, C.CUP);
  px(ctx, 14, 4, 3, 2, C.CUP_O);
  px(ctx, 14, 3, 3, 1, C.CUP_O);
  px(ctx, 21, 3, 4, 3, C.CUP);
  px(ctx, 22, 2, 2, 1, C.CUP);

  // Shelf 2 (lower)
  px(ctx, 3, 16, 28, 2, C.SHELF);
  px(ctx, 3, 17, 28, 1, C.SHELF_HI);
  px(ctx, 5, 11, 3, 5, C.BOTTLE_G);
  px(ctx, 5, 10, 3, 1, C.CUP);
  px(ctx, 11, 12, 3, 4, C.BOTTLE_R);
  px(ctx, 11, 11, 3, 1, C.CUP);
  px(ctx, 17, 11, 3, 5, C.COFFEE);
  px(ctx, 17, 10, 3, 1, C.CUP);
  px(ctx, 23, 12, 3, 4, C.BOTTLE_G);
  px(ctx, 23, 11, 3, 1, C.CUP);

  // === Menu board ===
  px(ctx, 36, 4, 22, 16, C.BLACK);
  px(ctx, 37, 5, 20, 14, C.CTR);
  for (let i = 0; i < 4; i++) {
    px(ctx, 39, 7 + i * 3, 14, 1, C.MENU_TXT);
    px(ctx, 39, 8 + i * 3, 8 - i, 1, C.SHELF_HI);
  }

  // === Wall clock (between shelves and menu) ===
  drawWallClock(ctx, 32, 2, frame, C);

  // === Picture frames ===
  px(ctx, 62, 4, 7, 6, C.MACH_DK);
  px(ctx, 63, 5, 5, 4, C.BOTTLE_G);
  px(ctx, 62, 14, 5, 5, C.MACH_DK);
  px(ctx, 63, 15, 3, 3, C.BOTTLE_R);

  // === Hanging lamps with light cones ===
  drawLamp(ctx, 72, 0, 3, frame, 0, C);
  drawLamp(ctx, 94, 0, 4, frame, 0, C);
  drawLamp(ctx, 114, 0, 3, frame, 14, C);

  // === Window (right wall area) ===
  drawWindow(ctx, 78, 4, frame, C);

  // === Coffee machine (enhanced) ===
  drawEspressoMachine(ctx, frame, C);

  // Right wall bottles
  px(ctx, 150, 2, 3, 4, C.BOTTLE_R);
  px(ctx, 150, 1, 3, 1, C.CUP);
  px(ctx, 155, 3, 3, 3, C.COFFEE);
  px(ctx, 155, 2, 3, 1, C.CUP);

  // === Bar stools ===
  drawStool(ctx, 30, C);
  drawStool(ctx, 55, C);
  drawStool(ctx, 100, C);

  // === Plants ===
  drawPlant(ctx, 148, 24, C);
}

// ─── Wall Clock ─────────────────────────────────────────────
function drawWallClock(ctx: CanvasRenderingContext2D, cx: number, cy: number, _frame: number, C: BaristaColors) {
  // Clock body
  px(ctx, cx, cy, 5, 5, C.MACH);
  px(ctx, cx + 1, cy + 1, 3, 3, C.CUP);
  // Center dot
  px(ctx, cx + 2, cy + 2, 1, 1, C.BLACK);
  // Hour hand (points based on real hour)
  const hour = new Date().getHours() % 12;
  if (hour < 3 || hour >= 9) {
    px(ctx, cx + 2, cy + 1, 1, 1, C.BLACK); // up
  } else if (hour < 6) {
    px(ctx, cx + 3, cy + 2, 1, 1, C.BLACK); // right
  } else {
    px(ctx, cx + 2, cy + 3, 1, 1, C.BLACK); // down
  }
  // Minute hand
  const min = new Date().getMinutes();
  if (min < 15) px(ctx, cx + 2, cy, 1, 1, C.EYE);
  else if (min < 30) px(ctx, cx + 4, cy + 2, 1, 1, C.EYE);
  else if (min < 45) px(ctx, cx + 2, cy + 4, 1, 1, C.EYE);
  else px(ctx, cx, cy + 2, 1, 1, C.EYE);
}

// ─── Window with weather ────────────────────────────────────
function drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, C: BaristaColors) {
  // Window frame
  px(ctx, x, y, 12, 12, C.MACH_DK);
  px(ctx, x + 1, y + 1, 10, 10, "#3A5070"); // sky blue-ish
  // Window cross
  px(ctx, x + 5, y + 1, 2, 10, C.MACH_DK);
  px(ctx, x + 1, y + 5, 10, 2, C.MACH_DK);

  // Weather: rain effect (subtle falling 1px lines)
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 19) {
    // Daytime — sun glow
    px(ctx, x + 3, y + 2, 2, 2, C.LAMP);
  } else {
    // Night — stars
    if (frame % 8 < 6) px(ctx, x + 2, y + 3, 1, 1, C.CUP);
    if (frame % 10 < 7) px(ctx, x + 8, y + 2, 1, 1, C.CUP);
  }
}

// ─── Lamp with light cone ───────────────────────────────────
function drawLamp(ctx: CanvasRenderingContext2D, x: number, y: number, rodH: number, frame: number, offset: number, C: BaristaColors) {
  px(ctx, x, y, 2, rodH, C.SHELF);
  px(ctx, x - 3, y + rodH, 8, 3, C.MACH_DK);
  const flicker = (frame + offset) % 30 < 28 ? C.LAMP : C.SHELF_HI;
  px(ctx, x - 2, y + rodH + 3, 6, 1, flicker);

  // Light cone (subtle transparency)
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = 0.04;
  // Triangular light cone approximation
  for (let i = 1; i <= 6; i++) {
    px(ctx, x - 2 - i, y + rodH + 3 + i * 2, 6 + i * 2, 2, C.LAMP);
  }
  ctx.globalAlpha = prevAlpha;
}

// ─── Espresso Machine (enhanced) ────────────────────────────
function drawEspressoMachine(ctx: CanvasRenderingContext2D, frame: number, C: BaristaColors) {
  px(ctx, 126, 6, 22, 18, C.MACH);
  px(ctx, 127, 7, 20, 5, C.MACH_DK);
  // Gauges
  px(ctx, 129, 8, 3, 3, C.BLACK);
  px(ctx, 134, 8, 3, 3, C.BLACK);
  // Pressure gauge needle
  const needlePos = frame % 6 < 3 ? 0 : 1;
  px(ctx, 130, 9 + needlePos, 1, 1, C.CUP_O);
  // Blinking LED
  const led = frame % 12 < 8 ? C.GREEN_LED : C.BLACK;
  px(ctx, 139, 8, 3, 3, led);
  px(ctx, 127, 13, 20, 1, C.SHELF_HI);
  px(ctx, 129, 16, 16, 7, C.MACH_DK);
  // Portafilter
  px(ctx, 133, 14, 4, 2, C.MACH_DK);
  px(ctx, 134, 16, 2, 2, C.BLACK);
  // Drip tray
  px(ctx, 134, 23, 6, 2, C.BLACK);
}

// ─── Stool ──────────────────────────────────────────────────
function drawStool(ctx: CanvasRenderingContext2D, x: number, C: BaristaColors) {
  px(ctx, x, 36, 8, 2, C.STOOL_HI);
  px(ctx, x + 1, 38, 2, 6, C.STOOL);
  px(ctx, x + 5, 38, 2, 6, C.STOOL);
  px(ctx, x, 41, 8, 1, C.STOOL);
}

// ─── Plant ──────────────────────────────────────────────────
function drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number, C: BaristaColors) {
  // Terracotta pot
  px(ctx, x, y + 2, 5, 3, C.CUP_O);
  px(ctx, x + 1, y + 5, 3, 1, C.CUP_O);
  // Green leaves
  px(ctx, x + 1, y, 3, 2, C.BOTTLE_G);
  px(ctx, x, y - 1, 2, 2, C.BOTTLE_G);
  px(ctx, x + 3, y - 1, 2, 2, C.BOTTLE_G);
  px(ctx, x + 2, y - 2, 1, 1, C.BOTTLE_G);
}

// ─── Counter ────────────────────────────────────────────────
function drawCounter(ctx: CanvasRenderingContext2D, C: BaristaColors) {
  px(ctx, 0, 29, W, 2, C.CTR_TOP);
  px(ctx, 0, 31, W, 17, C.CTR);
  px(ctx, 0, 35, W, 1, C.CTR_LINE);
  px(ctx, 0, 41, W, 1, C.CTR_LINE);
  px(ctx, 0, 47, W, 1, C.BLACK);
}

// ─── Counter Items ──────────────────────────────────────────
function drawCounterItems(ctx: CanvasRenderingContext2D, scene: BaristaScene, C: BaristaColors) {
  const { state, frame, idleSub } = scene;

  // Cup far left
  px(ctx, 8, 25, 5, 4, C.CUP);
  px(ctx, 9, 24, 3, 1, C.CUP);
  px(ctx, 9, 26, 3, 2, C.COFFEE);

  // Plate with pastry
  px(ctx, 42, 26, 8, 2, C.MACH);
  px(ctx, 44, 24, 4, 2, C.CUP_O);

  // Second plate
  px(ctx, 118, 27, 6, 1, C.MACH);
  px(ctx, 119, 25, 4, 2, C.BOTTLE_R);

  // Cash register
  px(ctx, 108, 23, 10, 6, C.MACH_DK);
  px(ctx, 109, 24, 8, 3, C.BLACK);
  px(ctx, 110, 25, 2, 1, C.GREEN_LED);

  // Cup right side
  px(ctx, 140, 25, 5, 4, C.CUP_O);
  px(ctx, 141, 24, 3, 1, C.CUP_O);

  // Organize cups animation
  if (state === "idle" && idleSub === "organize") {
    const cupX = 58 + (frame % 6 < 3 ? 0 : 4);
    px(ctx, cupX, 25, 5, 4, C.CUP);
    px(ctx, cupX + 1, 24, 3, 1, C.CUP);
  }

  // Serving cup slide
  if (state === "serving") {
    const slideX = frame % 4 < 2 ? 82 : 74;
    px(ctx, slideX, 25, 5, 4, C.CUP);
    px(ctx, slideX + 1, 24, 3, 1, C.CUP);
    px(ctx, slideX + 1, 26, 3, 2, C.COFFEE);
    // Latte art on cup (drawn over 4 frames)
    const artFrame = frame % 8;
    if (artFrame < 4) {
      px(ctx, slideX + 2, 26, 1, 1, C.CUP);
      if (artFrame > 1) px(ctx, slideX + 1, 27, 1, 1, C.CUP);
    }
  }

  // Celebration confetti
  if (state === "celebrating") {
    const colors = [C.CTR_TOP, C.BOTTLE_G, C.CUP, C.CUP_O];
    for (let i = 0; i < 12; i++) {
      const cx = 50 + ((frame * 3 + i * 13) % 60);
      const cy = 2 + ((frame * 2 + i * 7) % 24);
      px(ctx, cx, cy, 2, 2, colors[i % 4]);
    }
  }
}

// ─── Steam Particles ────────────────────────────────────────
function drawSteamParticles(ctx: CanvasRenderingContext2D, scene: BaristaScene) {
  for (const p of scene.steamParticles) {
    if (p.alpha > 0 && p.y > 8) {
      ctx.fillStyle = `rgba(240,235,229,${p.alpha})`;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    }
  }
}

// ─── Cat (ambient) ──────────────────────────────────────────
function drawCat(ctx: CanvasRenderingContext2D, scene: BaristaScene, C: BaristaColors) {
  if (!scene.cat.active) return;
  const x = Math.round(scene.cat.x);
  const y = 44;
  // Body
  px(ctx, x, y, 6, 3, C.MACH_DK);
  // Head
  px(ctx, x + (scene.cat.direction > 0 ? 5 : -1), y - 1, 3, 3, C.MACH_DK);
  // Ears
  px(ctx, x + (scene.cat.direction > 0 ? 5 : 0), y - 2, 1, 1, C.MACH_DK);
  px(ctx, x + (scene.cat.direction > 0 ? 7 : -1), y - 2, 1, 1, C.MACH_DK);
  // Tail
  const tailWag = scene.frame % 4 < 2 ? -1 : 0;
  px(ctx, x + (scene.cat.direction > 0 ? -1 : 6), y + tailWag, 2, 1, C.MACH_DK);
  // Eyes
  px(ctx, x + (scene.cat.direction > 0 ? 6 : 0), y, 1, 1, C.GREEN_LED);
}

// ─── Barista Front ──────────────────────────────────────────
function drawBaristaFront(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  look: number,
  laDx: number, laDy: number,
  raDx: number, raDy: number,
  item: string,
  itemHand: "left" | "right",
  expression: FacialExpression,
  C: BaristaColors
) {
  // Hat
  px(ctx, bx - 5, by, 12, 3, C.HAT);
  px(ctx, bx - 6, by + 2, 14, 1, C.HAT_BAND);

  // Hair
  px(ctx, bx - 5, by + 3, 12, 2, C.HAIR);

  // Face
  px(ctx, bx - 4, by + 5, 10, 6, C.SKIN);

  // Eyes
  px(ctx, bx - 2 + look, by + 7, 2, 2, C.EYE);
  px(ctx, bx + 3 + look, by + 7, 2, 2, C.EYE);

  // Expression-based mouth
  if (expression === "smile") {
    px(ctx, bx - 1, by + 10, 4, 1, C.MOUTH);
    px(ctx, bx, by + 10, 2, 1, C.CUP); // teeth
  } else if (expression === "focused") {
    px(ctx, bx, by + 10, 2, 1, C.MOUTH);
    // Brow furrow
    px(ctx, bx - 2, by + 6, 2, 1, C.HAIR);
    px(ctx, bx + 3, by + 6, 2, 1, C.HAIR);
  } else {
    px(ctx, bx, by + 10, 2, 1, C.MOUTH);
  }

  // Neck
  px(ctx, bx - 1, by + 11, 4, 1, C.SKIN);

  // Body / Shirt
  px(ctx, bx - 5, by + 12, 12, 12, C.SHIRT);

  // Apron
  px(ctx, bx - 4, by + 14, 10, 10, C.APRON);
  px(ctx, bx - 2, by + 14, 6, 1, C.APRON_STR);
  px(ctx, bx - 1, by + 15, 4, 2, C.APRON_STR);

  // Left arm
  const laBaseX = bx - 7;
  const laBaseY = by + 14;
  px(ctx, laBaseX + laDx, laBaseY + laDy, 3, 8, C.SHIRT);
  px(ctx, laBaseX + laDx, laBaseY + laDy + 8, 3, 2, C.SKIN);

  // Right arm
  const raBaseX = bx + 7;
  const raBaseY = by + 14;
  px(ctx, raBaseX + raDx, raBaseY + raDy, 3, 8, C.SHIRT);
  px(ctx, raBaseX + raDx, raBaseY + raDy + 8, 3, 2, C.SKIN);

  // Held item
  if (item !== "none") {
    const hx = itemHand === "right" ? raBaseX + raDx : laBaseX + laDx;
    const hy = (itemHand === "right" ? raBaseY + raDy : laBaseY + laDy) + 7;
    drawHeldItem(ctx, hx, hy, item, C);
  }
}

function drawHeldItem(ctx: CanvasRenderingContext2D, hx: number, hy: number, item: string, C: BaristaColors) {
  switch (item) {
    case "cup":
      px(ctx, hx - 1, hy, 5, 4, C.CUP);
      px(ctx, hx, hy - 1, 3, 1, C.CUP);
      px(ctx, hx, hy + 1, 3, 2, C.COFFEE);
      break;
    case "cloth":
      px(ctx, hx - 2, hy + 1, 6, 2, C.CUP);
      px(ctx, hx - 1, hy + 2, 4, 1, C.MACH);
      break;
    case "bottle":
      px(ctx, hx, hy - 2, 3, 6, C.BOTTLE_G);
      px(ctx, hx, hy - 3, 3, 1, C.CUP);
      break;
    case "shaker":
      px(ctx, hx, hy - 1, 3, 5, C.MACH);
      px(ctx, hx, hy - 2, 3, 1, C.MACH_DK);
      break;
    case "book":
      px(ctx, hx - 1, hy, 5, 4, C.BOTTLE_R);
      px(ctx, hx, hy + 1, 3, 2, C.CUP);
      break;
    case "phone":
      px(ctx, hx, hy - 1, 3, 4, C.BLACK);
      px(ctx, hx + 1, hy, 1, 2, C.CUP);
      break;
  }
}

// ─── Barista Back ───────────────────────────────────────────
function drawBaristaBack(ctx: CanvasRenderingContext2D, bx: number, by: number, frame: number, C: BaristaColors) {
  const f = frame % 12;
  const reaching = f < 6;
  const holding = f >= 4;

  // Hat
  px(ctx, bx - 5, by, 12, 3, C.HAT);
  px(ctx, bx - 6, by + 2, 14, 1, C.HAT_BAND);
  // Hair (back)
  px(ctx, bx - 5, by + 3, 12, 4, C.HAIR);
  // Neck
  px(ctx, bx - 1, by + 7, 4, 1, C.SKIN);
  // Body
  px(ctx, bx - 5, by + 8, 12, 16, C.SHIRT);
  // Apron strings
  px(ctx, bx - 3, by + 10, 2, 1, C.APRON_STR);
  px(ctx, bx + 3, by + 10, 2, 1, C.APRON_STR);
  px(ctx, bx - 1, by + 12, 4, 1, C.APRON_STR);
  // Arms
  const armY = reaching ? by + 4 : by + 14;
  px(ctx, bx - 7, armY, 3, 8, C.SHIRT);
  px(ctx, bx - 7, armY + 8, 3, 2, C.SKIN);
  px(ctx, bx + 6, armY, 3, 8, C.SHIRT);
  px(ctx, bx + 6, armY + 8, 3, 2, C.SKIN);
  // Bottle
  if (holding) {
    const hy = reaching ? by + 10 : by + 20;
    px(ctx, bx + 6, hy, 3, 5, C.BOTTLE_R);
    px(ctx, bx + 6, hy - 1, 3, 1, C.CUP);
  }
}

// ─── Client NPC ─────────────────────────────────────────────
function drawClient(ctx: CanvasRenderingContext2D, client: ClientNPC, frame: number, C: BaristaColors) {
  if (client.phase === "entering" || client.phase === "leaving") {
    drawWalkingClient(ctx, client, frame, C);
  } else {
    drawSittingClient(ctx, client, frame, C);
  }
}

function drawWalkingClient(ctx: CanvasRenderingContext2D, client: ClientNPC, frame: number, C: BaristaColors) {
  const wx = client.walkX;
  const wy = 32;
  const bw = client.bodyType === "slim" ? 6 : 8;

  // Head
  px(ctx, wx, wy, 6, 6, client.skinColor);
  px(ctx, wx, wy - 2, 6, 2, client.hairColor);
  if (client.hasHat) px(ctx, wx - 1, wy - 3, 8, 2, C.CLI_HAT);
  if (client.hasGlasses) {
    px(ctx, wx + 1, wy + 2, 2, 1, C.MACH_DK);
    px(ctx, wx + 4, wy + 2, 2, 1, C.MACH_DK);
  }

  // Eyes
  const eyeDir = client.phase === "entering" ? -1 : 1;
  px(ctx, wx + 1 + eyeDir, wy + 2, 1, 1, C.EYE);
  px(ctx, wx + 4 + eyeDir, wy + 2, 1, 1, C.EYE);

  // Body
  px(ctx, wx - 1, wy + 6, bw, 10, client.shirtColor);

  // 8-frame walk cycle for legs
  const { bobY } = getWalkCycle(frame + client.id * 3);
  const legOff = (frame + client.id) % 4 < 2 ? 0 : 1;
  px(ctx, wx, wy + 16 + bobY, 3, 3, C.MACH_DK);
  px(ctx, wx + 3 + legOff, wy + 16 + bobY, 3, 3, C.MACH_DK);
}

function drawSittingClient(ctx: CanvasRenderingContext2D, client: ClientNPC, frame: number, C: BaristaColors) {
  const sx = client.seatX;
  const sy = 22;

  // Head
  px(ctx, sx, sy, 6, 6, client.skinColor);
  px(ctx, sx, sy - 2, 6, 2, client.hairColor);
  if (client.hasHat) px(ctx, sx - 1, sy - 3, 8, 2, C.CLI_HAT);
  if (client.hasGlasses) {
    px(ctx, sx + 1, sy + 2, 2, 1, C.MACH_DK);
    px(ctx, sx + 4, sy + 2, 2, 1, C.MACH_DK);
  }

  // Eyes
  px(ctx, sx + 2, sy + 2, 1, 1, C.EYE);
  px(ctx, sx + 4, sy + 2, 1, 1, C.EYE);

  // Body
  px(ctx, sx - 1, sy + 6, 8, 6, client.shirtColor);

  // Activity-based animations
  if (client.phase === "drinking") {
    const cupPhase = (frame + client.id * 3) % 8;
    const cupLift = cupPhase < 4 ? 0 : -2;
    px(ctx, sx + 1, sy + 7 + cupLift, 3, 4, client.shirtColor);
    px(ctx, sx + 5, sy + 7, 3, 4, client.shirtColor);
    px(ctx, sx, sy + 6 + cupLift, 4, 3, C.CUP);
    px(ctx, sx + 1, sy + 5 + cupLift, 2, 1, C.CUP);
    px(ctx, sx + 1, sy + 7 + cupLift, 2, 1, C.COFFEE);
  } else if (client.activity === "laptop" && client.phase === "waiting") {
    // Laptop on counter
    px(ctx, sx - 1, sy + 8, 3, 4, client.shirtColor);
    px(ctx, sx + 5, sy + 8, 3, 4, client.shirtColor);
    px(ctx, sx + 1, sy + 6, 5, 1, C.MACH_DK); // laptop base
    px(ctx, sx + 1, sy + 3, 5, 3, C.BLACK); // laptop screen
    px(ctx, sx + 2, sy + 4, 3, 1, frame % 4 < 2 ? C.CUP : C.MACH); // typing cursor
  } else if (client.activity === "newspaper" && client.phase === "waiting") {
    // Holding newspaper
    px(ctx, sx - 1, sy + 7, 3, 5, client.shirtColor);
    px(ctx, sx + 5, sy + 7, 3, 5, client.shirtColor);
    px(ctx, sx - 2, sy + 5, 7, 5, C.CUP); // newspaper
    px(ctx, sx - 1, sy + 6, 5, 1, C.MACH); // text line
    px(ctx, sx - 1, sy + 8, 4, 1, C.MACH);
  } else if (client.activity === "wave" && client.phase === "waiting" && frame % 12 < 6) {
    // Waving hand
    px(ctx, sx - 1, sy + 8, 3, 4, client.shirtColor);
    const waveY = (frame % 6 < 3) ? -3 : -1;
    px(ctx, sx + 5, sy + 7 + waveY, 3, 4, client.shirtColor);
    px(ctx, sx + 6, sy + 6 + waveY, 2, 2, client.skinColor);
  } else {
    // Default: arms on counter
    px(ctx, sx - 1, sy + 8, 3, 4, client.shirtColor);
    px(ctx, sx + 5, sy + 8, 3, 4, client.shirtColor);
  }

  // Lower body
  px(ctx, sx, sy + 12, 6, 4, client.shirtColor);
}

// ─── Barista Main Draw ──────────────────────────────────────
function drawBarista(ctx: CanvasRenderingContext2D, scene: BaristaScene, C: BaristaColors) {
  const { frame, state, idleSub, baristaX, isWalking, expression } = scene;
  const by = 6;

  // Walking: 8-frame walk cycle
  if (isWalking) {
    const { bobY, armSwingL, armSwingR } = getWalkCycle(frame);
    const targetX = getBaristaTargetX(state, idleSub);
    const look = targetX > baristaX ? 1 : -1;
    drawBaristaFront(ctx, baristaX, by + bobY, look, armSwingL, 1, armSwingR, 1, "none", "right", "neutral", C);
    return;
  }

  // Get idle sub parameters
  const params = getIdleSubParams(idleSub, frame);

  if (state === "idle" && params.isFacingBack) {
    drawBaristaBack(ctx, baristaX, by, frame, C);
    return;
  }

  // State-specific overrides
  let { look, laDx, laDy, raDx, raDy, item, itemHand } = params;

  switch (state) {
    case "brewing": {
      const f = frame % 6;
      look = 1;
      raDx = 5;
      raDy = f < 3 ? -3 : 0;
      item = "cup";
      itemHand = "right";
      break;
    }
    case "serving": {
      const f = frame % 4;
      look = -1;
      raDx = f < 2 ? -3 : -7;
      raDy = 2;
      item = f < 2 ? "cup" : "none";
      itemHand = "right";
      break;
    }
    case "paused": {
      const f = frame % 6;
      look = f < 3 ? -1 : 1;
      raDx = 2;
      raDy = -3;
      item = "none";
      break;
    }
    case "celebrating":
      look = 0;
      laDx = -3;
      laDy = -5;
      raDx = 3;
      raDy = -5;
      item = "none";
      break;
  }

  drawBaristaFront(ctx, baristaX, by, look, laDx, laDy, raDx, raDy, item, itemHand, expression, C);
}

// ─── Main Render Function ───────────────────────────────────
export function renderScene(ctx: CanvasRenderingContext2D, scene: BaristaScene, C: BaristaColors) {
  ctx.clearRect(0, 0, W, 48);

  drawBackground(ctx, scene.frame, C);

  // Draw sitting clients (behind counter)
  for (const client of scene.clients) {
    if (client.phase !== "entering" && client.phase !== "leaving") {
      drawClient(ctx, client, scene.frame, C);
    }
  }

  drawBarista(ctx, scene, C);
  drawCounter(ctx, C);
  drawCounterItems(ctx, scene, C);
  drawSteamParticles(ctx, scene);

  // Draw walking clients (in front of counter)
  for (const client of scene.clients) {
    if (client.phase === "entering" || client.phase === "leaving") {
      drawClient(ctx, client, scene.frame, C);
    }
  }

  // Draw cat (ambient, on top of everything)
  drawCat(ctx, scene, C);
}
