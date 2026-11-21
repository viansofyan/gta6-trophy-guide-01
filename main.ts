// Leonida Platinum — entry program (Node 22, standard library only).
// The guide is the app/ folder beside this file: static files a browser opens
// at app/index.html (plain scripts and CSS, no build step), offline — it loads
// nothing over the network except its own trophy list. This program hands it
// in: it copies app/ and screenshots/ from beside this file into the output
// directory and writes output/dossier.json, the summary the judge reads, using
// the vendored make.fun library. Leave vendor/makefun-frontend.ts as it is:
// the scorer rebuilds the dossier with its own copy and compares byte for byte.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for the output directory:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps: text_max_bytes shapes the bytes; the rest refuse an
// entry the scorer would refuse (more than 4 screenshots or one over 256 KiB;
// more than 993 files and directories in app/ or 48 MiB of app files).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
