export type Film = 'original' | 'instax' | 'instax-rich' | 'golden' | 'rose' | 'faded' | 'noir' | 'midnight';
export const PRINT_DPI = 600;
export const PRINT_PX_PER_MM = PRINT_DPI / 25.4;
export const MAX_PHOTOS = 12;
export const formats = {
  mini: { name: 'Mini', width: 54, height: 86, imageWidth: 46, imageHeight: 62 },
  // About half a Mini: nine fit on one 10 × 15 cm print, with a short caption.
  tiny: { name: 'Tiny', width: 30, height: 46, imageWidth: 26, imageHeight: 34, imageTop: 2 },
  // The same photo with no caption band, only a small chin.
  tinyplain: { name: 'Tiny plain', width: 30, height: 39, imageWidth: 26, imageHeight: 34, imageTop: 2 },
  square: { name: 'Square', width: 72, height: 86, imageWidth: 62, imageHeight: 62 },
  wide: { name: 'Wide', width: 108, height: 86, imageWidth: 99, imageHeight: 62 },
  // Peel-apart instant: the image keeps the ragged, chemical-streaked edge of a pulled print.
  peel: { name: 'Peel-apart', width: 83, height: 108, imageWidth: 73, imageHeight: 95 },
  // Photo-booth strip: four photos per print. Two fit side by side on 10 × 15 cm paper.
  strip: { name: 'Strip', width: 48, height: 146, imageWidth: 42, imageHeight: 30, photos: 4 },
  // Matchbook: a fold-up cover strip beside two photo cards that sit inside like matches.
  matchbook: { name: 'Matchbook', width: 92, height: 125, imageWidth: 40, imageHeight: 38, photos: 2 },
} as const;
// Formats with a caption band that can take the ticket, boarding-pass and player styles.
export const supportsStyles = (format: PrintFormat) => !['strip', 'peel', 'matchbook', 'tiny', 'tinyplain'].includes(format);
// Formats whose classic caption can hold hand-drawn doodles.
export const supportsDoodles = (format: PrintFormat) => supportsStyles(format) || format === 'tiny';
export const hasCaption = (format: PrintFormat) => format !== 'tinyplain';
// Distance from the top of a print (or strip cell) to its photo.
export const imageTop = (format: PrintFormat) => 'imageTop' in formats[format] ? (formats[format] as { imageTop: number }).imageTop : 4;
export const photosPerPrint = (format: PrintFormat) => 'photos' in formats[format] ? (formats[format] as { photos: number }).photos : 1;
// What one photo looks like on its own: a whole print, or one strip cell.
export const photoSize = (format: PrintFormat) => format === 'strip' ? { width: 48, height: 38 } : format === 'matchbook' ? { width: 44, height: 52 } : formats[format];
export type PrintFormat = keyof typeof formats;
export const formatChoices = Object.keys(formats) as PrintFormat[];
export type LayoutMode = 'easy' | 'dense';
export const paperChoices = [{ width: 90, height: 130 }, { width: 100, height: 150 }, { width: 110, height: 170 }, { width: 130, height: 180 }, { width: 150, height: 200 }, { width: 200, height: 300 }];
export type PrintStyle = 'classic' | 'player' | 'ticket' | 'boarding';
export const printStyles: { id: PrintStyle; name: string }[] = [{ id: 'classic', name: 'Classic' }, { id: 'player', name: 'Now playing' }, { id: 'ticket', name: 'Ticket' }, { id: 'boarding', name: 'Boarding pass' }];
export type Photo = { id: string; src: string; image: HTMLImageElement; caption: string; note: string; style: PrintStyle; stamp: string; font: string; frame: string; film: Film; strength: number; exposure: number; softening: number; flash: number; grain: number; leak: boolean; zoom: number; panX: number; panY: number; rotation: number; sample: boolean };
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
function captionSize(font: string) { return font === 'Caveat' ? 5 : font === 'Permanent Marker' ? 3.7 : 3.3; }
function drawCaption(ctx: CanvasRenderingContext2D, p: Photo, pxPerMm: number, width: number, y = 74.7, scale = 1) {
  const runs = captionRuns(p.caption), maxWidth = width * pxPerMm;
  let size = captionSize(p.font) * scale * pxPerMm;
  const measure = () => { ctx.font = `${size}px "${p.font}"`; return runs.reduce((sum, r) => sum + (r.doodle ? size * 1.04 : ctx.measureText(r.text).width), 0); };
  let total = measure();
  while (total > maxWidth && size > pxPerMm * 1.2) { size = Math.max(pxPerMm * 1.2, size - .5); total = measure(); }
  ctx.save(); ctx.translate(ctx.canvas.width / 2, y * pxPerMm); ctx.scale(total > maxWidth ? maxWidth / total : 1, 1);
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
  return { id: crypto.randomUUID(), src, image, caption: sample ? 'Somewhere, nowhere.' : '', note: sample ? 'a little longer here' : '', style: 'classic', stamp: '', font: 'Caveat', frame: '#ffffff', film: 'original', strength: 85, exposure: 0, softening: 0, flash: 0, grain: 0, leak: false, zoom: 1, panX: 0, panY: 0, rotation: 0, sample };
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
export function todayStamp(date = new Date()) {
  return `'${String(date.getFullYear()).slice(2)} ${String(date.getMonth() + 1).padStart(2, '0')} ${String(date.getDate()).padStart(2, '0')}`;
}
// Seven-segment digits in the orange of 90s film-camera date backs.
const SEGMENTS: Record<string, string> = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', '-': 'g' };
export const STAMP_CHARS = /[^0-9' .:-]/g;
function drawStamp(ctx: CanvasRenderingContext2D, text: string, right: number, bottom: number, pxPerMm: number, height = 2.4) {
  const h = height * pxPerMm, w = h * .5, step = h * .78, chars = [...text.replace(STAMP_CHARS, '')];
  if (!chars.length) return;
  const narrow = (ch: string) => ch === "'" || ch === '.' || ch === ':' ? step * .45 : step;
  const total = chars.reduce((sum, ch) => sum + narrow(ch), 0);
  ctx.save(); ctx.translate(right * pxPerMm - total, bottom * pxPerMm); ctx.transform(1, 0, -.12, 1, 0, 0);
  ctx.strokeStyle = ctx.fillStyle = '#ff8a1e'; ctx.lineWidth = h * .13; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(255,110,20,.75)'; ctx.shadowBlur = h * .35;
  const pts: Record<string, [number, number, number, number]> = { a: [0, -h, w, -h], b: [w, -h, w, -h / 2], c: [w, -h / 2, w, 0], d: [0, 0, w, 0], e: [0, -h / 2, 0, 0], f: [0, -h, 0, -h / 2], g: [0, -h / 2, w, -h / 2] };
  let x = 0;
  for (const ch of chars) {
    ctx.beginPath();
    if (ch === "'") { ctx.moveTo(x + w * .3, -h); ctx.lineTo(x + w * .2, -h * .72); }
    else if (ch === '.') ctx.arc(x + w * .2, 0, ctx.lineWidth * .5, 0, Math.PI * 2);
    else if (ch === ':') { ctx.arc(x + w * .2, -h * .72, ctx.lineWidth * .5, 0, Math.PI * 2); ctx.moveTo(x + w * .2, -h * .28); ctx.arc(x + w * .2, -h * .28, ctx.lineWidth * .5, 0, Math.PI * 2); }
    else for (const seg of SEGMENTS[ch] ?? '') { const [x1, y1, x2, y2] = pts[seg], i = h * .07; ctx.moveTo(x + x1 + (x1 === x2 ? 0 : i), y1 + (y1 === y2 ? 0 : i)); ctx.lineTo(x + x2 - (x1 === x2 ? 0 : i), y2 - (y1 === y2 ? 0 : i)); }
    ch === '.' || ch === ':' ? ctx.fill() : ctx.stroke(); x += narrow(ch);
  }
  ctx.restore();
}
// Small stable number from the photo id, so a ticket keeps its number across renders.
function serial(id: string, digits = 4) { let h = 7; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return String(h % 10 ** digits).padStart(digits, '0'); }
function drawIcon(ctx: CanvasRenderingContext2D, path: string, cx: number, cy: number, size: number, fill = true) {
  ctx.save(); ctx.translate(cx - size / 2, cy - size / 2); ctx.scale(size / 24, size / 24);
  const shape = new Path2D(path); if (fill) ctx.fill(shape); else { ctx.lineWidth = 1.6; ctx.stroke(shape); } ctx.restore();
}
const ICONS = {
  prev: 'M5 4h3v16H5zM20 4v16L9 12z', next: 'M16 4h3v16h-3zM4 4v16l11-8z', pause: 'M7 4h4v16H7zM13 4h4v16h-4z',
  plane: 'M21 15.5v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0v5l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-5z',
  heart: 'M12 21C9 17 2 13 3 7C4 2 10 3 12 8C15 1 22 4 21 9C20 14 16 18 12 21',
};
// The caption band runs from the photo's lower edge to the bottom of the frame.
function drawStyledCaption(ctx: CanvasRenderingContext2D, p: Photo, pxPerMm: number, x0: number, width: number, top: number, ink: string) {
  const mm = (v: number) => v * pxPerMm, x1 = x0 + width, cx = x0 + width / 2;
  const text = (t: string, x: number, y: number, size: number, font: string, align: CanvasTextAlign = 'center', max = width, weight = '') => {
    let s = size; ctx.font = `${weight} ${mm(s)}px "${font}"`;
    while (ctx.measureText(t).width > mm(max) && s > 1.2) { s -= .1; ctx.font = `${weight} ${mm(s)}px "${font}"`; }
    ctx.textAlign = align; ctx.fillText(t, mm(x), mm(y), mm(max));
  };
  const faint = (alpha: number, draw: () => void) => { ctx.save(); ctx.globalAlpha = alpha; draw(); ctx.restore(); };
  ctx.textBaseline = 'middle'; ctx.fillStyle = ctx.strokeStyle = ink;
  if (p.style === 'player') {
    text(p.caption || 'Song title', x0, top + 4.4, 3, 'DM Sans', 'left', width - 6, '600');
    faint(.6, () => text(p.note || 'Artist', x0, top + 7.9, 2.1, 'DM Sans', 'left', width - 6));
    ctx.save(); ctx.lineWidth = mm(.25); drawIcon(ctx, ICONS.heart, mm(x1 - 2), mm(top + 5.8), mm(3.2), false); ctx.restore();
    const bar = top + 11, played = .38;
    faint(.2, () => { ctx.fillRect(mm(x0), mm(bar - .3), mm(width), mm(.6)); });
    ctx.fillRect(mm(x0), mm(bar - .3), mm(width * played), mm(.6));
    ctx.beginPath(); ctx.arc(mm(x0 + width * played), mm(bar), mm(1), 0, Math.PI * 2); ctx.fill();
    faint(.55, () => { text('1:24', x0, bar + 2.2, 1.6, 'DM Sans', 'left'); text('-2:13', x1, bar + 2.2, 1.6, 'DM Sans', 'right'); });
    const controls = top + 16.4;
    drawIcon(ctx, ICONS.prev, mm(cx - 10), mm(controls), mm(3.4));
    drawIcon(ctx, ICONS.pause, mm(cx), mm(controls), mm(4.4));
    drawIcon(ctx, ICONS.next, mm(cx + 10), mm(controls), mm(3.4));
  } else if (p.style === 'ticket') {
    ctx.save(); ctx.lineWidth = mm(.25); ctx.strokeRect(mm(x0), mm(top + 1.6), mm(width), mm(16.2)); ctx.setLineDash([mm(.8), mm(.6)]);
    ctx.beginPath(); ctx.moveTo(mm(x1 - 10), mm(top + 1.6)); ctx.lineTo(mm(x1 - 10), mm(top + 17.8)); ctx.stroke(); ctx.restore();
    const main = x0 + (width - 10) / 2;
    faint(.6, () => text('ADMIT ONE', main, top + 4.4, 1.7, 'DM Sans', 'center', width - 14, '700'));
    text(p.caption || 'Movie night', main, top + 9.2, 3.6, p.font === 'Caveat' ? 'Special Elite' : p.font, 'center', width - 14);
    faint(.7, () => text(p.note || 'Row F · Seat 12', main, top + 14.4, 1.9, 'DM Sans', 'center', width - 14));
    ctx.save(); ctx.translate(mm(x1 - 5), mm(top + 9.7)); ctx.rotate(-Math.PI / 2); text(`No. ${serial(p.id)}`, 0, 0, 1.8, 'DM Sans', 'center', 14, '600'); ctx.restore();
  } else {
    const parts = (p.caption || 'CGN → BCN').split(/\s*(?:→|->|–|—|-|>|✈|\bto\b)\s*/i).filter(Boolean);
    faint(.55, () => { text('BOARDING PASS', cx, top + 2.6, 1.5, 'DM Sans', 'center', width, '700'); });
    if (parts.length === 2) {
      faint(.55, () => { text('FROM', x0, top + 4.6, 1.4, 'DM Sans', 'left'); text('TO', x1, top + 4.6, 1.4, 'DM Sans', 'right'); });
      text(parts[0].toUpperCase(), x0, top + 8.6, 5.4, 'DM Sans', 'left', width / 2 - 5, '700');
      text(parts[1].toUpperCase(), x1, top + 8.6, 5.4, 'DM Sans', 'right', width / 2 - 5, '700');
      ctx.save(); ctx.translate(mm(cx), mm(top + 8.6)); ctx.rotate(Math.PI / 2); drawIcon(ctx, ICONS.plane, 0, 0, mm(4)); ctx.restore();
    } else text(p.caption, cx, top + 8.4, 4.4, 'DM Sans', 'center', width, '700');
    ctx.save(); ctx.globalAlpha = .4; ctx.lineWidth = mm(.2); ctx.setLineDash([mm(.8), mm(.6)]); ctx.beginPath(); ctx.moveTo(mm(x0), mm(top + 12.4)); ctx.lineTo(mm(x1), mm(top + 12.4)); ctx.stroke(); ctx.restore();
    const barcode = Math.min(16, width * .35);
    faint(.75, () => text(p.note || '03 NOV · GATE B12 · SEAT 14A', x0, top + 16, 1.8, 'DM Sans', 'left', width - barcode - 2, '600'));
    let seed = Number(serial(p.id + p.caption, 6)) + 1, bx = x1 - barcode;
    while (bx < x1 - .3) { seed = (seed * 1103515245 + 12345) >>> 0; const bw = .2 + (seed % 4) * .15; ctx.fillRect(mm(bx), mm(top + 14), mm(Math.min(bw, x1 - bx)), mm(4)); bx += bw + .25 + (seed >> 8) % 3 * .12; }
  }
}
// The reagent spreads unevenly from the pod end: a ragged image edge, dark goo
// along the top and a few drips. Seeded by the photo id, so each print keeps its own.
function drawPeelEdges(ctx: CanvasRenderingContext2D, image: HTMLCanvasElement, p: Photo, pxPerMm: number, x: number, y: number, w: number, h: number) {
  let seed = Number(serial(p.id, 6)) + 3;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  // Smooth wobble: random knots every few millimetres, eased between, plus a fine grain.
  const wobble = (length: number, amp: number, spacing = 3.5) => {
    const knots = Array.from({ length: Math.ceil(length / spacing) + 2 }, () => rand() * amp);
    return (t: number) => { const i = Math.floor(t / spacing), f = (1 - Math.cos((t / spacing - i) * Math.PI)) / 2; return knots[i] + (knots[i + 1] - knots[i]) * f + (rand() - .5) * .08; };
  };
  const mm = (v: number) => v * pxPerMm, step = .5;
  const top = wobble(w, 1.6), right = wobble(h, .6, 6), bottom = wobble(w, .7, 5), left = wobble(h, .6, 6);
  const path = new Path2D();
  for (let i = 0; i <= w; i += step) path.lineTo(mm(x + i), mm(y + top(i)));
  for (let i = 0; i <= h; i += step) path.lineTo(mm(x + w - right(i)), mm(y + i));
  for (let i = w; i >= 0; i -= step) path.lineTo(mm(x + i), mm(y + h - bottom(i)));
  for (let i = h; i >= 0; i -= step) path.lineTo(mm(x + left(i)), mm(y + i));
  path.closePath();
  ctx.save(); ctx.clip(path); ctx.drawImage(image, mm(x), mm(y), mm(w), mm(h)); ctx.restore();
  // Reagent band at the pod end, with drips that run out of it into the image.
  const band = wobble(w + 1, 1.8, 4.5), goo = new Path2D();
  goo.moveTo(mm(x - .5), mm(y - .3));
  for (let i = 0; i <= w + 1; i += step) goo.lineTo(mm(x - .5 + i), mm(y + .5 + band(i)));
  goo.lineTo(mm(x + w + .5), mm(y - .3)); goo.closePath();
  for (let i = 0, count = 3 + Math.floor(rand() * 4); i < count; i++) {
    const at = 3 + rand() * (w - 6), base = y + .5 + band(at + .5) - .2, len = 1.2 + rand() ** 2 * 7, half = .35 + rand() * .55;
    goo.moveTo(mm(x + at - half * 1.8), mm(base));
    goo.quadraticCurveTo(mm(x + at - half), mm(base + len * .45), mm(x + at - half * .55), mm(base + len - half));
    goo.arc(mm(x + at), mm(base + len - half), mm(half * .55), Math.PI, 0, true);
    goo.quadraticCurveTo(mm(x + at + half), mm(base + len * .45), mm(x + at + half * 1.8), mm(base));
    goo.closePath();
  }
  ctx.save(); ctx.fillStyle = 'rgba(30,24,19,.9)'; ctx.fill(goo);
  // Thin faint streaks where the reagent ran along the long sides.
  ctx.globalAlpha = .35; ctx.strokeStyle = '#1e1813'; ctx.lineCap = 'round';
  for (const side of [x + left(2) + .15, x + w - right(2) - .15]) { const run = h * (.15 + rand() * .45); ctx.lineWidth = mm(.15 + rand() * .25); ctx.beginPath(); ctx.moveTo(mm(side), mm(y + 1.5)); ctx.lineTo(mm(side), mm(y + 1.5 + run)); ctx.stroke(); }
  ctx.restore();
}
function inkFor(frame: string) { return frame === '#302b38' ? '#fffdf7' : '#302b38'; }
export function renderPhoto(p: Photo, pxPerMm = 10, format: PrintFormat = 'mini'): HTMLCanvasElement {
  const spec = formats[format], size = photoSize(format), imageX = (size.width - spec.imageWidth) / 2, top = imageTop(format);
  const c = document.createElement('canvas'); c.width = Math.round(size.width * pxPerMm); c.height = Math.round(size.height * pxPerMm);
  const ctx = c.getContext('2d', { colorSpace: 'srgb' })!; ctx.fillStyle = p.frame; ctx.fillRect(0, 0, c.width, c.height);
  const image = photographicImage(p, pxPerMm, format);
  if (format === 'peel') drawPeelEdges(ctx, image, p, pxPerMm, imageX, top, spec.imageWidth, spec.imageHeight);
  else ctx.drawImage(image, imageX * pxPerMm, top * pxPerMm, spec.imageWidth * pxPerMm, spec.imageHeight * pxPerMm);
  if (pxPerMm >= PRINT_PX_PER_MM) { image.width = 1; image.height = 1; }
  const small = format === 'tiny' || format === 'tinyplain';
  if (p.stamp) drawStamp(ctx, p.stamp, imageX + spec.imageWidth - (small ? 1.4 : 2.2), top + spec.imageHeight - (small ? 1.4 : 2.2), pxPerMm, format === 'strip' ? 2 : small ? 1.5 : 2.4);
  if (format === 'strip' || format === 'matchbook' || !hasCaption(format)) return c;
  const ink = inkFor(p.frame);
  if (format === 'peel') {
    // A pen note on the narrow lower margin, the way pulled prints were labelled.
    ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const text = [p.caption.replace(/[♡☆✧❀☾☼∞⋈]/gu, '').trim(), p.note].filter(Boolean).join(' · ');
    let size = 3.4 * pxPerMm; ctx.font = `${size}px "${p.font}"`;
    while (ctx.measureText(text).width > spec.imageWidth * pxPerMm && size > pxPerMm * 1.4) { size -= .5; ctx.font = `${size}px "${p.font}"`; }
    ctx.fillText(text, spec.width / 2 * pxPerMm, (4 + spec.imageHeight + 4.4) * pxPerMm, spec.imageWidth * pxPerMm); return c;
  }
  if (p.style && p.style !== 'classic') { drawStyledCaption(ctx, p, pxPerMm, imageX, spec.imageWidth, 4 + spec.imageHeight, ink); return c; }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ink;
  const fitText = (text: string, y: number, size: number, font: string) => { let s = size * pxPerMm; ctx.font = `${s}px "${font}"`; while (ctx.measureText(text).width > spec.imageWidth * pxPerMm && s > pxPerMm * 1.2) { s -= .5; ctx.font = `${s}px "${font}"`; } ctx.fillText(text, spec.width / 2 * pxPerMm, y * pxPerMm, spec.imageWidth * pxPerMm); };
  // Caption and note sit at the same places in the band; a Tiny band is a scaled-down Mini's.
  const band = small ? { caption: 40.2, note: 43.9, scale: .62, noteSize: 1.6 } : { caption: 74.7, note: 81.2, scale: 1, noteSize: 2.25 };
  if (captionRuns(p.caption).some(r => r.doodle)) drawCaption(ctx, p, pxPerMm, spec.imageWidth, band.caption, band.scale);
  else fitText(p.caption, band.caption, captionSize(p.font) * band.scale, p.font);
  ctx.globalAlpha = .62; fitText(p.note, band.note, band.noteSize, 'DM Sans'); return c;
}
// A whole booth strip: up to four cells, then the first photo's caption at the foot.
export function renderStrip(photos: Photo[], pxPerMm = 10): HTMLCanvasElement {
  const spec = formats.strip, first = photos[0], c = document.createElement('canvas');
  c.width = Math.round(spec.width * pxPerMm); c.height = Math.round(spec.height * pxPerMm);
  const ctx = c.getContext('2d', { colorSpace: 'srgb' })!; ctx.fillStyle = first?.frame ?? '#fff'; ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 4; i++) {
    const y = 3 + i * 32.5, p = photos[i];
    if (!p) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.04)'; ctx.fillRect(3 * pxPerMm, y * pxPerMm, spec.imageWidth * pxPerMm, spec.imageHeight * pxPerMm); ctx.restore(); continue; }
    const cell = renderPhoto({ ...p, frame: first.frame }, pxPerMm, 'strip');
    ctx.drawImage(cell, 0, 4 * pxPerMm, cell.width, spec.imageHeight * pxPerMm, 0, y * pxPerMm, cell.width, spec.imageHeight * pxPerMm);
    cell.width = 1; cell.height = 1;
  }
  if (first) {
    ctx.fillStyle = inkFor(first.frame); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const fit = (text: string, y: number, size: number, font: string) => { let s = size * pxPerMm; ctx.font = `${s}px "${font}"`; while (ctx.measureText(text).width > spec.imageWidth * pxPerMm && s > pxPerMm * 1.2) { s -= .5; ctx.font = `${s}px "${font}"`; } ctx.fillText(text, spec.width / 2 * pxPerMm, y * pxPerMm, spec.imageWidth * pxPerMm); };
    fit(first.caption.replace(/[♡☆✧❀☾☼∞⋈]/gu, '').trim(), 136.6, first.font === 'Caveat' ? 4.4 : 3.2, first.font);
    ctx.globalAlpha = .62; fit(first.note, 142, 1.9, 'DM Sans');
  }
  return c;
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
// Run each cut on to the paper edge, or to the nearest print in its way, so a
// ruler or trimmer can line up the whole cut instead of a short segment.
export function guideLines(lines: CutLine[], slots: Slot[], paper: Paper): CutLine[] {
  return lines.map(l => {
    const h = l.axis === 'h', blockers = slots.filter(s => h ? s.y < l.at - 1e-5 && s.y + s.h > l.at + 1e-5 : s.x < l.at - 1e-5 && s.x + s.w > l.at + 1e-5);
    const lo = blockers.map(s => h ? s.x + s.w : s.y + s.h).filter(v => v <= l.start + 1e-5), hi = blockers.map(s => h ? s.x : s.y).filter(v => v >= l.end - 1e-5);
    return { ...l, start: Math.max(0, ...lo), end: Math.min(h ? paper.width : paper.height, ...hi) };
  }).sort((a, b) => (b.end - b.start) - (a.end - a.start) || (a.axis === b.axis ? a.at - b.at : a.axis === 'h' ? -1 : 1));
}
// Cut order: longest first, so the sheet becomes strips before strips become prints.
// A numbered badge sits on its cut, only where it clears every print. Photo labs
// and kiosks trim a few millimetres off each edge, so the badge moves inward until
// it is BADGE_SAFE from the paper edge, or as far in as the free paper allows.
// Among equally safe spots it stays nearest an end of the cut, and never on top of
// an earlier number. In thin margins every badge on the sheet shrinks, when that
// lets them sit further from the edge; one size per sheet keeps the numbers even.
// Cuts without room stay unnumbered; they are the last short cuts between prints.
const BADGE_R = 1.6, BADGE_SMALL_R = 1.1, BADGE_SAFE = 4, BADGE_CLEAR = .4;
export type BadgeSpot = { x: number; y: number; r: number; edge: number };
// One spot per guide, in cut order (null where a cut has no room).
export function badgeSpots(guides: CutLine[], slots: Slot[], paper: Paper) {
  const place = (r: number) => { const taken: BadgeSpot[] = []; return guides.map(l => { const spot = badgeSpot(l, slots, paper, r, taken); if (spot) taken.push(spot); return spot; }); };
  const full = place(BADGE_R), worst = (spots: (BadgeSpot | null)[]) => Math.min(BADGE_SAFE, ...spots.map(s => s?.edge ?? BADGE_SAFE));
  if (worst(full) >= BADGE_SAFE) return full;
  const small = place(BADGE_SMALL_R);
  return worst(small) > worst(full) + .3 && small.filter(Boolean).length >= full.filter(Boolean).length ? small : full;
}
export function badgeSpot(l: CutLine, slots: Slot[], paper: Paper, r = BADGE_R, taken: BadgeSpot[] = []): BadgeSpot | null {
  const step = .1;
  let best: (BadgeSpot & { near: number }) | null = null;
  for (let along = l.start + r; along <= l.end - r + 1e-7; along += step) {
    const x = l.axis === 'h' ? along : l.at, y = l.axis === 'h' ? l.at : along;
    const edge = Math.min(x - r, y - r, paper.width - x - r, paper.height - y - r);
    if (edge < 0 || slots.some(s => x + r + BADGE_CLEAR > s.x && x - r - BADGE_CLEAR < s.x + s.w && y + r + BADGE_CLEAR > s.y && y - r - BADGE_CLEAR < s.y + s.h)) continue;
    if (taken.some(t => Math.hypot(t.x - x, t.y - y) < t.r + r + BADGE_CLEAR)) continue;
    const safe = Math.min(BADGE_SAFE, Math.round(edge * 10) / 10), near = Math.min(along - l.start, l.end - along);
    if (!best || safe > best.edge || (safe === best.edge && near < best.near - 1e-7)) best = { x, y, r, edge: safe, near };
  }
  return best && { x: best.x, y: best.y, r: best.r, edge: best.edge };
}
// Cut guides must be easy to see on a white border under a lamp: a medium-light grey,
// 0.12 mm thick, in long dashes. Light enough not to read as part of a print.
const CUT_INK = '#a3a3a3', CUT_WIDTH = .12, cutDash = (pxPerMm: number) => [1.6 * pxPerMm, .7 * pxPerMm];
function drawCutNumber(ctx: CanvasRenderingContext2D, { x, y, r }: { x: number; y: number; r: number }, n: number, pxPerMm: number) {
  ctx.save(); ctx.setLineDash([]); ctx.fillStyle = '#fff'; ctx.strokeStyle = CUT_INK; ctx.lineWidth = Math.max(CUT_WIDTH * pxPerMm, 1.5);
  ctx.beginPath(); ctx.arc(x * pxPerMm, y * pxPerMm, r * pxPerMm, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#666'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `700 ${1.9 * r / BADGE_R * pxPerMm}px "DM Sans"`;
  ctx.fillText(String(n), x * pxPerMm, (y + .1) * pxPerMm); ctx.restore();
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
// Canvas text only uses faces the document has already fetched, including bold weights.
export function loadFonts(photos: Photo[]) {
  const faces = new Set(['16px "DM Sans"', '600 16px "DM Sans"', '700 16px "DM Sans"']);
  for (const p of photos) { faces.add(`16px "${p.font}"`); if (p.style === 'ticket') faces.add('16px "Special Elite"'); }
  return Promise.all([...faces].map(face => document.fonts.load(face))).then(() => document.fonts.ready);
}
// Flat matchbook, outside face up. Top to bottom: front cover, spine, back cover,
// spine, striker flap. Front and flap fold over, so they print upside down.
const MATCH = { cover: 48, front: 52, spine: 3, back: 55, flap: 12 };
export function renderMatchbook(photos: Photo[], pxPerMm = 10): HTMLCanvasElement {
  const spec = formats.matchbook, first = photos[0], c = document.createElement('canvas');
  c.width = Math.round(spec.width * pxPerMm); c.height = Math.round(spec.height * pxPerMm);
  const ctx = c.getContext('2d', { colorSpace: 'srgb' })!, mm = (v: number) => v * pxPerMm;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
  const { cover, front, spine, back, flap } = MATCH, backTop = front + spine, flapTop = backTop + back + spine;
  const color = first?.frame ?? '#302b38', ink = inkFor(color);
  ctx.fillStyle = color; ctx.fillRect(0, 0, mm(cover), mm(flapTop + flap));
  const text = (t: string, x: number, y: number, size: number, font: string, max: number, weight = '', spacing = 0) => {
    let s = size; const set = () => { ctx.font = `${weight} ${mm(s)}px "${font}"`; ctx.letterSpacing = `${mm(spacing * s / size)}px`; };
    set(); while (ctx.measureText(t).width > mm(max) && s > 1) { s -= .1; set(); }
    ctx.fillText(t, mm(x), mm(y)); ctx.letterSpacing = '0px';
  };
  const upsideDown = (cx: number, cy: number, draw: () => void) => { ctx.save(); ctx.translate(mm(cx), mm(cy)); ctx.rotate(Math.PI); ctx.translate(-mm(cx), -mm(cy)); draw(); ctx.restore(); };
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ctx.strokeStyle = ink;
  const name = first?.caption.replace(/[♡☆✧❀☾☼∞⋈]/gu, '').trim() || 'Hotel Afterglow';
  const year = first?.note.match(/\b(19|20)\d{2}\b/)?.[0] ?? String(new Date().getFullYear());
  const place = (first?.note ?? '').replace(/\b(19|20)\d{2}\b/, '').replace(/[·,\s]+$/, '').trim();
  // Front cover, read with the hinge at the top; its lower 12 mm hides under the flap.
  upsideDown(cover / 2, front / 2, () => {
    ctx.lineWidth = mm(.3); ctx.strokeRect(mm(3), mm(3), mm(cover - 6), mm(front - flap - 5));
    ctx.lineWidth = mm(.15); ctx.strokeRect(mm(3.9), mm(3.9), mm(cover - 7.8), mm(front - flap - 6.8));
    text(`EST. ${year}`, cover / 2, 9, 1.7, 'DM Sans', cover - 12, '700', .5);
    text(name, cover / 2, 19, 6, first?.font ?? 'Caveat', cover - 11);
    ctx.save(); ctx.globalAlpha = .7; ctx.lineWidth = mm(.2); ctx.beginPath(); ctx.moveTo(mm(12), mm(26)); ctx.lineTo(mm(cover - 12), mm(26)); ctx.stroke(); ctx.restore();
    if (place) text(place.toUpperCase(), cover / 2, 30.5, 1.8, 'DM Sans', cover - 12, '600', .35);
  });
  // Back cover, read from behind with the hinge at the top.
  const memories = photos.length === 1 ? '1 MEMORY INSIDE' : `${photos.length} MEMORIES INSIDE`;
  text(memories, cover / 2, backTop + back / 2 - 2.5, 1.8, 'DM Sans', cover - 10, '700', .5);
  ctx.save(); ctx.globalAlpha = .65; text('OPEN WITH CARE', cover / 2, backTop + back / 2 + 2.2, 1.4, 'DM Sans', cover - 10, '600', .4); ctx.restore();
  // Striker flap: a gritty band and the classic warning, folded up over the front.
  upsideDown(cover / 2, flapTop + flap / 2, () => {
    let seed = 41; const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    ctx.save(); ctx.fillStyle = '#5b4a3c'; ctx.fillRect(mm(4), mm(flapTop + 5), mm(cover - 8), mm(4.4));
    ctx.fillStyle = 'rgba(255,240,220,.18)'; for (let i = 0; i < (cover - 8) * 4.4 * 6; i++) ctx.fillRect(mm(4 + rand() * (cover - 8)), mm(flapTop + 5 + rand() * 4.4), mm(.12), mm(.12));
    ctx.restore(); text('CLOSE COVER BEFORE STRIKING', cover / 2, flapTop + 2.7, 1.25, 'DM Sans', cover - 8, '700', .3);
  });
  // Score lines across the spines, then the cards that sit inside like matches.
  ctx.save(); ctx.strokeStyle = '#9a9a9a'; ctx.lineWidth = Math.max(mm(.1), 1); ctx.setLineDash([mm(2), mm(.7), mm(.3), mm(.7)]);
  for (const y of [front, backTop, backTop + back, flapTop]) { ctx.beginPath(); ctx.moveTo(0, mm(y)); ctx.lineTo(mm(cover), mm(y)); ctx.stroke(); }
  ctx.setLineDash(cutDash(pxPerMm)); ctx.strokeStyle = CUT_INK; ctx.lineWidth = Math.max(mm(CUT_WIDTH), 1.5);
  ctx.beginPath(); ctx.moveTo(mm(cover), 0); ctx.lineTo(mm(cover), mm(spec.height));
  const card = photoSize('matchbook');
  for (let i = 1; i <= 2; i++) { ctx.moveTo(mm(cover), mm(card.height * i)); ctx.lineTo(mm(spec.width), mm(card.height * i)); }
  ctx.stroke(); ctx.restore();
  photos.slice(0, 2).forEach((p, i) => { const img = renderPhoto({ ...p, frame: color }, pxPerMm, 'matchbook'); ctx.drawImage(img, mm(cover), mm(card.height * i)); img.width = 1; img.height = 1; });
  return c;
}
export type SheetOptions = { format: PrintFormat; mode: LayoutMode; labels?: string[] };
export async function renderSheet(photos: Photo[], paper: Paper, guides: boolean, pxPerMm = PRINT_PX_PER_MM, options: SheetOptions = { format: 'mini', mode: 'easy' }) {
  // Font faces inside closed style controls may not have been requested yet.
  await loadFonts(photos);
  await document.fonts.ready;
  const labels = options.labels ?? [], spec = formats[options.format], per = photosPerPrint(options.format);
  const prints = Array.from({ length: Math.ceil(photos.length / per) }, (_, i) => photos.slice(i * per, i * per + per));
  const { slots, lines } = sheetLayout(paper, options.format, options.mode, labels.length > 0, prints.length);
  const c = document.createElement('canvas'); c.width = Math.round(paper.width * pxPerMm); c.height = Math.round(paper.height * pxPerMm);
  const ctx = c.getContext('2d', { colorSpace: 'srgb' })!; ctx.imageSmoothingQuality = 'high'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    // Give loading feedback and input events a turn between high-resolution prints.
    if (pxPerMm >= PRINT_PX_PER_MM) await new Promise(resolve => setTimeout(resolve, 0));
    const image = options.format === 'strip' ? renderStrip(prints[i], pxPerMm) : options.format === 'matchbook' ? renderMatchbook(prints[i], pxPerMm) : renderPhoto(photos[i], pxPerMm, options.format); ctx.save(); ctx.translate(s.x * pxPerMm, s.y * pxPerMm);
    if (s.rotate) { ctx.translate(s.w * pxPerMm, 0); ctx.rotate(Math.PI / 2); }
    ctx.drawImage(image, 0, 0, spec.width * pxPerMm, spec.height * pxPerMm); ctx.restore();
    image.width = 1; image.height = 1;
    if (labels[i]) {
      ctx.save(); ctx.fillStyle = '#555'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.font = `${1.5 * pxPerMm}px "DM Sans"`;
      ctx.fillText(labels[i], (s.x + s.w / 2) * pxPerMm, (s.y - .45) * pxPerMm, s.w * pxPerMm); ctx.restore();
    }
  }
  if (guides) {
    ctx.save(); ctx.strokeStyle = CUT_INK; ctx.lineWidth = Math.max(CUT_WIDTH * pxPerMm, 1.5); ctx.setLineDash(cutDash(pxPerMm));
    const ordered = guideLines(lines, slots, paper);
    ctx.beginPath(); ordered.forEach(l => {
      ctx.moveTo((l.axis === 'h' ? l.start : l.at) * pxPerMm, (l.axis === 'h' ? l.at : l.start) * pxPerMm);
      ctx.lineTo((l.axis === 'h' ? l.end : l.at) * pxPerMm, (l.axis === 'h' ? l.at : l.end) * pxPerMm);
    }); ctx.stroke(); ctx.restore();
    badgeSpots(ordered, slots, paper).filter(spot => spot !== null).forEach((spot, i) => drawCutNumber(ctx, spot, i + 1, pxPerMm));
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
