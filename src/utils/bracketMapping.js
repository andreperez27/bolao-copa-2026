export const R32_MAPPING = [
  // oit-1 (73×75) → qua-1
  { id: "73", slot1: { grupo: "A", pos: 2 }, slot2: { grupo: "B", pos: 2 }, type: "A" },
  { id: "75", slot1: { grupo: "F", pos: 1 }, slot2: { grupo: "C", pos: 2 }, type: "A" },
  // oit-2 (74×77) → qua-1
  { id: "74", slot1: { grupo: "E", pos: 1 }, slot2: { pool: ["A","C","D","F","I"], pos: 3 }, type: "B" },
  { id: "77", slot1: { grupo: "I", pos: 1 }, slot2: { pool: ["B","E","F","J"], pos: 3 }, type: "B" },
  // oit-3 (76×78) → qua-3
  { id: "76", slot1: { grupo: "C", pos: 1 }, slot2: { grupo: "F", pos: 2 }, type: "A" },
  { id: "78", slot1: { grupo: "E", pos: 2 }, slot2: { grupo: "I", pos: 2 }, type: "A" },
  // oit-4 (79×80) → qua-3
  { id: "79", slot1: { grupo: "A", pos: 1 }, slot2: { pool: ["A","C","G","H","I"], pos: 3 }, type: "B" },
  { id: "80", slot1: { grupo: "L", pos: 1 }, slot2: { grupo: "K", pos: 2 }, type: "A" },
  // oit-5 (81×82) → qua-2
  { id: "81", slot1: { grupo: "D", pos: 1 }, slot2: { pool: ["A","D","E","F","G"], pos: 3 }, type: "B" },
  { id: "82", slot1: { grupo: "G", pos: 1 }, slot2: { pool: ["B","C","E","F","J"], pos: 3 }, type: "B" },
  // oit-6 (83×84) → qua-2
  { id: "83", slot1: { grupo: "K", pos: 1 }, slot2: { grupo: "L", pos: 2 }, type: "A" },
  { id: "84", slot1: { grupo: "H", pos: 1 }, slot2: { grupo: "J", pos: 2 }, type: "A" },
  // oit-7 (85×86) → qua-4
  { id: "85", slot1: { grupo: "B", pos: 1 }, slot2: { pool: ["C","E","F","I","J"], pos: 3 }, type: "B" },
  { id: "86", slot1: { grupo: "J", pos: 1 }, slot2: { grupo: "H", pos: 2 }, type: "A" },
  // oit-8 (87×88) → qua-4
  { id: "87", slot1: { pool: ["K"], pos: 3 }, slot2: { pool: ["D","E","F","I","J","L"], pos: 3 }, type: "B" },
  { id: "88", slot1: { grupo: "D", pos: 2 }, slot2: { grupo: "G", pos: 2 }, type: "A" },
];

export const OITAVAS_MAPPING = [
  { id: "oit-1", slot1: { match: "73", pos: "winner" }, slot2: { match: "75", pos: "winner" } },
  { id: "oit-2", slot1: { match: "74", pos: "winner" }, slot2: { match: "77", pos: "winner" } },
  { id: "oit-3", slot1: { match: "76", pos: "winner" }, slot2: { match: "78", pos: "winner" } },
  { id: "oit-4", slot1: { match: "79", pos: "winner" }, slot2: { match: "80", pos: "winner" } },
  { id: "oit-5", slot1: { match: "81", pos: "winner" }, slot2: { match: "82", pos: "winner" } },
  { id: "oit-6", slot1: { match: "83", pos: "winner" }, slot2: { match: "84", pos: "winner" } },
  { id: "oit-7", slot1: { match: "85", pos: "winner" }, slot2: { match: "87", pos: "winner" } },
  { id: "oit-8", slot1: { match: "86", pos: "winner" }, slot2: { match: "88", pos: "winner" } },
];

export const QUARTAS_MAPPING = [
  { id: "qua-1", slot1: { match: "oit-2", pos: "winner" }, slot2: { match: "oit-1", pos: "winner" } },
  { id: "qua-3", slot1: { match: "oit-3", pos: "winner" }, slot2: { match: "oit-4", pos: "winner" } },
  { id: "qua-2", slot1: { match: "oit-5", pos: "winner" }, slot2: { match: "oit-6", pos: "winner" } },
  { id: "qua-4", slot1: { match: "oit-7", pos: "winner" }, slot2: { match: "oit-8", pos: "winner" } },
];

export const SEMI_MAPPING = [
  { id: "sem-1", slot1: { match: "qua-1", pos: "winner" }, slot2: { match: "qua-2", pos: "winner" } },
  { id: "sem-2", slot1: { match: "qua-3", pos: "winner" }, slot2: { match: "qua-4", pos: "winner" } },
];

export const FINAL_MAPPING = [
  { id: "fin-1", slot1: { match: "sem-1", pos: "winner" }, slot2: { match: "sem-2", pos: "winner" } },
];

export const TERCEIRO_MAPPING = [
  { id: "ter-1", slot1: { match: "sem-1", pos: "loser" }, slot2: { match: "sem-2", pos: "loser" } },
];
