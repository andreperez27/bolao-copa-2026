const LETRAS = Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i));

export const R32_MAPPING = [
  { id: "dez-1",  slot1: { grupo: "A", pos: 1 }, slot2: { grupo: "B", pos: 2 }, type: "A" },
  { id: "dez-2",  slot1: { grupo: "C", pos: 1 }, slot2: { grupo: "D", pos: 2 }, type: "A" },
  { id: "dez-3",  slot1: { grupo: "E", pos: 1 }, slot2: { grupo: "F", pos: 2 }, type: "A" },
  { id: "dez-4",  slot1: { grupo: "G", pos: 1 }, slot2: { grupo: "H", pos: 2 }, type: "A" },
  { id: "dez-5",  slot1: { grupo: "I", pos: 1 }, slot2: { grupo: "J", pos: 2 }, type: "A" },
  { id: "dez-6",  slot1: { grupo: "K", pos: 1 }, slot2: { grupo: "L", pos: 2 }, type: "A" },
  { id: "dez-7",  slot1: { grupo: "B", pos: 1 }, slot2: { grupo: "A", pos: 2 }, type: "A" },
  { id: "dez-8",  slot1: { grupo: "D", pos: 1 }, slot2: { grupo: "C", pos: 2 }, type: "A" },
  { id: "dez-9",  slot1: { grupo: "F", pos: 1 }, slot2: { grupo: "E", pos: 2 }, type: "A" },
  { id: "dez-10", slot1: { grupo: "H", pos: 1 }, slot2: { grupo: "G", pos: 2 }, type: "A" },
  { id: "dez-11", slot1: { grupo: "J", pos: 1 }, slot2: { grupo: "I", pos: 2 }, type: "A" },
  { id: "dez-12", slot1: { grupo: "L", pos: 1 }, slot2: { grupo: "K", pos: 2 }, type: "A" },
  { id: "dez-13", slot1: { grupo: "3A", pos: 3 }, slot2: { grupo: "3B", pos: 3 }, type: "B" },
  { id: "dez-14", slot1: { grupo: "3C", pos: 3 }, slot2: { grupo: "3D", pos: 3 }, type: "B" },
  { id: "dez-15", slot1: { grupo: "3E", pos: 3 }, slot2: { grupo: "3F", pos: 3 }, type: "B" },
  { id: "dez-16", slot1: { grupo: "3G", pos: 3 }, slot2: { grupo: "3H", pos: 3 }, type: "B" },
];

export const OITAVAS_MAPPING = [
  { id: "oit-1", slot1: { match: "dez-1", pos: "winner" }, slot2: { match: "dez-3", pos: "winner" } },
  { id: "oit-2", slot1: { match: "dez-2", pos: "winner" }, slot2: { match: "dez-4", pos: "winner" } },
  { id: "oit-3", slot1: { match: "dez-7", pos: "winner" }, slot2: { match: "dez-8", pos: "winner" } },
  { id: "oit-4", slot1: { match: "dez-5", pos: "winner" }, slot2: { match: "dez-6", pos: "winner" } },
  { id: "oit-5", slot1: { match: "dez-9", pos: "winner" }, slot2: { match: "dez-11", pos: "winner" } },
  { id: "oit-6", slot1: { match: "dez-10", pos: "winner" }, slot2: { match: "dez-12", pos: "winner" } },
  { id: "oit-7", slot1: { match: "dez-13", pos: "winner" }, slot2: { match: "dez-15", pos: "winner" } },
  { id: "oit-8", slot1: { match: "dez-14", pos: "winner" }, slot2: { match: "dez-16", pos: "winner" } },
];

export const QUARTAS_MAPPING = [
  { id: "qua-1", slot1: { match: "oit-1", pos: "winner" }, slot2: { match: "oit-3", pos: "winner" } },
  { id: "qua-2", slot1: { match: "oit-2", pos: "winner" }, slot2: { match: "oit-4", pos: "winner" } },
  { id: "qua-3", slot1: { match: "oit-5", pos: "winner" }, slot2: { match: "oit-7", pos: "winner" } },
  { id: "qua-4", slot1: { match: "oit-6", pos: "winner" }, slot2: { match: "oit-8", pos: "winner" } },
];

export const SEMI_MAPPING = [
  { id: "sem-1", slot1: { match: "qua-1", pos: "winner" }, slot2: { match: "qua-2", pos: "winner" } },
  { id: "sem-2", slot1: { match: "qua-3", pos: "winner" }, slot2: { match: "qua-4", pos: "winner" } },
];

export const FINAL_MAPPING = [
  { id: "fin-1", slot1: { match: "sem-1", pos: "winner" }, slot2: { match: "sem-2", pos: "winner" } },
];
