export type Film = 'original' | 'instax' | 'instax-rich' | 'golden' | 'rose' | 'faded' | 'noir' | 'midnight';
export const PRINT_DPI = 600;
export const PRINT_PX_PER_MM = PRINT_DPI / 25.4;
export const MAX_PHOTOS = 12;
export const formats = {
  mini: { name: 'Mini', width: 54, height: 86, imageWidth: 46, imageHeight: 62 },
  square: { name: 'Square', width: 72, height: 86, imageWidth: 62, imageHeight: 62 },
  wide: { name: 'Wide', width: 108, height: 86, imageWidth: 99, imageHeight: 62 },
} as const;
export type PrintFormat = keyof typeof formats;
export const formatChoices = Object.keys(formats) as PrintFormat[];
export type LayoutMode = 'easy' | 'dense';
export const paperChoices = [{ width: 100, height: 150 }, { width: 150, height: 200 }, { width: 200, height: 300 }];
export type Photo = { id: string; src: string; image: HTMLImageElement; caption: string; note: string; font: string; frame: string; film: Film; strength: number; exposure: number; softening: number; flash: number; grain: number; leak: boolean; zoom: number; panX: number; panY: number; rotation: number; sample: boolean };
export const films: { id: Film; name: string; description: string; color: string }[] = [
  { id: 'original', name: 'Original', description: 'Your colors, untouched', color: '#a9c4b5' },
  { id: 'instax', name: 'Instant Natural', description: 'Instax-inspired: subdued color and gentle contrast. An interpretation, not a calibrated match.', color: '#98bfae' },
  { id: 'instax-rich', name: 'Instant Rich', description: 'Instax-inspired: brighter color and deeper contrast. An interpretation, not a calibrated match.', color: '#88a9c3' },
  { id: 'golden', name: 'Summer ’79', description: 'Honey-warm midtones, soft highlights', color: '#dba46a' },
  { id: 'rose', name: 'Rose motel', description: 'Muted color, rosy midtones', color: '#c69ba8' },
  { id: 'faded', name: 'Attic find', description: 'Dusty greens, lifted blacks', color: '#a5ac83' },
  { id: 'noir', name: 'After hours', description: 'Clean monochrome, deep shadows', color: '#7f8285' },
  { id: 'midnight', name: 'Blue hour', description: 'Cool shadows, gently warm highlights', color: '#7e99b7' },
];
export const fontOptions = [{ name: 'Handwritten', value: 'Caveat' }, { name: 'Typewriter', value: 'Special Elite' }, { name: 'Marker', value: 'Permanent Marker' }, { name: 'Clean', value: 'DM Sans' }];
export const frames = [{ name: 'White', value: '#ffffff' }, { name: 'Butter', value: '#f4e5a4' }, { name: 'Blush', value: '#efd5d5' }, { name: 'Midnight', value: '#302b38' }];
// Original pen-style paths, shared by the picker and the physical print renderer.
export const doodles = [
  { symbol: '♡', name: 'Heart', path: 'M12 21C9 17 2 13 3 7C4 2 10 3 12 8C15 1 22 4 21 9C20 14 16 18 12 21' },
  { symbol: '☆', name: 'Star', path: 'M12 2L15 9L22 10L17 15L18 22L12 18L5 21L7 14L2 9L9 8Z' },
  { symbol: '✧', name: 'Sparkle', path: 'M12 2Q13 11 21 12Q13 13 12 22Q11 13 3 12Q11 11 12 2M20 2L20 6M18 4L22 4' },
  { symbol: '❀', name: 'Flower', path: 'M10 9C3 4 2 14 8 14C1 20 12 24 12 17C16 25 24 17 17 14C25 13 20 3 15 9C18 1 8 0 10 9ZM14 12C14 15 10 15 10 12C10 9 14 10 14 12' },
  { symbol: '☾', name: 'Moon', path: 'M16 2C2 1 0 19 12 22C16 23 20 20 21 17C10 20 6 7 16 2Z' },
  { symbol: '☼', name: 'Sun', path: 'M17 12C17 19 6 19 7 12C6 5 18 5 17 12M12 2L12 4M12 20L12 22M2 12L4 12M20 12L22 12M4 4L6 6M18 18L20 20M4 20L6 18M18 6L20 4' },
  { symbol: '∞', name: 'Infinity', path: 'M12 12C6 2 0 8 3 14C6 20 10 15 12 12C18 2 24 8 21 14C18 20 14 15 12 12' },
  { symbol: '⋈', name: 'Bow', path: 'M12 11C2 0 0 6 4 13C5 15 9 13 12 11C22 0 24 6 20 13C19 15 15 13 12 11M11 12Q9 17 5 21L8 20M13 12Q15 18 19 21L18 18' },
] as const;
// Keep unrecognized text, emoji presentation selectors and ZWJ sequences intact.
export function captionRuns(text: string) {
  return text.split(/([♡☆✧❀☾☼∞⋈](?![\uFE0E\uFE0F\u200D]))/u).filter(Boolean).map(text => ({ text, doodle: doodles.find(d => d.symbol === text) }));
}
function drawCaption(ctx: CanvasRenderingContext2D, p: Photo, pxPerMm: number, width: number) {
  const runs = captionRuns(p.caption), maxWidth = width * pxPerMm;
  let size = (p.font === 'Caveat' ? 5 : p.font === 'Permanent Marker' ? 3.7 : 3.3) * pxPerMm;
  const measure = () => { ctx.font = `${size}px "${p.font}"`; return runs.reduce((sum, r) => sum + (r.doodle ? size * 1.04 : ctx.measureText(r.text).width), 0); };
  let total = measure();
  while (total > maxWidth && size > pxPerMm * 1.2) { size = Math.max(pxPerMm * 1.2, size - .5); total = measure(); }
  ctx.save(); ctx.translate(ctx.canvas.width / 2, 74.7 * pxPerMm); ctx.scale(total > maxWidth ? maxWidth / total : 1, 1);
  ctx.textAlign = 'left'; let x = -total / 2;
  for (const run of runs) {
    if (run.doodle) {
      ctx.save(); ctx.translate(x + size * .07, -size * .45); ctx.scale(size * .9 / 24, size * .9 / 24);
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(new Path2D(run.doodle.path)); ctx.restore();
      x += size * 1.04;
    } else { ctx.fillText(run.text, x, 0); x += ctx.measureText(run.text).width; }
  }
  ctx.restore();
}
export function newPhoto(image: HTMLImageElement, src: string, sample = false): Photo {
  return { id: crypto.randomUUID(), src, image, caption: sample ? 'Somewhere, nowhere.' : '', note: sample ? 'a little longer here' : '', font: 'Caveat', frame: '#ffffff', film: 'original', strength: 85, exposure: 0, softening: 0, flash: 0, grain: 0, leak: false, zoom: 1, panX: 0, panY: 0, rotation: 0, sample };
}
export function loadImage(src: string): Promise<HTMLImageElement> { return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error('This image could not be opened. Try a JPG, PNG or WebP.')); img.src = src; }); }
export async function readPhoto(file: File): Promise<Photo> {
  if (!/^image\/(jpeg|png|webp|avif|gif)$/.test(file.type)) throw new Error('Please choose a JPG, PNG, WebP, AVIF or GIF image. For HEIC, export a JPG first.');
  if (file.size > 25 * 1024 * 1024) throw new Error('This photo is over 25 MB. Please choose a smaller version.');
  const url = URL.createObjectURL(file);
  try {
    // Keep the original pixels and encoding; the image is cropped only at render time.
    return newPhoto(await loadImage(url), url);
  } catch (error) { URL.revokeObjectURL(url); throw error; }
}
// Tonal/color choices are aesthetic grades, not measured Instax film profiles.
const filmGrades = {
  instax: { black: 3, contrast: .08, saturation: .95, shadows: [0, 0, 0], highlights: [0, 0, 0] },
  'instax-rich': { black: 1, contrast: .22, saturation: 1.18, shadows: [0, 0, 0], highlights: [0, 0, 0] },
  golden: { black: 5, contrast: .12, saturation: .96, shadows: [24, 7, -26], highlights: [18, 4, -22] },
  rose: { black: 6, contrast: .08, saturation: .89, shadows: [15, -12, 18], highlights: [22, 0, 2] },
  faded: { black: 13, contrast: -.12, saturation: .76, shadows: [-8, 14, 0], highlights: [10, 6, -14] },
  noir: { black: 2, contrast: .30, saturation: 0, shadows: [0, 0, 0], highlights: [0, 0, 0] },
  midnight: { black: 3, contrast: .20, saturation: .94, shadows: [-26, 2, 32], highlights: [18, 6, -12] },
} satisfies Record<Exclude<Film, 'original'>, { black: number; contrast: number; saturation: number; shadows: number[]; highlights: number[] }>;
function applyFilm(c: HTMLCanvasElement, p: Photo) {
  if ((p.film === 'original' || p.strength === 0) && p.grain === 0 && !p.leak && p.exposure === 0 && p.flash === 0) return;
  const ctx = c.getContext('2d', { willReadFrequently: true, colorSpace: 'srgb' })!;
  const data = ctx.getImageData(0, 0, c.width, c.height); const d = data.data; const t = p.strength / 100;
  const instant = p.film === 'instax' || p.film === 'instax-rich';
  const grade = p.film === 'original' || t === 0 ? null : filmGrades[p.film];
  // One monotone curve for luminance: unlike separate RGB curves this does
  // not change hue. Interpolate the LUT to retain near-white color detail.
  const tone = grade ? Array.from({ length: 256 }, (_, v) => {
    const x = v / 255;
    return grade.black + (255 - grade.black) * ((1 - grade.contrast) * x + grade.contrast * x * x * (3 - 2 * x));
  }) : null;
  // Brightness is exposure in linear sRGB light; prepare a small lookup table once.
  const exposure = p.exposure === 0 ? null : Array.from({ length: 256 }, (_, v) => {
    const x = v / 255;
    const linear = (x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4) * 2 ** p.exposure;
    return Math.round(Math.max(0, Math.min(1, linear <= .0031308 ? linear * 12.92 : 1.055 * linear ** (1 / 2.4) - .055)) * 255);
  });
  let seed = 79; const noise = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 - .5; };
  for (let i = 0; i < d.length; i += 4) {
    const r = exposure ? exposure[d[i]] : d[i], g = exposure ? exposure[d[i + 1]] : d[i + 1], b = exposure ? exposure[d[i + 2]] : d[i + 2];
    let rr = r, gg = g, bb = b;
    if (grade && tone) {
      const luma = .2126 * r + .7152 * g + .0722 * b;
      const low = Math.floor(luma), y = tone[low] + (tone[Math.min(255, low + 1)] - tone[low]) * (luma - low);
      const x = luma / 255, window = 4 * x * (1 - x);
      // Color is strongest away from pure black/white. A broad warm-hue mask
      // moderates extra saturation; it is not face or skin detection.
      const spread = Math.max(r, g, b) - Math.min(r, g, b);
      const warm = Math.max(0, Math.min(1, (r - b) / 32)) * Math.max(0, 1 - Math.abs((r - g) / Math.max(1, r - b) - .45) / .45);
      const saturation = grade.saturation > 1
        ? 1 + (grade.saturation - 1) * (1 - spread / 255 * .6) * (1 - warm * .65)
        : grade.saturation;
      const shadows = (1 - x) ** 2 * window, highlights = x * x * window;
      const tintR = grade.shadows[0] * shadows + grade.highlights[0] * highlights;
      const tintG = grade.shadows[1] * shadows + grade.highlights[1] * highlights;
      const tintB = grade.shadows[2] * shadows + grade.highlights[2] * highlights;
      const tintLuma = .2126 * tintR + .7152 * tintG + .0722 * tintB;
      const cr = (r - luma) * saturation + (tintR - tintLuma) * (1 - warm * .35);
      const cg = (g - luma) * saturation + (tintG - tintLuma) * (1 - warm * .35);
      const cb = (b - luma) * saturation + (tintB - tintLuma) * (1 - warm * .35);
      // Ease chroma into the available sRGB gamut instead of clipping each
      // channel independently. Keep luminance and the chroma direction intact.
      const ratio = Math.max(Math.max(0, cr, cg, cb) / Math.max(1e-6, 255 - y), -Math.min(0, cr, cg, cb) / Math.max(1e-6, y));
      const chroma = ratio > .9 ? (1 - .01 / (ratio - .8)) / ratio : 1;
      rr = y + cr * chroma; gg = y + cg * chroma; bb = y + cb * chroma;
    }
    const n = p.grain ? noise() * p.grain * .65 : 0;
    const x = (i / 4) % c.width / c.width - .5, y = Math.floor(i / 4 / c.width) / c.height - .5;
    const vignette = (p.film === 'original' || instant) ? 1 : 1 - Math.max(0, x * x + y * y - .1) * .27 * t;
    // Center-weighted flash-style light: an optional lighting approximation,
    // not subject detection or a reconstruction of actual flash shadows.
    const flash = 1 + p.flash / 100 * (.16 - .40 * Math.min(1, (x * x + y * y) * 3));
    d[i] = (r + (rr - r) * t) * vignette * flash + n; d[i + 1] = (g + (gg - g) * t) * vignette * flash + n; d[i + 2] = (b + (bb - b) * t) * vignette * flash + n;
  }
  ctx.putImageData(data, 0, 0);
  if (p.leak) { const grad = ctx.createRadialGradient(0, c.height * .7, 0, 0, c.height * .7, c.width * .9); grad.addColorStop(0, 'rgba(255,109,49,.55)'); grad.addColorStop(.4, 'rgba(255,180,67,.22)'); grad.addColorStop(1, 'rgba(255,160,50,0)'); ctx.fillStyle = grad; ctx.fillRect(0, 0, c.width, c.height); }
}
// A single bounded preview entry per decoded source; exports never retain print buffers.
const previewCache = new WeakMap<HTMLImageElement, { key: string; canvas: HTMLCanvasElement }>();
function photographicImage(p: Photo, pxPerMm: number, format: PrintFormat) {
  const spec = formats[format];
  const cacheable = pxPerMm < PRINT_PX_PER_MM && spec.imageWidth * spec.imageHeight * pxPerMm ** 2 <= 3_000_000;
  const key = [format, pxPerMm, p.zoom, p.panX, p.panY, p.rotation, p.film, p.strength, p.exposure, p.softening, p.flash, p.grain, p.leak].join('|');
  const cached = previewCache.get(p.image);
  if (cacheable && cached?.key === key) return cached.canvas;
  const image = document.createElement('canvas'); image.width = Math.round(spec.imageWidth * pxPerMm); image.height = Math.round(spec.imageHeight * pxPerMm);
  const ic = image.getContext('2d', { colorSpace: 'srgb' })!; ic.imageSmoothingQuality = 'high';
  // Transparent source images print against white photographic paper.
  ic.fillStyle = '#fff'; ic.fillRect(0, 0, image.width, image.height);
  const rotated = p.rotation % 180 !== 0;
  const iw = rotated ? p.image.naturalHeight : p.image.naturalWidth, ih = rotated ? p.image.naturalWidth : p.image.naturalHeight;
  const scale = Math.max(image.width / iw, image.height / ih) * p.zoom;
  const dx = (iw * scale - image.width) / 2 * p.panX, dy = (ih * scale - image.height) / 2 * p.panY;
  ic.translate(image.width / 2 + dx, image.height / 2 + dy); ic.rotate(p.rotation * Math.PI / 180); ic.scale(scale, scale); ic.drawImage(p.image, -p.image.naturalWidth / 2, -p.image.naturalHeight / 2);
  ic.resetTransform();
  if (p.softening > 0) {
    // Blend resampled image detail at a fixed physical scale, independent of DPI.
    // Only the photographic area is softened; text and frame remain crisp.
    const small = document.createElement('canvas');
    small.width = Math.min(image.width, Math.round(spec.imageWidth * 12.5));
    small.height = Math.min(image.height, Math.round(spec.imageHeight * 12.5));
    const sc = small.getContext('2d', { colorSpace: 'srgb' })!; sc.imageSmoothingQuality = 'high';
    sc.drawImage(image, 0, 0, small.width, small.height);
    ic.globalAlpha = p.softening / 100; ic.drawImage(small, 0, 0, image.width, image.height); ic.globalAlpha = 1;
  }
  applyFilm(image, p);
  if (cacheable) previewCache.set(p.image, { key, canvas: image });
  return image;
}
export function renderPhoto(p: Photo, pxPerMm = 10, format: PrintFormat = 'mini'): HTMLCanvasElement {
  const spec = formats[format], imageX = (spec.width - spec.imageWidth) / 2;
  const c = document.createElement('canvas'); c.width = Math.round(spec.width * pxPerMm); c.height = Math.round(spec.height * pxPerMm);
  const ctx = c.getContext('2d', { colorSpace: 'srgb' })!; ctx.fillStyle = p.frame; ctx.fillRect(0, 0, c.width, c.height);
  const image = photographicImage(p, pxPerMm, format);
  ctx.drawImage(image, imageX * pxPerMm, 4 * pxPerMm, spec.imageWidth * pxPerMm, spec.imageHeight * pxPerMm);
  if (pxPerMm >= PRINT_PX_PER_MM) { image.width = 1; image.height = 1; }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = p.frame === '#302b38' ? '#fffdf7' : '#302b38';
  const fitText = (text: string, y: number, size: number, font: string) => { let s = size * pxPerMm; ctx.font = `${s}px "${font}"`; while (ctx.measureText(text).width > spec.imageWidth * pxPerMm && s > pxPerMm * 1.2) { s -= .5; ctx.font = `${s}px "${font}"`; } ctx.fillText(text, spec.width / 2 * pxPerMm, y * pxPerMm, spec.imageWidth * pxPerMm); };
  if (captionRuns(p.caption).some(r => r.doodle)) drawCaption(ctx, p, pxPerMm, spec.imageWidth);
  else fitText(p.caption, 74.7, p.font === 'Caveat' ? 5 : p.font === 'Permanent Marker' ? 3.7 : 3.3, p.font);
  ctx.globalAlpha = .62; fitText(p.note, 81.2, 2.25, 'DM Sans'); return c;
}
export type Paper = { width: number; height: number };
export type Slot = { x: number; y: number; w: number; h: number; rotate: boolean };
export type CutLine = { axis: 'h' | 'v'; at: number; start: number; end: number };
export function cutLines(slots: Slot[]): CutLine[] {
  const groups = new Map<string, { axis: 'h' | 'v'; at: number; intervals: [number, number][] }>();
  const add = (axis: 'h' | 'v', at: number, start: number, end: number) => {
    const key = `${axis}:${at.toFixed(5)}`;
    if (!groups.has(key)) groups.set(key, { axis, at, intervals: [] });
    groups.get(key)!.intervals.push([start, end]);
  };
  slots.forEach(s => { add('h', s.y, s.x, s.x + s.w); add('h', s.y + s.h, s.x, s.x + s.w); add('v', s.x, s.y, s.y + s.h); add('v', s.x + s.w, s.y, s.y + s.h); });
  const lines: CutLine[] = [];
  groups.forEach(({ axis, at, intervals }) => {
    intervals.sort((a, b) => a[0] - b[0]); let [start, end] = intervals[0];
    for (const next of intervals.slice(1)) {
      if (next[0] <= end + 1e-5) end = Math.max(end, next[1]);
      else { lines.push({ axis, at, start, end }); [start, end] = next; }
    }
    lines.push({ axis, at, start, end });
  });
  return lines;
}
// Search uniform grids and two-strip, guillotine-friendly arrangements. No
// shrinking or global-optimal packing claim: every candidate uses real millimeters.
export function sheetLayout(paper: Paper, format: PrintFormat = 'mini', mode: LayoutMode = 'easy', labeled = false, count?: number) {
  if (!Number.isFinite(paper.width) || !Number.isFinite(paper.height) || paper.width <= 4 || paper.height <= 4 || paper.width > 400 || paper.height > 500) throw new Error('Enter paper dimensions between 5 and 400 mm wide, and 5 and 500 mm tall.');
  const spec = formats[format], availableW = paper.width - 4, availableH = paper.height - 4, gap = labeled ? 4 : 0;
  const candidates: Slot[][] = [];
  const dims = (rotate: boolean) => ({ w: rotate ? spec.height : spec.width, h: rotate ? spec.width : spec.height });
  const rowsFit = (height: number, h: number) => Math.floor((height + gap + 1e-7) / (h + gap));
  const grid = (cols: number, rows: number, rotate: boolean, x = 0, y = 0): Slot[] => {
    const { w, h } = dims(rotate);
    return Array.from({ length: cols * rows }, (_, i) => ({ x: x + (i % cols) * w, y: y + Math.floor(i / cols) * (h + gap), w, h, rotate }));
  };
  for (const rotate of [false, true]) {
    const { w, h } = dims(rotate), rows = rowsFit(availableH, h);
    if (rows) for (let cols = 1; cols * w <= availableW + 1e-7; cols++) candidates.push(grid(cols, rows, rotate));
  }
  if (mode === 'dense' && !labeled) for (const rotate of [false, true]) {
    const a = dims(rotate), b = dims(!rotate);
    for (let ca = 1; ca * a.w + b.w <= availableW + 1e-7; ca++) for (let cb = 1; ca * a.w + cb * b.w <= availableW + 1e-7; cb++) {
      const ra = rowsFit(availableH, a.h), rb = rowsFit(availableH, b.h);
      if (ra && rb) candidates.push([...grid(ca, ra, rotate), ...grid(cb, rb, !rotate, ca * a.w)]);
    }
    for (let ra = 1; ra * a.h + b.h <= availableH + 1e-7; ra++) for (let rb = 1; ra * a.h + rb * b.h <= availableH + 1e-7; rb++) {
      const ca = Math.floor(availableW / a.w), cb = Math.floor(availableW / b.w);
      if (ca && cb) candidates.push([...grid(ca, ra, rotate), ...grid(cb, rb, !rotate, 0, ra * a.h)]);
    }
  }
  if (!candidates.length) throw new Error(`This paper is too small for a true-size ${spec.name} (${spec.width} × ${spec.height} mm). Choose larger paper.`);
  const capacity = Math.max(...candidates.map(c => c.length)), needed = count ?? capacity;
  if (!Number.isInteger(needed) || needed < 0 || needed > capacity) throw new Error(`This sheet fits ${capacity} ${spec.name} prints. Use another sheet for the remaining photos.`);
  if (!needed) return { capacity, slots: [] as Slot[], lines: [] as CutLine[] };
  let best: { slots: Slot[]; lines: CutLine[]; score: number[] } | undefined;
  for (const candidate of candidates) {
    if (candidate.length < needed) continue;
    const selected = candidate.slice(0, needed);
    const minX = Math.min(...selected.map(s => s.x)), minY = Math.min(...selected.map(s => s.y));
    const w = Math.max(...selected.map(s => s.x + s.w)) - minX, h = Math.max(...selected.map(s => s.y + s.h)) - minY;
    const slots = selected.map(s => ({ ...s, x: s.x - minX + (paper.width - w) / 2, y: s.y - minY + (paper.height - h) / 2 }));
    const lines = cutLines(slots), score = [lines.length, w * h, slots.filter(s => s.rotate).length];
    const better = !best || score.some((v, i) => v < best!.score[i] && score.slice(0, i).every((x, j) => x === best!.score[j]));
    if (better) best = { slots, lines, score };
  }
  return { capacity, slots: best!.slots, lines: best!.lines };
}
export type SheetOptions = { format: PrintFormat; mode: LayoutMode; labels?: string[] };
export async function renderSheet(photos: Photo[], paper: Paper, guides: boolean, pxPerMm = PRINT_PX_PER_MM, options: SheetOptions = { format: 'mini', mode: 'easy' }) {
  // Font faces inside closed style controls may not have been requested yet.
  await Promise.all([...new Set([...photos.map(photo => photo.font), 'DM Sans'])].map(font => document.fonts.load(`16px "${font}"`)));
  await document.fonts.ready;
  const labels = options.labels ?? [], spec = formats[options.format];
  const { slots, lines } = sheetLayout(paper, options.format, options.mode, labels.length > 0, photos.length);
  const c = document.createElement('canvas'); c.width = Math.round(paper.width * pxPerMm); c.height = Math.round(paper.height * pxPerMm);
  const ctx = c.getContext('2d', { colorSpace: 'srgb' })!; ctx.imageSmoothingQuality = 'high'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    // Give loading feedback and input events a turn between high-resolution prints.
    if (pxPerMm >= PRINT_PX_PER_MM) await new Promise(resolve => setTimeout(resolve, 0));
    const image = renderPhoto(photos[i], pxPerMm, options.format); ctx.save(); ctx.translate(s.x * pxPerMm, s.y * pxPerMm);
    if (s.rotate) { ctx.translate(s.w * pxPerMm, 0); ctx.rotate(Math.PI / 2); }
    ctx.drawImage(image, 0, 0, spec.width * pxPerMm, spec.height * pxPerMm); ctx.restore();
    image.width = 1; image.height = 1;
    if (labels[i]) {
      ctx.save(); ctx.fillStyle = '#555'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.font = `${1.5 * pxPerMm}px "DM Sans"`;
      ctx.fillText(labels[i], (s.x + s.w / 2) * pxPerMm, (s.y - .45) * pxPerMm, s.w * pxPerMm); ctx.restore();
    }
  }
  if (guides) {
    ctx.save(); ctx.strokeStyle = '#888'; ctx.lineWidth = .18 * pxPerMm; ctx.setLineDash([1.5 * pxPerMm, pxPerMm]);
    ctx.beginPath(); lines.forEach(l => {
      ctx.moveTo((l.axis === 'h' ? l.start : l.at) * pxPerMm, (l.axis === 'h' ? l.at : l.start) * pxPerMm);
      ctx.lineTo((l.axis === 'h' ? l.end : l.at) * pxPerMm, (l.axis === 'h' ? l.at : l.end) * pxPerMm);
    }); ctx.stroke(); ctx.restore();
  }
  return c;
}
// Evenly filled pages retain the minimum sheet count while often simplifying cuts.
export function paginate<T>(items: T[], capacity: number): T[][] {
  if (!Number.isInteger(capacity) || capacity < 1) return [];
  const count = Math.ceil(items.length / capacity), base = Math.floor(items.length / Math.max(1, count)), extra = items.length % Math.max(1, count);
  let offset = 0;
  return Array.from({ length: count }, (_, i) => { const size = base + (i < extra ? 1 : 0), page = items.slice(offset, offset + size); offset += size; return page; });
}
export function download(blob: Blob, name: string) { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000); }
export function canvasBlob(c: HTMLCanvasElement, type = 'image/jpeg'): Promise<Blob> { return new Promise((resolve, reject) => c.toBlob(b => b ? resolve(b) : reject(new Error('Export failed. Try again.')), type, 1)); }
// JFIF resolution is informational. The kiosk still needs matching paper and no scaling.
export async function jpegPrint(c: HTMLCanvasElement): Promise<Blob> { const bytes = new Uint8Array(await (await canvasBlob(c)).arrayBuffer()); if (bytes[2] === 255 && bytes[3] === 224 && bytes[6] === 74 && bytes[7] === 70 && bytes[8] === 73 && bytes[9] === 70) { bytes[13] = 1; bytes[14] = PRINT_DPI >> 8; bytes[15] = PRINT_DPI & 255; bytes[16] = PRINT_DPI >> 8; bytes[17] = PRINT_DPI & 255; } return new Blob([bytes], { type: 'image/jpeg' }); }
