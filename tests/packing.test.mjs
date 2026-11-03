import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source = await readFile(new URL('../src/engine.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { sheetLayout, guideLines, badgeSpot, paginate, formats, todayStamp, STAMP_CHARS } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const eps = 1e-5;
const expected = { mini: [[2, 2], [2, 2], [3, 3], [4, 4], [4, 5], [10, 11]], square: [[1, 1], [2, 2], [2, 2], [2, 2], [4, 4], [8, 8]], wide: [[1, 1], [1, 1], [1, 1], [2, 2], [2, 2], [4, 5]], strip: [[0, 0], [2, 2], [2, 2], [2, 2], [4, 4], [8, 8]], peel: [[1, 1], [1, 1], [1, 1], [2, 2], [2, 2], [4, 5]] };
const papers = [{ width: 90, height: 130 }, { width: 100, height: 150 }, { width: 110, height: 170 }, { width: 130, height: 180 }, { width: 150, height: 200 }, { width: 200, height: 300 }];
const [p15x20, p20x30] = [papers[4], papers[5]];
function verify(plan, paper, format, count) {
  assert.equal(plan.slots.length, count);
  const f = formats[format];
  for (const s of plan.slots) {
    assert.equal(s.w, s.rotate ? f.height : f.width);
    assert.equal(s.h, s.rotate ? f.width : f.height);
    assert.ok(s.x >= 2 - eps && s.y >= 2 - eps);
    assert.ok(s.x + s.w <= paper.width - 2 + eps && s.y + s.h <= paper.height - 2 + eps);
  }
  for (let i = 0; i < count; i++) for (let j = i + 1; j < count; j++) {
    const a = plan.slots[i], b = plan.slots[j];
    assert.ok(Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) <= eps || Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) <= eps, 'frames must not overlap');
  }
  for (const line of plan.lines) for (const s of plan.slots) {
    const crossing = line.axis === 'h'
      ? line.at > s.y + eps && line.at < s.y + s.h - eps && Math.min(line.end, s.x + s.w) - Math.max(line.start, s.x) > eps
      : line.at > s.x + eps && line.at < s.x + s.w - eps && Math.min(line.end, s.y + s.h) - Math.max(line.start, s.y) > eps;
    assert.ok(!crossing, 'no cut line may cross a frame interior');
  }
  for (let i = 0; i < plan.lines.length; i++) for (let j = i + 1; j < plan.lines.length; j++) {
    const a = plan.lines[i], b = plan.lines[j];
    if (a.axis === b.axis && Math.abs(a.at - b.at) < eps) assert.ok(Math.min(a.end, b.end) < Math.max(a.start, b.start) - eps, 'shared edges must be merged');
  }
}
for (const format of Object.keys(formats)) for (const [i, paper] of papers.entries()) for (const [j, mode] of ['easy', 'dense'].entries()) {
  test(`${format} ${paper.width}x${paper.height} ${mode}: capacity and all partial sheets`, () => {
    if (!expected[format][i][j]) { assert.throws(() => sheetLayout(paper, format, mode), /too small/); return; }
    const capacity = sheetLayout(paper, format, mode).capacity;
    assert.equal(capacity, expected[format][i][j]);
    for (let count = 0; count <= capacity; count++) verify(sheetLayout(paper, format, mode, false, count), paper, format, count);
    assert.throws(() => sheetLayout(paper, format, mode, false, capacity + 1));
  });
}
test('four Minis share borders and need six cut lines', () => {
  const plan = sheetLayout(p15x20, 'mini', 'easy', false, 4);
  assert.equal(plan.lines.length, 6);
  assert.equal(plan.slots[1].x, plan.slots[0].x + 54);
  assert.equal(plan.slots[2].y, plan.slots[0].y + 86);
});
test('calibration labels retain a 4mm row gap for each format', () => {
  for (const format of Object.keys(formats)) {
    const paper = ['wide', 'strip', 'peel'].includes(format) ? p20x30 : p15x20;
    const plan = sheetLayout(paper, format, 'dense', true, 4);
    verify(plan, paper, format, 4);
    for (const a of plan.slots) for (const b of plan.slots) if (b.y > a.y && Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > eps) assert.ok(b.y - (a.y + a.h) >= 4 - eps);
  }
});
test('custom portrait/landscape papers retain bounds at fractional millimeters', () => {
  for (const paper of [{ width: 152.4, height: 203.2 }, { width: 203.2, height: 152.4 }, { width: 210, height: 297 }, { width: 400, height: 500 }]) for (const format of Object.keys(formats)) for (const mode of ['easy', 'dense']) {
    const plan = sheetLayout(paper, format, mode);
    verify(plan, paper, format, plan.capacity);
  }
});
test('guide lines reach the paper edge or the nearest print, never crossing one', () => {
  for (const format of Object.keys(formats)) for (const paper of papers) for (const mode of ['easy', 'dense']) {
    let plan; try { plan = sheetLayout(paper, format, mode); } catch { continue; }
    const guides = guideLines(plan.lines, plan.slots, paper);
    for (const line of guides) for (const s of plan.slots) assert.ok(line.axis === 'h'
      ? !(line.at > s.y + eps && line.at < s.y + s.h - eps && Math.min(line.end, s.x + s.w) - Math.max(line.start, s.x) > eps)
      : !(line.at > s.x + eps && line.at < s.x + s.w - eps && Math.min(line.end, s.y + s.h) - Math.max(line.start, s.y) > eps), 'guide may not cross a print');
    for (let i = 1; i < guides.length; i++) assert.ok(guides[i - 1].end - guides[i - 1].start >= guides[i].end - guides[i].start - eps, 'longest cuts come first');
    guides.forEach(g => { const l = plan.lines.find(x => x.axis === g.axis && Math.abs(x.at - g.at) < eps && x.start >= g.start - eps && x.end <= g.end + eps); assert.ok(l); assert.ok(g.start >= 0 && g.end <= (g.axis === 'h' ? paper.width : paper.height)); });
  }
  const easy = guideLines(sheetLayout(papers[4], 'mini', 'easy', false, 4).lines, sheetLayout(papers[4], 'mini', 'easy', false, 4).slots, papers[4]);
  for (const g of easy) assert.deepEqual([g.start, g.end], [0, g.axis === 'h' ? 150 : 200]);
});
test('cut-number badges stay on paper and off every print', () => {
  for (const format of Object.keys(formats)) for (const paper of papers) for (const mode of ['easy', 'dense']) {
    let plan; try { plan = sheetLayout(paper, format, mode); } catch { continue; }
    for (const g of guideLines(plan.lines, plan.slots, paper)) {
      const spot = badgeSpot(g, plan.slots, paper); if (!spot) continue;
      assert.ok(spot.x >= 1.6 && spot.y >= 1.6 && spot.x <= paper.width - 1.6 && spot.y <= paper.height - 1.6);
      for (const s of plan.slots) assert.ok(spot.x + 1.6 <= s.x + eps || spot.x - 1.6 >= s.x + s.w - eps || spot.y + 1.6 <= s.y + eps || spot.y - 1.6 >= s.y + s.h - eps);
    }
  }
  const plan = sheetLayout(papers[4], 'mini', 'easy', false, 4);
  assert.ok(guideLines(plan.lines, plan.slots, papers[4]).every(g => badgeSpot(g, plan.slots, papers[4])), 'a 2×2 grid numbers every cut');
});
test('two booth strips share one 10 × 15 cm print', () => {
  const plan = sheetLayout(papers[1], 'strip', 'easy', false, 2);
  verify(plan, papers[1], 'strip', 2);
  assert.equal(plan.slots[1].x, plan.slots[0].x + 48);
});
test('date stamps read like a film-camera date back', () => {
  assert.equal(todayStamp(new Date(2026, 10, 3)), "'26 11 03");
  assert.equal('3.11.26 ab!'.replace(STAMP_CHARS, ''), '3.11.26 ');
});
test('invalid papers fail explicitly', () => {
  for (const paper of [{ width: 0, height: 200 }, { width: NaN, height: 200 }, { width: 500, height: 200 }, { width: 50, height: 50 }]) assert.throws(() => sheetLayout(paper));
});
test('pagination retains every photo once and minimizes sheet count', () => {
  for (let capacity = 1; capacity <= 12; capacity++) for (let count = 0; count <= 24; count++) {
    const items = Array.from({ length: count }, (_, i) => `photo-${i}`), pages = paginate(items, capacity);
    assert.deepEqual(pages.flat(), items);
    assert.equal(pages.length, Math.ceil(count / capacity));
    assert.ok(pages.every(p => p.length > 0 && p.length <= capacity));
    if (pages.length) assert.ok(Math.max(...pages.map(p => p.length)) - Math.min(...pages.map(p => p.length)) <= 1);
  }
  assert.deepEqual(paginate(Array.from({ length: 12 }, (_, i) => i), 5).map(p => p.length), [4, 4, 4]);
});

test('caption doodles preserve ordinary emoji and text presentation sequences', async () => {
  const { captionRuns, doodles } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
  const keyboard = 'Love ❤️ ☀️ 👨‍👩‍👧‍👦 ☼\uFE0F';
  const runs = captionRuns(keyboard + ' ♡☆✧❀☾☼∞⋈');
  assert.equal(runs.filter(r => r.doodle).length, 8);
  assert.equal(runs.map(r => r.text).join(''), keyboard + ' ♡☆✧❀☾☼∞⋈');
  assert.equal(runs[0].text, keyboard + ' ');
  assert.equal(doodles.length, 8);
});
