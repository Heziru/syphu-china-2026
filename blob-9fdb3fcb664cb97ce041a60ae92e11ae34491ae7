import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const raw = readFileSync(
  path.join(root, "src/contents/team/teamRoster.json"),
  "utf8",
);
const { members, advisors, pi } = JSON.parse(raw);
const enrichmentRaw = readFileSync(
  path.join(root, "src/contents/team/mentorProfiles.json"),
  "utf8",
);
const enrichment = JSON.parse(enrichmentRaw);
const publicAdvisors = advisors.map((p) => ({ ...p, ...enrichment[p.id] }));
const publicPi = { ...pi, ...enrichment.pi };
assert.equal(members.length, 25, "The upper roster contains 25 students.");
assert.equal(
  new Set(members.map((p) => p.id)).size,
  25,
  "Duplicate cards must retain canonical IDs.",
);
assert.equal(
  advisors.length,
  3,
  "Yellow D30, E30 and G30 are separate advisors.",
);
assert.deepEqual(
  advisors.map((p) => [p.name, p.groups[0]]),
  [
    ["Lirong Zhang", "wet"],
    ["Yixin Liu", "wet"],
    ["Haibo Li", "dry"],
  ],
);
assert.equal(pi.kind, "pi");
assert.equal(pi.name, "");
assert.equal(pi.photo, "");
assert.equal(
  publicPi.name,
  "Xianpu Ni",
  "The verified PI overlay must be applied.",
);
assert.equal(publicPi.credential, "Professor · Associate Dean");
assert.equal(
  publicAdvisors.filter((p) => p.photo && p.previousYear === "2025").length,
  3,
);
assert.equal(
  publicAdvisors.find((p) => p.name === "Haibo Li").photoKind,
  "avatar",
);
for (const person of [...publicAdvisors, publicPi]) {
  assert.ok(
    person.sourceLinks?.length,
    "Publicly researched profiles need sources.",
  );
  for (const link of person.sourceLinks) {
    assert.ok(
      ["2025.igem.wiki", "sls.syphu.edu.cn", "grs.syphu.edu.cn"].includes(
        new URL(link.url).hostname,
      ),
      "Keep profile sources tied to verified institutions.",
    );
  }
}
assert.equal(
  members.filter((p) => p.photo).length,
  12,
  "Only the twelve supplied portraits are populated.",
);
assert.deepEqual(
  Object.fromEntries(
    ["wet", "dry", "art", "hp", "wiki"].map((g) => [
      g,
      members.filter((p) => p.groups.includes(g)).length,
    ]),
  ),
  { wet: 11, dry: 6, art: 3, hp: 4, wiki: 1 },
);
assert.equal(members.find((p) => p.id === "member-13").role, "Dry Lab Lead");
assert.equal(members.find((p) => p.id === "member-14").role, "Wet Lab Lead");
assert.equal(
  members.find((p) => p.id === "member-02").bio,
  "",
  "Blank source bios stay blank.",
);
assert.ok(
  !/[\u3400-\u9fff]/u.test(raw + enrichmentRaw),
  "All rendered content must be English.",
);
assert.ok(
  !/\+86|(?:^|\D)1[3-9]\d{9}(?:\D|$)|mailto:|tel:/.test(raw + enrichmentRaw),
  "Private contact column is not part of the public roster.",
);
let bytes = 0;
for (const p of [...members, ...publicAdvisors, publicPi]) {
  assert.ok(
    p.focal.every((n) => Number.isFinite(n) && n >= 0 && n <= 100),
    "Focal positions must be valid percentages.",
  );
  if (p.photo)
    for (const suffix of ["", "-small"]) {
      const filename = path.join(
        root,
        "public/assets/team",
        `${p.photo}${suffix}.webp`,
      );
      assert.ok(existsSync(filename), `Missing portrait ${filename}`);
      const size = statSync(filename).size;
      bytes += size;
      if (suffix)
        assert.ok(
          size < 100_000,
          "Opening thumbnails must remain lightweight.",
        );
    }
}
for (const filename of [
  "team-1.webp",
  "team-2.webp",
  "wet.webp",
  "dry-lab.webp",
  "hp.webp",
  "art.webp",
])
  assert.ok(existsSync(path.join(root, "public/assets/team", filename)));
console.log(
  `Team data passed: 25 students, 3 verified advisors, Professor Xianpu Ni; 12 student portraits, 4 sourced mentor images; 6 group photos. Portrait derivatives ${(bytes / 1024).toFixed(0)} KiB.`,
);
