// "Cari Perbedaan" — entry program for make.fun's spot-the-difference bounty.
// It hands the game in: copies game/ and screenshots/ from beside this file
// into the output directory and writes the dossier.json the judge reads,
// built with the kit's vendored library. Node 22, standard library only.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The gate refuses an entry with no playable page, so fail loudly here
// instead of handing in an empty folder: the game must exist to be judged.
if (!existsSync(join(here, "game", "index.html"))) {
  console.error("game/index.html is missing — nothing playable to hand in");
  process.exit(1);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, "game"), join(out, "game"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
if (existsSync(join(here, "screenshots"))) {
  cpSync(join(here, "screenshots"), join(out, "screenshots"), {
    recursive: true,
  });
}

writeFileSync(
  join(out, "dossier.json"),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
