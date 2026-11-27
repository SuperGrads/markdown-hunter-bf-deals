// Markdown Hunter's hand-in program (Node 22, standard library only).
//
// It copies the static site (app/) and its screenshots (screenshots/) into the output directory and writes
// dossier.json with the kit's unchanged vendor/makefun-frontend.ts. The grader gives it /output; locally,
// MAKEFUN_OUTPUT_DIR stands in:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Both runs must write identical bytes, so nothing here reads the clock, the environment (beyond the output path)
// or the network, and files are copied in a sorted, fixed order.

import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps, as the starter passes them.
const LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};

/** Copy a directory tree file by file, in name order, skipping dotfiles. */
function copyTree(from: string, to: string): number {
  mkdirSync(to, { recursive: true });
  let files = 0;
  for (const name of readdirSync(from).sort()) {
    if (name.startsWith('.')) continue;
    const src = join(from, name);
    const dest = join(to, name);
    const info = statSync(src);
    if (info.isDirectory()) files += copyTree(src, dest);
    else if (info.isFile()) {
      copyFileSync(src, dest);
      files += 1;
    }
  }
  return files;
}

/** Start from a clean output so a second run cannot inherit anything from the first. */
function resetOutput(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const name of ['app', 'screenshots', 'dossier.json']) rmSync(join(dir, name), { recursive: true, force: true });
}

/** Refuse a hand-in the gate would refuse anyway, with a message that says why: no page, or not 3–4 screenshots. */
function assertHandInShape(root: string): void {
  if (!existsSync(join(root, 'app', 'index.html'))) throw new Error('app/index.html is missing');
  const shots = readdirSync(join(root, 'screenshots')).filter((n) => !n.startsWith('.') && /\.(jpe?g|png)$/i.test(n));
  if (shots.length < 3 || shots.length > LIMITS.screenshots.max) throw new Error(`screenshots/ holds ${shots.length} images; 3 to 4 are required`);
  for (const name of shots) {
    const bytes = statSync(join(root, 'screenshots', name)).size;
    if (bytes > LIMITS.screenshots.max_bytes) throw new Error(`screenshots/${name} is ${bytes} bytes, over 256 KiB`);
  }
}

assertHandInShape(repoRoot);
resetOutput(outDir);
const appFiles = copyTree(join(repoRoot, 'app'), join(outDir, 'app'));
const shotFiles = copyTree(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'));
writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, LIMITS));
console.log(`Markdown Hunter: ${appFiles} app files, ${shotFiles} screenshots, dossier.json written to ${outDir}`);
