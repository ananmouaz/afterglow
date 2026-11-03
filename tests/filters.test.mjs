import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source = await readFile(new URL('../src/engine.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source + '\nexport { applyFilm };', { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { applyFilm, films } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const base = { film: 'original', strength: 100, grain: 0, leak: false, exposure: 0, flash: 0 };
function process(pixels, options = {}, clamp = true) {
  const data = clamp ? new Uint8ClampedArray(pixels.flat()) : new Float64Array(pixels.flat());
  const ctx = { getImageData: () => ({ data }), putImageData: () => {} };
  applyFilm({ width: pixels.length, height: 1, getContext: () => ctx }, { ...base, ...options });
  return Array.from({ length: pixels.length }, (_, i) => Array.from(data.slice(i * 4, i * 4 + 4)));
}
const ramp = Array.from({ length: 256 }, (_, i) => [i, i, i, 255]);
const colors = [[255, 0, 0, 255], [255, 80, 0, 255], [255, 190, 0, 255], [0, 255, 0, 128], [0, 0, 255, 0], [254, 251, 245, 255], [193, 135, 107, 255], [82, 54, 42, 255]];
test('Original and zero intensity preserve exact RGBA, including transparency', () => {
  assert.deepEqual(process([...ramp, ...colors]), [...ramp, ...colors]);
  for (const { id } of films) assert.deepEqual(process([...ramp, ...colors], { film: id, strength: 0 }), [...ramp, ...colors]);
});
test('Natural and Rich preserve neutral, monotone grayscale and white', () => {
  for (const film of ['instax', 'instax-rich']) {
    const out = process(ramp, { film });
    out.forEach(([r, g, b], i) => { assert.equal(r, g); assert.equal(g, b); if (i) assert.ok(r >= out[i - 1][0]); });
    assert.deepEqual(out.at(-1), [255, 255, 255, 255]);
    assert.ok(out[220][0] > out[200][0], 'bright detail remains distinct');
  }
});
test('Color grades retain bright color differences, near-white detail and alpha', () => {
  for (const { id } of films.filter(f => !['original', 'noir'].includes(f.id))) {
    const out = process(colors, { film: id });
    out.forEach((p, i) => assert.equal(p[3], colors[i][3]));
    assert.notDeepEqual(out[0], out[1]); assert.notDeepEqual(out[1], out[2]);
    assert.ok(out[5][0] > out[5][2], `${id}: warm near-white detail retained`);
  }
});
test('Monochrome keeps all channels equal with monotone bright and dark detail', () => {
  const out = process(ramp, { film: 'noir' });
  out.forEach(([r, g, b], i) => { assert.equal(r, g); assert.equal(g, b); if (i) assert.ok(r >= out[i - 1][0]); });
  assert.ok(out[240][0] > out[220][0]); assert.ok(out[35][0] > out[15][0]);
});
test('Half strength is the halfway blend and existing exposure/flash/grain still work', () => {
  for (const { id } of films) {
    const full = process(colors, { film: id });
    const half = process(colors, { film: id, strength: 50 });
    // One-row fixture is at top edge: creative vignette is applied after intensity.
    // Use Instant profiles, which intentionally have no automatic vignette.
    if (id.startsWith('instax')) half.forEach((p, i) => p.slice(0, 3).forEach((v, j) => assert.ok(Math.abs(v - (colors[i][j] + full[i][j]) / 2) <= 1)));
  }
  const gray = [[100, 100, 100, 255]];
  assert.ok(process(gray, { exposure: 1 })[0][0] > 100);
  assert.notDeepEqual(process(gray, { flash: 100 }), gray);
  assert.notDeepEqual(process(gray, { grain: 100 }), gray);
  assert.deepEqual(process(gray, { grain: 100 }), process(gray, { grain: 100 }), 'grain stays deterministic');
});

test('Unclamped color math stays finite and inside sRGB over a 4,913-color grid', () => {
  const samples = [];
  for (let r = 0; r <= 16; r++) for (let g = 0; g <= 16; g++) for (let b = 0; b <= 16; b++) samples.push([r * 255 / 16, g * 255 / 16, b * 255 / 16, 255]);
  for (const { id } of films) for (const rgba of process(samples, { film: id }, false)) {
    for (const channel of rgba.slice(0, 3)) assert.ok(Number.isFinite(channel) && channel >= -1e-8 && channel <= 255 + 1e-8, `${id}: ${rgba}`);
  }
});
