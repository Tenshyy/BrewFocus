import type { ClientNPC, NpcActivity, BaristaColors, BaristaScene } from "./baristaTypes";
import { W, SEAT_POSITIONS } from "./baristaTypes";

const ACTIVITIES: NpcActivity[] = ["idle", "laptop", "newspaper", "wave", "chat"];

/** Create a new client NPC with variety */
export function createClient(id: number, seatIdx: number, colors: BaristaColors): ClientNPC {
  const shirts = [colors.CLI_SHIRT1, colors.CLI_SHIRT2, colors.CLI_SHIRT3];
  const hairs = [colors.HAIR, colors.HAIR_LT, colors.COFFEE];
  const skins = [colors.SKIN, colors.SKIN2];

  return {
    id,
    phase: "entering",
    seatX: SEAT_POSITIONS[seatIdx],
    walkX: W + 5,
    frame: 0,
    shirtColor: shirts[id % shirts.length],
    hairColor: hairs[id % hairs.length],
    skinColor: skins[id % skins.length],
    hasHat: id % 3 === 0,
    hasGlasses: id % 5 === 2,
    bodyType: id % 4 === 0 ? "slim" : "regular",
    activity: ACTIVITIES[(id * 3) % ACTIVITIES.length],
  };
}

/** Update a single client's state machine */
export function updateClient(client: ClientNPC): ClientNPC {
  const c = { ...client, frame: client.frame + 1 };
  switch (c.phase) {
    case "entering":
      c.walkX -= 2;
      if (c.walkX <= c.seatX) {
        c.phase = "sitting";
        c.frame = 0;
      }
      break;
    case "sitting":
      if (c.frame > 12) {
        c.phase = "waiting";
        c.frame = 0;
      }
      break;
    case "waiting":
      if (c.frame > 18) {
        c.phase = "drinking";
        c.frame = 0;
      }
      break;
    case "drinking":
      if (c.frame > 42) {
        c.phase = "leaving";
        c.frame = 0;
        c.walkX = c.seatX;
      }
      break;
    case "leaving":
      c.walkX += 2;
      break;
  }
  return c;
}

/** Check if we should spawn a new client, and update all clients */
export function updateClients(scene: BaristaScene, colors: BaristaColors): BaristaScene {
  const next = { ...scene };
  const f = next.frame;

  // Spawn new clients periodically
  if (f >= next.nextClientFrame) {
    const occupiedSeats = next.clients
      .filter((c) => c.phase !== "leaving")
      .map((c) => SEAT_POSITIONS.indexOf(c.seatX));
    const freeSeats = [0, 1, 2].filter((i) => !occupiedSeats.includes(i));
    if (freeSeats.length > 0) {
      const seatIdx = freeSeats[Math.floor((f * 7) % freeSeats.length)];
      next.clients = [...next.clients, createClient(next.clientIdCounter, seatIdx, colors)];
      next.clientIdCounter++;
    }
    // Next client in 60-120 frames (~10-20s) with per-NPC offset
    next.nextClientFrame = f + 60 + ((f * 13 + next.clientIdCounter * 7) % 60);
  }

  // Update existing clients
  next.clients = next.clients
    .map(updateClient)
    .filter((c) => !(c.phase === "leaving" && c.walkX > W + 10));

  return next;
}
