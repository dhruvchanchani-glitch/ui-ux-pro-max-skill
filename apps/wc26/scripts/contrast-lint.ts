/*
 * Verifies AA 4.5:1 contrast for every nation theme in the catalogue.
 *
 * Two checks per nation, both required by the PRD:
 *   1. on-primary text on primary background — body/headline legibility
 *      in the identity layer.
 *   2. nation-ink on the bone canvas (#FAFAF7) — display headlines on
 *      the utility layer.
 *
 * Exit code 1 on any failure so CI catches drift early.
 */
import { NATIONS } from "../src/data/nations";
import { contrastRatio } from "../src/lib/theme";

const CANVAS = "#FAFAF7";
const MIN_RATIO = 4.5;

let failed = 0;
const failures: string[] = [];

for (const nation of NATIONS) {
  const onPrimary = contrastRatio(
    nation.theme.onPrimary,
    nation.theme.primary
  );
  const inkOnCanvas = contrastRatio(nation.theme.ink, CANVAS);

  if (onPrimary < MIN_RATIO) {
    failed += 1;
    failures.push(
      `${nation.code} (${nation.name}): on-primary ${
        nation.theme.onPrimary
      } on primary ${nation.theme.primary} = ${onPrimary.toFixed(
        2
      )} (need ${MIN_RATIO})`
    );
  }
  if (inkOnCanvas < MIN_RATIO) {
    failed += 1;
    failures.push(
      `${nation.code} (${nation.name}): ink ${
        nation.theme.ink
      } on canvas ${CANVAS} = ${inkOnCanvas.toFixed(
        2
      )} (need ${MIN_RATIO})`
    );
  }
}

declare const process: { exit(code: number): never };

if (failed > 0) {
  console.error(`\nContrast lint FAILED: ${failed} issue(s)\n`);
  for (const f of failures) console.error("  - " + f);
  console.error("");
  process.exit(1);
}

console.log(`Contrast lint passed: ${NATIONS.length} nations OK`);
