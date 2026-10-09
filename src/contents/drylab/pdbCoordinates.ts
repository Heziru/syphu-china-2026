export type Atom = {
  chain: string;
  residue: string;
  residueName: string;
  name: string;
  element: string;
  position: [number, number, number];
};
export type Contact = { left: Atom; right: Atom; distance: number };
export type PdbData = {
  atoms: Atom[];
  chains: string[];
  traces: { chain: string; points: Atom[] }[];
  contacts: Contact[];
  interfaceResidues: Set<string>;
  center: [number, number, number];
  radius: number;
  modelCount: number;
};
export function residueKey(atom: Atom) {
  return `${atom.chain}:${atom.residue}`;
}
function distanceSq(a: Atom, b: Atom) {
  return a.position.reduce(
    (sum, value, i) => sum + (value - b.position[i]) ** 2,
    0,
  );
}
/** Read the first deposited model; retain author chain IDs and insertion codes. */
export function parsePdb(source: string): PdbData {
  const lines = source.split(/\r?\n/);
  const atoms: Atom[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    if (line.startsWith("ENDMDL")) break;
    if (!line.startsWith("ATOM  ") || ![" ", "A"].includes(line[16])) continue;
    const chain = line[21].trim() || "_";
    const residue = line.slice(22, 27).trim();
    const name = line.slice(12, 16).trim();
    const key = `${chain}:${residue}:${name}`;
    const position = [30, 38, 46].map((start) =>
      Number(line.slice(start, start + 8)),
    ) as [number, number, number];
    if (position.some((value) => !Number.isFinite(value)) || seen.has(key))
      continue;
    seen.add(key);
    atoms.push({
      chain,
      residue,
      residueName: line.slice(17, 20).trim(),
      name,
      element: line.slice(76, 78).trim() || name.replace(/[0-9]/g, "")[0],
      position,
    });
  }
  if (!atoms.length)
    throw new Error("This file contains no readable protein coordinates.");
  const chains = [...new Set(atoms.map((atom) => atom.chain))];
  const traces: PdbData["traces"] = [];
  for (const chain of chains) {
    let segment: Atom[] = [];
    for (const atom of atoms.filter(
      (a) => a.chain === chain && a.name === "CA",
    )) {
      if (
        segment.length &&
        distanceSq(segment[segment.length - 1], atom) > 25
      ) {
        traces.push({ chain, points: segment });
        segment = [];
      }
      segment.push(atom);
    }
    if (segment.length) traces.push({ chain, points: segment });
  }
  const heavy = atoms.filter((atom) => !["H", "D"].includes(atom.element));
  // ponytail: pairwise scan is bounded to these small reference structures (< 2,500 atoms).
  const contactMap = new Map<string, Contact>();
  for (let i = 0; i < heavy.length; i++) {
    for (let j = i + 1; j < heavy.length; j++) {
      const left = heavy[i],
        right = heavy[j];
      if (left.chain === right.chain) continue;
      const distance = Math.sqrt(distanceSq(left, right));
      if (distance >= 4) continue;
      const key = `${residueKey(left)}|${residueKey(right)}`;
      if (!contactMap.has(key) || contactMap.get(key)!.distance > distance)
        contactMap.set(key, { left, right, distance });
    }
  }
  const contacts = [...contactMap.values()].sort(
    (a, b) => a.distance - b.distance,
  );
  const interfaceResidues = new Set(
    contacts.flatMap(({ left, right }) => [
      residueKey(left),
      residueKey(right),
    ]),
  );
  const center = [0, 1, 2].map(
    (i) =>
      atoms.reduce((sum, atom) => sum + atom.position[i], 0) / atoms.length,
  ) as [number, number, number];
  const radius = Math.max(
    ...atoms.map((atom) =>
      Math.hypot(...atom.position.map((value, i) => value - center[i])),
    ),
  );
  return {
    atoms,
    chains,
    traces,
    contacts,
    interfaceResidues,
    center,
    radius,
    modelCount: Math.max(
      1,
      lines.filter((line) => line.startsWith("MODEL ")).length,
    ),
  };
}
