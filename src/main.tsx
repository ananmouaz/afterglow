import React, { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Aperture, ArrowDownToLine, ArrowLeft, ArrowRight, Check, Info, LockKeyhole, Plus, RotateCw, SlidersHorizontal, Undo2, LoaderCircle, X } from 'lucide-react';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/caveat/400.css';
import '@fontsource/special-elite/400.css';
import '@fontsource/permanent-marker/400.css';
import { films, fontOptions, frames, doodles, readPhoto, loadImage, newPhoto, renderPhoto, renderSheet, sheetLayout, download, jpegPrint, canvasBlob, formats, formatChoices, paperChoices, paginate, photoSize, photosPerPrint, supportsStyles, printStyles, todayStamp, loadFonts, STAMP_CHARS, MAX_PHOTOS, type PrintFormat, type PrintStyle, type LayoutMode, type Photo, type Paper } from './engine';
import './style.css';

const Print = memo(function Print({ photo, format, pxPerMm: requestedScale, className = '' }: { photo: Photo; format: PrintFormat; pxPerMm?: number; className?: string }) {
  const pxPerMm = requestedScale ?? Math.min(14, 1080 / formats[format].width);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    const task = requestAnimationFrame(() => { loadFonts([photo]).then(() => {
      if (cancelled || !canvas.current) return;
      // Bound interactive buffers independently of the 600 DPI export renderer.
      const image = renderPhoto(photo, pxPerMm, format);
      if (canvas.current.width !== image.width || canvas.current.height !== image.height) { canvas.current.width = image.width; canvas.current.height = image.height; }
      canvas.current.getContext('2d')!.drawImage(image, 0, 0);
    }); });
    return () => { cancelled = true; cancelAnimationFrame(task); };
  }, [photo, format, pxPerMm]);
  return <canvas ref={canvas} width={photoSize(format).width * pxPerMm} height={photoSize(format).height * pxPerMm} className={className} aria-label={`Instant photo${photo.caption ? `: ${photo.caption}` : ''}`} role="img"/>;
});
// Dev only: `?demo=4` opens the print page with 4 sample prints, for checking sheets.
const demoCount = import.meta.env.DEV ? Math.min(MAX_PHOTOS, Math.max(0, Math.floor(Number(new URLSearchParams(location.search).get('demo'))) || 0)) : 0;
function WelcomePrint({ format }: { format: PrintFormat }) {
  const [sample, setSample] = useState<Photo | null>(null);
  useEffect(() => {
    let cancelled = false;
    const sampleSrc = `${import.meta.env.BASE_URL}demo-beach.jpg`;
    loadImage(sampleSrc).then(image => {
      if (!cancelled) setSample({ ...newPhoto(image, sampleSrc), caption: 'slow mornings.', note: 'by the sea' });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return <div className="welcome-art" aria-hidden="true">{sample && <Print photo={sample} format={format} pxPerMm={6}/>}</div>;
}
const FilmThumb = memo(function FilmThumb({ photo, film, format }: { photo: Photo; film: typeof films[number]; format: PrintFormat }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const spec = formats[format];
    const img = renderPhoto({ ...photo, film: film.id, caption: '', note: '', strength: 85, grain: 0, leak: false }, 3, format);
    const c = canvas.current!; c.width = spec.imageWidth * 3; c.height = spec.imageHeight * 3;
    c.getContext('2d')!.drawImage(img, (spec.width - spec.imageWidth) / 2 * 3, 12, spec.imageWidth * 3, spec.imageHeight * 3, 0, 0, c.width, c.height);
  }, [photo.image, photo.zoom, photo.panX, photo.panY, photo.rotation, photo.exposure, photo.softening, photo.flash, film.id, format]);
  return <canvas ref={canvas} width={formats[format].imageWidth * 3} height={formats[format].imageHeight * 3} aria-hidden="true"/>;
}, (a, b) => a.film.id === b.film.id && a.format === b.format && ['image', 'zoom', 'panX', 'panY', 'rotation', 'exposure', 'softening', 'flash'].every(k => a.photo[k as keyof Photo] === b.photo[k as keyof Photo]));
function Modal({ title, children, onClose, busy = false }: { title: string; children: React.ReactNode; onClose: () => void; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef(document.activeElement as HTMLElement | null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => { dialog?.close(); if (opener.current?.isConnected) opener.current.focus({ preventScroll: true }); }; }, []);
  return <dialog ref={ref} onCancel={e => { e.preventDefault(); if (!busy) onClose(); }} onClick={e => { if (!busy && e.target === e.currentTarget) onClose(); }} aria-labelledby="modal-title"><div className="modal-head"><h2 id="modal-title">{title}</h2><button className="icon-button" disabled={busy} onClick={onClose} aria-label="Close dialog"><X size={20}/></button></div>{children}</dialog>;
}
function Range({ label, value, onChange, min = 0, max = 100, step = 1, unit = '%' }: { label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; unit?: string }) {
  return <label className="range-control" style={{ '--range-fill': `${(value - min) / (max - min) * 100}%` } as React.CSSProperties}><span>{label}<output>{value.toFixed(step < 1 ? 2 : 0)}{unit}</output></span><input aria-label={label} aria-valuetext={`${value.toFixed(step < 1 ? 2 : 0)}${unit === '×' ? ' times' : unit}`} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)}/></label>;
}
function FormatPicker({ value, onChange, visual = false }: { value: PrintFormat; onChange: (format: PrintFormat) => void; visual?: boolean }) {
  if (visual) return <fieldset className="format-choices"><legend>Print size</legend><div>{formatChoices.map(f => <button key={f} type="button" aria-pressed={value === f} onClick={() => onChange(f)}><span className="format-silhouette" style={{ aspectRatio: `${formats[f].width}/${formats[f].height}` }}><i style={{ aspectRatio: `${formats[f].imageWidth}/${formats[f].imageHeight}` }}/></span><strong>{formats[f].name}</strong><small>{photosPerPrint(f) > 1 ? `${photosPerPrint(f)} photos · ` : ''}{formats[f].width} × {formats[f].height} mm</small>{value === f && <Check className="format-check" size={13}/>}</button>)}</div></fieldset>;
  return <div className="format-picker"><label className="field-label" htmlFor="print-format">Finished print size</label><select id="print-format" value={value} onChange={e => onChange(e.target.value as PrintFormat)}>{formatChoices.map(f => <option key={f} value={f}>{formats[f].name} · {formats[f].width} × {formats[f].height} mm</option>)}</select></div>;
}
function capacityFor(paper: Paper, format: PrintFormat, mode: LayoutMode, labeled = false) {
  try { return sheetLayout(paper, format, mode, labeled).capacity; } catch { return 0; }
}
const steps = ['Crop', 'Look', 'Caption'];
const styleFields: Record<PrintStyle, { caption: string; captionHint: string; note: string; noteHint: string }> = {
  classic: { caption: 'Caption', captionHint: 'The good old days…', note: 'Date or place', noteHint: 'Berlin, November 2026' },
  player: { caption: 'Song', captionHint: 'Our song', note: 'Artist', noteHint: 'Who sings it' },
  ticket: { caption: 'Event', captionHint: 'Our first movie night', note: 'Date and seat', noteHint: '03.11.26 · Row F · Seat 12' },
  boarding: { caption: 'Route', captionHint: 'CGN → BCN', note: 'Date, gate and seat', noteHint: '03 NOV · GATE B12 · SEAT 14A' },
};
function App() {
  const pageScroll = useRef<Record<string, number>>({ welcome: 0, tray: 0, print: 0 });
  const returnPhoto = useRef('');
  const cropDrag = useRef<{ x: number; y: number; panX: number; panY: number; overflowX: number; overflowY: number } | null>(null);
  const captionRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<Photo | null>(null), [tray, setTray] = useState<Photo[]>([]);
  const [queuedPhotos, setQueuedPhotos] = useState<Photo[]>([]);
  const pickerMode = useRef<'add' | 'replace'>('add'), uploadBusy = useRef(false), uploadGeneration = useRef(0), savedId = useRef('');
  const [screen, setScreen] = useState<'welcome' | 'edit' | 'tray' | 'print'>('welcome'), [step, setStep] = useState(0);
  const [compare, setCompare] = useState(false), [advanced, setAdvanced] = useState(false), [creativeOpen, setCreativeOpen] = useState(false);
  const [captionError, setCaptionError] = useState(false);
  const [notice, setNotice] = useState(''), [uploadProgress, setUploadProgress] = useState(''), [exportStatus, setExportStatus] = useState('');
  const [removed, setRemoved] = useState<{ photo: Photo; index: number } | null>(null);
  const [error, setError] = useState(''), [loading, setLoading] = useState(false), [exporting, setExporting] = useState(false);
  const [dialog, setDialog] = useState<'guide' | 'export' | 'cancel' | 'home' | null>(null);
  const [paper, setPaper] = useState<Paper>({ width: 150, height: 200 }), [guides, setGuides] = useState(true);
  const [format, setFormat] = useState<PrintFormat>('mini'), [layoutMode, setLayoutMode] = useState<LayoutMode>('easy');
  const [pageIndex, setPageIndex] = useState(0), [prices, setPrices] = useState<Record<string, string>>({});
  const spec = formats[format];
  const slotsAvailable = MAX_PHOTOS - tray.length - (removed ? 1 : 0);
  const adjustments = photo ? [photo.exposure, photo.softening, photo.flash, photo.grain, photo.leak].filter(Boolean).length : 0;
  const layoutResult = useMemo(() => {
    try { return { plan: sheetLayout(paper, format, layoutMode), error: '' }; }
    catch (e) { return { plan: null, error: (e as Error).message }; }
  }, [paper, format, layoutMode]);
  const capacity = layoutResult.plan?.capacity ?? 0;
  // Strips take four photos each, in tray order, so pages fill strip by strip.
  const perPrint = photosPerPrint(format), printCount = Math.ceil(tray.length / perPrint);
  const pages = useMemo(() => perPrint > 1 && capacity ? Array.from({ length: Math.ceil(tray.length / (capacity * perPrint)) }, (_, i) => tray.slice(i * capacity * perPrint, (i + 1) * capacity * perPrint)) : paginate(tray, capacity), [tray, capacity, perPrint]);
  const currentPage = Math.min(pageIndex, Math.max(0, pages.length - 1));
  const currentLayout = useMemo(() => capacity ? sheetLayout(paper, format, layoutMode, false, Math.ceil((pages[currentPage]?.length ?? 0) / perPrint)) : null, [capacity, paper, format, layoutMode, pages, currentPage]);
  const paperKey = `${paper.width}x${paper.height}`, price = prices[paperKey] ?? '';
  const priceError = price.trim() && (!/^(?:\d+(?:[.,]\d{1,2})?|[.,]\d{1,2})$/.test(price.trim()) || Number(price.replace(',', '.')) > 999) ? 'Enter €0 to €999 with up to two decimal places.' : '';
  const totalCost = price.trim() && !priceError ? pages.length * Number(price.replace(',', '.')) : null;
  useEffect(() => setPageIndex(i => Math.min(i, Math.max(0, pages.length - 1))), [pages.length]);
  useEffect(() => {
    if (!demoCount) return;
    const src = `${import.meta.env.BASE_URL}demo-beach.jpg`;
    loadImage(src).then(image => { setTray(Array.from({ length: demoCount }, (_, i) => ({ ...newPhoto(image, src, true), caption: `Demo print ${i + 1}` }))); setScreen('print'); }).catch(() => {});
  }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 4000); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => {
    if ((!tray.length && !photo) || demoCount) return;
    const preventLoss = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', preventLoss);
    return () => window.removeEventListener('beforeunload', preventLoss);
  }, [tray.length, !!photo]);
  const fileRef = useRef<HTMLInputElement>(null), sheetRef = useRef<HTMLCanvasElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    let frame = 0;
    const resize = () => {
      root.classList.toggle('large-text', parseFloat(getComputedStyle(root).fontSize) > 20 || window.innerWidth < 300);
      const active = document.activeElement;
      const typing = active instanceof HTMLInputElement && !['file', 'range', 'checkbox', 'button', 'submit'].includes(active.type);
      // iOS can pan the visual viewport as well as shrink it. Follow both,
      // including the keyboard's closing animation after the input loses focus.
      const keyboard = !!viewport && viewport.scale === 1 && viewport.height < window.innerHeight - 120
        && (typing || root.classList.contains('keyboard-open'));
      root.classList.toggle('keyboard-open', keyboard);
      if (keyboard && viewport) {
        root.style.setProperty('--keyboard-height', `${viewport.height}px`);
        root.style.setProperty('--keyboard-top', `${viewport.offsetTop}px`);
        // Scroll only the controls, never ask Safari to pan the whole document.
        const controls = active?.closest('.edit-controls');
        if (typing && controls) {
          const field = active.getBoundingClientRect(), panel = controls.getBoundingClientRect();
          const inset = Math.max(0, Math.min(12, (panel.height - field.height) / 2));
          if (field.bottom > panel.bottom - inset) controls.scrollTop += field.bottom - panel.bottom + inset;
          else if (field.top < panel.top + inset) controls.scrollTop += field.top - panel.top - inset;
        }
      } else {
        root.style.removeProperty('--keyboard-height');
        root.style.removeProperty('--keyboard-top');
      }
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(resize); };
    const done = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.isComposing && event.target instanceof HTMLInputElement
        && event.target.enterKeyHint === 'done') {
        event.preventDefault(); event.target.blur();
      }
    };
    resize(); window.addEventListener('resize', schedule);
    viewport?.addEventListener('resize', schedule); viewport?.addEventListener('scroll', schedule);
    document.addEventListener('focusin', schedule); document.addEventListener('focusout', schedule);
    document.addEventListener('keydown', done);
    return () => {
      cancelAnimationFrame(frame); window.removeEventListener('resize', schedule);
      viewport?.removeEventListener('resize', schedule); viewport?.removeEventListener('scroll', schedule);
      document.removeEventListener('focusin', schedule); document.removeEventListener('focusout', schedule);
      document.removeEventListener('keydown', done);
      root.style.removeProperty('--keyboard-height'); root.style.removeProperty('--keyboard-top'); root.classList.remove('keyboard-open');
    };
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('editor-open', screen === 'edit');
    if (screen === 'edit') savedId.current = '';
    return () => document.documentElement.classList.remove('editor-open');
  }, [screen]);
  useEffect(() => { controlRef.current?.scrollTo(0, 0); setCompare(false); }, [step]);
  useEffect(() => setCaptionError(false), [photo?.id]);
  useLayoutEffect(() => {
    window.scrollTo(0, pageScroll.current[screen] ?? 0);
    if (screen === 'tray' || screen === 'print') {
      const target = screen === 'tray' && returnPhoto.current ? document.querySelector<HTMLElement>(`[data-photo-id="${returnPhoto.current}"] .tray-photo`) : null;
      (target ?? document.querySelector<HTMLElement>('main h1'))?.focus({ preventScroll: true });
    }
  }, [screen]);
  useEffect(() => {
    if (screen !== 'print') return;
    let cancelled = false;
    renderSheet(pages[currentPage] ?? [], paper, guides, 4, { format, mode: layoutMode }).then(c => {
      if (cancelled || !sheetRef.current) return;
      sheetRef.current.width = c.width; sheetRef.current.height = c.height;
      sheetRef.current.getContext('2d')!.drawImage(c, 0, 0);
    }).catch(() => { if (!cancelled && sheetRef.current) sheetRef.current.width = 0; });
    return () => { cancelled = true; };
  }, [screen, pages, currentPage, paper, guides, format, layoutMode]);
  function navigate(next: typeof screen) {
    if (next === 'print') setNotice('');
    if (screen !== 'edit') pageScroll.current[screen] = window.scrollY;
    setScreen(next);
  }
  function cancelEdit() {
    const saved = photo && tray.find(p => p.id === photo.id);
    if (saved && photo && (Object.keys(saved) as (keyof Photo)[]).every(key => saved[key] === photo[key])) discard();
    else setDialog('cancel');
  }
  function keepRemoved() {
    if (!removed) return;
    URL.revokeObjectURL(removed.photo.src); setRemoved(null);
  }
  function undoRemoval() {
    if (!removed || tray.length >= MAX_PHOTOS) return;
    returnPhoto.current = removed.photo.id;
    setTray(old => { const restored = [...old]; restored.splice(Math.min(removed.index, old.length), 0, removed.photo); return restored; });
    setRemoved(null); setNotice('Photo restored'); navigate('tray');
  }
  function update(patch: Partial<Photo>) { if (patch.caption !== undefined) setCaptionError(false); setCompare(false); setPhoto(old => old ? { ...old, ...patch } : old); }
  function startCropDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!photo || step !== 0 || compare || loading || cropDrag.current || !event.isPrimary || event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const view = photoSize(format), pixelScale = Math.min(rect.width / view.width, rect.height / view.height);
    const left = rect.left + (rect.width - view.width * pixelScale) / 2 + (spec.width - spec.imageWidth) / 2 * pixelScale;
    const top = rect.top + (rect.height - view.height * pixelScale) / 2 + 4 * pixelScale;
    if (event.clientX < left || event.clientX > left + spec.imageWidth * pixelScale || event.clientY < top || event.clientY > top + spec.imageHeight * pixelScale) return;
    const rotated = photo.rotation % 180 !== 0;
    const width = rotated ? photo.image.naturalHeight : photo.image.naturalWidth, height = rotated ? photo.image.naturalWidth : photo.image.naturalHeight;
    const scale = Math.max(spec.imageWidth / width, spec.imageHeight / height) * photo.zoom;
    cropDrag.current = { x: event.clientX, y: event.clientY, panX: photo.panX, panY: photo.panY, overflowX: (width * scale - spec.imageWidth) * pixelScale, overflowY: (height * scale - spec.imageHeight) * pixelScale };
    event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.dataset.dragging = 'true';
  }
  function moveCropDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = cropDrag.current; if (!drag || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const clamp = (value: number) => Math.max(-1, Math.min(1, value));
    update({ panX: drag.overflowX > .1 ? clamp(drag.panX + (event.clientX - drag.x) * 2 / drag.overflowX) : 0, panY: drag.overflowY > .1 ? clamp(drag.panY + (event.clientY - drag.y) * 2 / drag.overflowY) : 0 });
  }
  function endCropDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    cropDrag.current = null; delete event.currentTarget.dataset.dragging;
  }
  function choosePhotos(mode: 'add' | 'replace') {
    if (uploadBusy.current || !fileRef.current) return;
    if (mode === 'add' && slotsAvailable < 1) { setError('Choose Undo or Keep removed to free the reserved space.'); return; }
    pickerMode.current = mode;
    fileRef.current.multiple = mode === 'add'; fileRef.current.value = '';
    fileRef.current.click();
  }
  async function upload(files: FileList | null) {
    if (!files?.length || uploadBusy.current) return;
    const chosen = Array.from(files), replacing = pickerMode.current === 'replace';
    const available = replacing ? 1 : slotsAvailable;
    setError('');
    if (chosen.length > available || available < 1) {
      setError(replacing ? 'Choose one replacement photo. Your saved photos are safe.' : available < 1 ? 'Choose Undo or Keep removed to free the reserved space. Your saved photos are safe.' : `Choose up to ${available} more ${available === 1 ? 'photo' : 'photos'}. Your saved photos are safe.`);
      if (fileRef.current) fileRef.current.value = ''; return;
    }
    uploadBusy.current = true; const request = ++uploadGeneration.current;
    setLoading(true); const loaded: Photo[] = [];
    try {
      for (const [index, file] of chosen.entries()) {
        setUploadProgress(`Opening photo ${index + 1} of ${chosen.length}…`);
        const next = await readPhoto(file); loaded.push(next);
        if (request !== uploadGeneration.current) { loaded.forEach(p => URL.revokeObjectURL(p.src)); return; }
      }
      if (replacing && photo) {
        if (!tray.some(p => p.src === photo.src)) URL.revokeObjectURL(photo.src);
        const replacement = loaded[0];
        setPhoto(current => current ? { ...current, image: replacement.image, src: replacement.src, sample: false, zoom: 1, panX: 0, panY: 0, rotation: 0 } : null);
      } else {
        returnPhoto.current = ''; setPhoto(loaded[0]); setQueuedPhotos(loaded.slice(1)); setStep(0); navigate('edit');
      }
      setAdvanced(false); setCompare(false); savedId.current = '';
    } catch (e) {
      loaded.forEach(p => URL.revokeObjectURL(p.src));
      if (request === uploadGeneration.current) setError(`${(e as Error).message} Your saved photos are safe.`);
    } finally {
      if (request === uploadGeneration.current) {
        uploadBusy.current = false; setLoading(false); setUploadProgress('');
        if (fileRef.current) fileRef.current.value = '';
      }
    }
  }
  function save() {
    if (!photo || uploadBusy.current || savedId.current === photo.id) return;
    savedId.current = photo.id;
    const previous = tray.find(p => p.id === photo.id);
    if (previous && previous.src !== photo.src) URL.revokeObjectURL(previous.src);
    setTray(old => old.some(p => p.id === photo.id) ? old.map(p => p.id === photo.id ? photo : p) : [...old, photo]);
    if (queuedPhotos.length) {
      setPhoto(queuedPhotos[0]); setQueuedPhotos(old => old.slice(1)); setStep(0); setAdvanced(false);
      controlRef.current?.scrollTo(0, 0);
    } else { navigate('tray'); setPhoto(null); }
    setCompare(false); setNotice(previous ? 'Changes saved' : 'Photo added to your tray');
  }
  function discard() {
    ++uploadGeneration.current; uploadBusy.current = false; setLoading(false); setUploadProgress('');
    if (photo && !tray.some(p => p.src === photo.src)) URL.revokeObjectURL(photo.src);
    queuedPhotos.forEach(p => URL.revokeObjectURL(p.src)); setQueuedPhotos([]);
    setPhoto(null); setDialog(null); setError(''); navigate(tray.length ? 'tray' : 'welcome');
  }
  function goHome() {
    if (tray.length || removed) setDialog('home'); else navigate('welcome');
  }
  function startOver() {
    tray.forEach(p => URL.revokeObjectURL(p.src)); setTray([]);
    if (removed) URL.revokeObjectURL(removed.photo.src); setRemoved(null);
    setPageIndex(0); setNotice(''); setExportStatus(''); setDialog(null); navigate('welcome');
  }
  function remove(p: Photo) {
    if (removed) URL.revokeObjectURL(removed.photo.src);
    setRemoved({ photo: p, index: tray.findIndex(x => x.id === p.id) }); setNotice('');
    const next = tray.filter(x => x.id !== p.id); setTray(next);
    if (!next.length) navigate('welcome');
  }
  const paperError = layoutResult.error;
  async function exportFile(kind: 'jpg' | 'pdf') {
    if (exporting) return; setExporting(true); setError(''); setExportStatus('Preparing your print…');
    await new Promise(resolve => setTimeout(resolve, 50));
    try {
      if (!pages.length || paperError) throw new Error(paperError || 'Add a photo first.');
      const name = `afterglow-${format}-${paper.width}x${paper.height}mm`;
      if (kind === 'jpg') {
        setExportStatus(`Preparing JPG sheet ${currentPage + 1} of ${pages.length}…`);
        const c = await renderSheet(pages[currentPage], paper, guides, undefined, { format, mode: layoutMode });
        download(await jpegPrint(c), `${name}-${Math.ceil(pages[currentPage].length / perPrint)}prints${pages.length > 1 ? `-sheet${currentPage + 1}-of${pages.length}` : ''}.jpg`);
        c.width = 1; c.height = 1;
      } else {
        const { jsPDF } = await import('jspdf');
        const orientation = paper.width > paper.height ? 'landscape' as const : 'portrait' as const;
        const pdf = new jsPDF({ orientation, unit: 'mm', format: [paper.width, paper.height], compress: true });
        for (let i = 0; i < pages.length; i++) {
          setExportStatus(`Preparing PDF sheet ${i + 1} of ${pages.length}…`);
          await new Promise(resolve => setTimeout(resolve, 0));
          if (i) pdf.addPage([paper.width, paper.height], orientation);
          const c = await renderSheet(pages[i], paper, guides, undefined, { format, mode: layoutMode });
          const png = new Uint8Array(await (await canvasBlob(c, 'image/png')).arrayBuffer());
          pdf.addImage(png, 'PNG', 0, 0, paper.width, paper.height, undefined, 'FAST');
          c.width = 1; c.height = 1;
        }
        pdf.setProperties({ title: 'Afterglow · true-size instant prints', subject: `Print at 100% / Actual size. ${spec.name} frames: ${spec.width} × ${spec.height} mm.` });
        download(pdf.output('blob'), `${name}-${printCount}prints-${pages.length}sheets.pdf`);
      }
      setExportStatus(`${kind.toUpperCase()} ready: ${kind === 'jpg' ? `sheet ${currentPage + 1} of ${pages.length}` : `${pages.length} ${pages.length === 1 ? 'sheet' : 'sheets'}`}. Check your downloads.`);
    } catch (e) { setError((e as Error).message); setExportStatus(''); }
    finally { setExporting(false); }
  }
  function renderFilm(f: typeof films[number]) { if (!photo) return null; return (<button key={f.id} data-film={f.id} title={f.description} className={`film-button ${photo.film === f.id ? 'selected' : ''}`} aria-pressed={photo.film === f.id} onClick={() => update(f.id.startsWith('instax') ? { film: f.id, grain: 0, leak: false } : { film: f.id })}><FilmThumb photo={photo} film={f} format={format}/>{photo.film === f.id && <Check className="film-check" size={12}/>}<span>{f.name}</span></button>); }
  function renderDoodle(d: typeof doodles[number]) { if (!photo) return null; return (<button key={d.symbol} type="button" aria-label={`Add ${d.name.toLowerCase()} doodle`} title={d.name} onPointerDown={e => e.preventDefault()} onClick={() => {
            const input = captionRef.current; if (!input) return;
            const start = input.selectionStart ?? photo.caption.length, end = input.selectionEnd ?? start;
            const caption = photo.caption.slice(0, start) + d.symbol + photo.caption.slice(end);
            if (caption.length > 45) { setCaptionError(true); return; }
            update({ caption });
            requestAnimationFrame(() => captionRef.current?.setSelectionRange(start + d.symbol.length, start + d.symbol.length));
          }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d.path}/></svg></button>); }
  const undoNotice = removed && <div className="undo-notice" role="status"><div><strong>Photo removed</strong><p>One space is reserved so you can restore it.</p></div><div><button className="outline-button" onClick={undoRemoval}>Undo</button><button className="text-button" onClick={keepRemoved}>Keep removed</button></div></div>;
  const fields = styleFields[supportsStyles(format) ? photo?.style ?? 'classic' : 'classic'];
  const displayed = photo && compare ? { ...photo, film: 'original' as const, grain: 0, leak: false, exposure: 0, softening: 0, flash: 0 } : photo;
  return <div className={`app ${screen === 'edit' ? 'editing' : ''}`}>
    <header className="site-header">
      {screen === 'edit' && photo ? <><button className="text-button" onClick={cancelEdit}>Cancel</button><span className="editor-header-title">Photo {tray.findIndex(p => p.id === photo.id) >= 0 ? tray.findIndex(p => p.id === photo.id) + 1 : tray.length + 1} of {tray.length + queuedPhotos.length + (tray.some(p => p.id === photo.id) ? 0 : 1)}</span></> : <button className="wordmark" aria-label="Afterglow home" onClick={goHome}><Aperture size={20} aria-hidden="true"/>afterglow</button>}
      <button className="icon-button" aria-label="Printing help" onClick={() => setDialog('guide')}><Info size={19}/></button>
    </header>
    <input ref={fileRef} className="visually-hidden" tabIndex={-1} aria-hidden="true" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={e => upload(e.target.files)} aria-label="Choose a photo"/>
    {screen === 'welcome' && <main className="welcome">
      <WelcomePrint format={format}/>
      <div className="welcome-copy"><h1>Off your phone.<br/>Onto paper.</h1><p>Instant-style prints, with a little room for your words.</p>{undoNotice}<button className="primary-button" onClick={() => choosePhotos('add')} disabled={loading}><Plus size={19}/>{loading ? <><LoaderCircle className="busy-spinner" size={18}/>{uploadProgress || 'Opening photos…'}</> : `Choose ${spec.name} photos`}</button><span className="privacy"><LockKeyhole size={12}/>Up to 12 photos. Edited on your device.</span><FormatPicker value={format} onChange={setFormat} visual/></div>
    </main>}
    {screen === 'edit' && photo && <main className="editor-shell">

      <nav className="stepper" aria-label="Photo editing steps">{steps.map((label, i) => <button key={label} aria-current={step === i ? 'step' : undefined} className={step === i ? 'active' : ''} disabled={loading} onClick={() => setStep(i)}><span>{i < step ? <Check size={12}/> : i + 1}</span><span className="step-name">{label}</span></button>)}</nav>
      <div className="editor-workspace">
        <section className="live-preview" aria-label="Live photo preview"><div className={`preview-photo ${step === 0 && !compare ? 'crop-draggable' : ''}`} key={photo.id} onPointerDown={startCropDrag} onPointerMove={moveCropDrag} onPointerUp={endCropDrag} onPointerCancel={endCropDrag} onLostPointerCapture={endCropDrag}>{displayed && <Print photo={displayed} format={format}/>}</div><button className={`compare-button ${compare ? 'active' : ''}`} aria-pressed={compare} onClick={() => setCompare(v => !v)}>{compare ? 'Show edits' : 'Show original'}</button></section>
        <div className="edit-controls" ref={controlRef}>
          {step === 0 && <section className="crop-controls"><div className="control-heading"><h2>Frame your photo</h2><div className="photo-tools"><button className="text-button" disabled={loading} onClick={() => choosePhotos('replace')}>{loading ? 'Opening…' : 'Change photo'}</button><button className="text-button" onClick={() => update({ rotation: (photo.rotation + 90) % 360, panX: 0, panY: 0 })}><RotateCw size={15}/>Rotate</button></div></div><div className="crop-reset"><span>Drag the photo or use the sliders.</span><button className="text-button" disabled={photo.zoom === 1 && photo.panX === 0 && photo.panY === 0 && photo.rotation === 0} onClick={() => update({ zoom: 1, panX: 0, panY: 0, rotation: 0 })}><Undo2 size={13}/>Reset crop</button></div><Range label="Zoom" min={1} max={3} step={.01} unit="×" value={photo.zoom} onChange={zoom => update({ zoom })}/><Range label="Left / right" min={-1} max={1} step={.01} unit="" value={photo.panX} onChange={panX => update({ panX })}/><Range label="Up / down" min={-1} max={1} step={.01} unit="" value={photo.panY} onChange={panY => update({ panY })}/><details className="crop-size"><summary>Print size<span>{spec.name} · {spec.width} × {spec.height} mm</span></summary><FormatPicker value={format} onChange={setFormat}/><p className="look-note">Photo area: {spec.imageWidth} × {spec.imageHeight} mm. Size applies to the whole tray.</p></details></section>}
          {step === 1 && <section>
            <div className="control-heading"><h2>Choose your look</h2><button className="text-button" aria-expanded={advanced} aria-controls="light-texture" onClick={() => setAdvanced(v => !v)}><SlidersHorizontal size={16}/>Light & texture{adjustments ? ` (${adjustments})` : ''}</button></div>
            <div className="film-strip" role="group" aria-label="Everyday looks">{films.slice(0, 3).map(renderFilm)}</div>
            <p className="film-description" aria-live="polite">{films.find(f => f.id === photo.film)?.description}</p>
            <button className="text-button creative-toggle" aria-expanded={creativeOpen} aria-controls="creative-looks" onClick={() => setCreativeOpen(v => !v)}>{creativeOpen ? 'Hide creative looks' : 'Creative looks (5)'}{!creativeOpen && !['original', 'instax', 'instax-rich'].includes(photo.film) ? ` · ${films.find(f => f.id === photo.film)?.name}` : ''}</button>
            {creativeOpen && <div id="creative-looks" className="film-strip creative-grid" role="group" aria-label="Creative looks">{films.slice(3).map(renderFilm)}</div>}
            {photo.film !== 'original' && <Range label="Intensity" value={photo.strength} onChange={strength => update({ strength })}/>}
            {advanced && <div id="light-texture" className="extras"><div className="control-heading"><h2>Light & texture</h2><button className="text-button reset-tuning" disabled={!adjustments} onClick={() => update({ exposure: 0, softening: 0, flash: 0, grain: 0, leak: false })}><Undo2 size={14}/>Reset adjustments</button></div><Range label="Brightness" min={-1} max={1} step={.05} unit=" EV" value={photo.exposure} onChange={exposure => update({ exposure })}/><p className="look-note">EV measures brightness. 0 keeps the original light.</p><Range label="Softening" value={photo.softening} onChange={softening => update({ softening })}/><Range label="Flash-style light" value={photo.flash} onChange={flash => update({ flash })}/>{photo.flash > 0 && <p className="look-note">Center-weighted light; best with a centered subject.</p>}<Range label="Grain" value={photo.grain} onChange={grain => update({ grain })}/><label className="check-row"><span>Light leak</span><input type="checkbox" checked={photo.leak} onChange={e => update({ leak: e.target.checked })}/></label></div>}
          </section>}
          {step === 2 && <section>
            <h2 className="caption-heading">Add a caption <span>optional</span></h2>
            {format === 'strip' ? <p className="look-note">On a strip, the first photo’s caption prints at the bottom.</p> : format === 'peel' ? <p className="look-note">Peel-apart prints carry a short pen note under the photo: caption and note on one line.</p> : <div className="font-options print-styles" role="group" aria-label="Print style">{printStyles.map(st => <button key={st.id} className={(photo.style ?? 'classic') === st.id ? 'active' : ''} aria-pressed={(photo.style ?? 'classic') === st.id} onClick={() => update({ style: st.id })}>{st.name}</button>)}</div>}
            <div className="field-heading"><label htmlFor="caption">{fields.caption}</label><span id="caption-count">{photo.caption.length}/45 characters</span></div>
            <input id="caption" ref={captionRef} className="caption-input" aria-describedby={captionError ? 'caption-count caption-help' : 'caption-count'} placeholder={fields.captionHint} enterKeyHint="done" autoComplete="off" value={photo.caption} maxLength={45} onChange={e => update({ caption: e.target.value })}/>{captionError && <p id="caption-help" className="inline-error" role="alert">Caption is full. Select text to replace it, or shorten it to add a doodle.</p>}
            {fields === styleFields.classic && supportsStyles(format) && <div className="doodle-picker" role="group" aria-label="Hand-drawn caption symbols"><span className="doodle-label">Add a hand-drawn doodle</span><div>{doodles.slice(0, 4).map(renderDoodle)}</div><details className="more-doodles"><summary>More doodles (4)</summary><div>{doodles.slice(4).map(renderDoodle)}</div></details></div>}
            <details className="caption-style"><summary>Caption style<span>{fontOptions.find(f => f.value === photo.font)?.name} · {frames.find(f => f.value === photo.frame)?.name} frame</span></summary><div className="font-options" role="group" aria-label="Caption font">{fontOptions.map(f => <button key={f.value} style={{ fontFamily: f.value }} className={photo.font === f.value ? 'active' : ''} aria-pressed={photo.font === f.value} onClick={() => update({ font: f.value })}>{f.name}</button>)}</div><div className="frame-row"><span>Frame color</span><div>{frames.map(f => <button key={f.value} className={`frame-swatch ${photo.frame === f.value ? 'active' : ''}`} style={{ background: f.value }} aria-label={`${f.name} frame`} aria-pressed={photo.frame === f.value} onClick={() => update({ frame: f.value })}>{photo.frame === f.value && <Check size={16} color={f.value === '#302b38' ? '#fff' : '#302b38'}/>}</button>)}</div></div></details>
            <label className="field-label note-label" htmlFor="note">{fields.note} <span>optional</span></label><input id="note" enterKeyHint="done" autoComplete="off" placeholder={fields.noteHint} value={photo.note} maxLength={50} onChange={e => update({ note: e.target.value })}/>
            <label className="check-row stamp-row"><span>Orange date stamp</span><input type="checkbox" checked={!!photo.stamp} onChange={e => update({ stamp: e.target.checked ? todayStamp() : '' })}/></label>
            {!!photo.stamp && <><label className="field-label" htmlFor="stamp">Stamp date <span>digits, spaces, ’ . : -</span></label><input id="stamp" className="stamp-input" enterKeyHint="done" autoComplete="off" inputMode="numeric" value={photo.stamp} maxLength={10} onChange={e => update({ stamp: e.target.value.replace(/[‘’]/g, "'").replace(STAMP_CHARS, '') || ' ' })}/></>}
          </section>}
        </div>
      </div>
      <div className="wizard-actions">{step > 0 && <button className="back-button" aria-label="Previous step" onClick={() => setStep(s => s - 1)}><ArrowLeft size={20}/></button>}<button className="primary-button" disabled={loading} onClick={() => { if (step < 2) setStep(s => s + 1); else save(); }}>{step === 0 ? 'Next: look' : step === 1 ? 'Next: caption' : queuedPhotos.length ? 'Save & edit next' : 'Save to tray'}{step === 2 ? <Check size={18}/> : <ArrowRight size={18}/>}</button></div>
    </main>}
    {screen === 'tray' && <main className="tray-page">
      <div className="page-heading"><h1 tabIndex={-1}>Your print tray</h1><p>{tray.length} {tray.length === 1 ? 'photo' : 'photos'} ready. Tap to edit.</p></div>
      {undoNotice}
      <div className="tray-grid">{Array.from({ length: Math.min(MAX_PHOTOS, Math.max(2, tray.length + (tray.length % 2))) }, (_, i) => {
        const p = tray[i];
        return <div key={p?.id ?? i} className="tray-item" data-photo-id={p?.id}>
          <div className={`tray-slot ${p ? '' : 'empty'}`} style={{ aspectRatio: `${photoSize(format).width}/${photoSize(format).height}` }}>
            {p ? <button className="tray-photo" aria-label={`Edit photo ${i + 1}`} onClick={() => { returnPhoto.current = p.id; setPhoto({ ...p }); setStep(0); setAdvanced(false); setCreativeOpen(!['original', 'instax', 'instax-rich'].includes(p.film)); navigate('edit'); }}><Print photo={p} format={format} pxPerMm={8}/></button>
            : <button className="empty-slot" disabled={loading || !slotsAvailable} aria-label="Add another photo" onClick={() => choosePhotos('add')}><Plus size={24}/><span>{slotsAvailable ? 'Add photo' : 'Space held for Undo'}</span></button>}
          </div>
          {p && <div className="tray-item-meta"><span>Photo {i + 1}</span><button className="text-button remove-button" aria-label={`Remove photo ${i + 1}`} onClick={() => remove(p)}>Remove</button></div>}
        </div>;
      })}</div>
      <div className="tray-actions">{slotsAvailable > 0 && <button className="outline-button" disabled={loading} onClick={() => choosePhotos('add')}><Plus size={18}/>{loading ? 'Opening photos…' : 'Add photos'}</button>}<button className="primary-button" onClick={() => navigate('print')}>Prepare to print<ArrowRight size={18}/></button></div>
      <p className="quiet-note tray-note">Photos stay in this tab. Download before closing.<br/>Each {spec.name} print is {spec.width} × {spec.height} mm. Prints follow the tray order.</p>
    </main>}
    {screen === 'print' && <main className="print-page">
      <button className="text-button" onClick={() => navigate('tray')}><ArrowLeft size={16}/>Back to tray</button>
      <div className="page-heading"><h1 tabIndex={-1}>{paperError ? 'Check paper size' : `${pages.length} ${pages.length === 1 ? 'sheet' : 'sheets'} ready to print`}</h1><p>{printCount} {spec.name} {printCount === 1 ? 'print' : 'prints'} · {pages.length} {pages.length === 1 ? 'sheet' : 'sheets'}</p></div>
      <div className="print-layout"><div>
        <div className="paper-preview" style={{ aspectRatio: paperError ? '3/4' : `${paper.width}/${paper.height}` }}>{paperError ? <div className="paper-placeholder"><Info size={24}/><p>{paperError}</p></div> : <canvas ref={sheetRef} role="img" aria-label={`Sheet ${currentPage + 1} of ${pages.length}, with ${Math.ceil((pages[currentPage]?.length ?? 0) / perPrint)} ${spec.name} prints`}/>}</div>
        {pages.length > 1 && <div className="sheet-pager"><button className="icon-button" aria-label="Previous print sheet" disabled={currentPage === 0} onClick={() => setPageIndex(currentPage - 1)}><ArrowLeft size={18}/></button><span>Sheet {currentPage + 1} of {pages.length}</span><button className="icon-button" aria-label="Next print sheet" disabled={currentPage === pages.length - 1} onClick={() => setPageIndex(currentPage + 1)}><ArrowRight size={18}/></button></div>}
        {!paperError && <><p className="sheet-caption">{Math.ceil((pages[currentPage]?.length ?? 0) / perPrint)} of {printCount} {printCount === 1 ? 'print' : 'prints'} on this sheet</p>{perPrint > 1 && tray.length % perPrint > 0 && <p className="quiet-note">Each strip holds {perPrint} photos. Add {perPrint - tray.length % perPrint} more to fill the last strip.</p>}<p className="quiet-note cut-summary">{currentLayout?.lines.length ?? 0} cut lines on this sheet.<br/>Follow the small numbers on the sheet: cut 1 first, then 2, and so on.</p></>}
      </div><section className="print-settings">
        <FormatPicker value={format} onChange={f => { setFormat(f); setPageIndex(0); }}/>
        <label className="field-label" htmlFor="layout-mode">Arrange for</label><select id="layout-mode" value={layoutMode} onChange={e => { setLayoutMode(e.target.value as LayoutMode); setPageIndex(0); }}><option value="easy">Fewer cuts · up to {capacityFor(paper, format, 'easy')} per sheet</option><option value="dense">Fit more · up to {capacityFor(paper, format, 'dense')} per sheet</option></select>
        <label className="field-label spaced-label" htmlFor="paper">Paper size</label><select id="paper" value={paperChoices.some(p => p.width === paper.width && p.height === paper.height) ? paperKey : 'custom'} onChange={e => { const selected = paperChoices.find(p => `${p.width}x${p.height}` === e.target.value); if (selected) { setPaper(selected); setPageIndex(0); } }}>{paperChoices.map(p => <option key={`${p.width}x${p.height}`} value={`${p.width}x${p.height}`}>{p.width / 10} × {p.height / 10} cm · up to {capacityFor(p, format, layoutMode)} prints</option>)}<option value="custom" disabled>Custom measurements</option></select>
        <label className="check-row"><span>Dashed cutting guides</span><input type="checkbox" checked={guides} onChange={e => setGuides(e.target.checked)}/></label>
        <details><summary>Printing cost<span>{totalCost !== null ? `€${totalCost.toFixed(2)} total` : 'Optional'}</span></summary><label className="field-label" htmlFor="sheet-price">Price per {paper.width / 10} × {paper.height / 10} cm sheet (€)</label><input id="sheet-price" type="text" inputMode="decimal" aria-invalid={!!priceError} aria-describedby={priceError ? 'price-error' : undefined} placeholder="For example, 0,49" value={price} onChange={e => setPrices(old => ({ ...old, [paperKey]: e.target.value }))}/>{priceError && <p id="price-error" className="inline-error" role="alert">{priceError}</p>}<p>Each paper size keeps its own price. Counts include partially filled sheets.</p></details>
        {totalCost !== null && pages.length > 0 && tray.length > 0 && <p className="cost-summary">€{totalCost.toFixed(2)} total · €{(totalCost / printCount).toFixed(2)} per print</p>}
        <details><summary>Paper measurements<span>{paper.width} × {paper.height} mm</span></summary><p>Use the printer’s actual paper size.</p><div className="paper-measurements"><label>Width (mm)<input type="number" inputMode="decimal" step="any" min="5" max="400" value={paper.width || ''} onChange={e => setPaper(p => ({ ...p, width: +e.target.value }))}/></label><label>Height (mm)<input type="number" inputMode="decimal" step="any" min="5" max="500" value={paper.height || ''} onChange={e => setPaper(p => ({ ...p, height: +e.target.value }))}/></label></div></details>
        {paperError && <p className="inline-error" role="alert">{paperError}</p>}
        <button className="primary-button" disabled={!!paperError || !pages.length} onClick={() => { setExportStatus(''); setDialog('export'); }}><ArrowDownToLine size={18}/>Download {pages.length > 1 ? 'print sheets' : 'print sheet'}</button>
        <p className="print-tip"><strong>Glossy paper · automatic enhancement off</strong><span>Use matching paper. Turn off cropping and extra borders.</span></p><p className="quiet-note">600 DPI · {spec.width} × {spec.height} mm prints<br/>Print at 100% / Actual size.</p>
      </section></div>
    </main>}
    {loading && <div className="loading-status" role="status"><LoaderCircle className="busy-spinner" size={18}/>{uploadProgress || 'Opening photo…'}<button onClick={discard}>Cancel</button></div>}
    {notice && <div className="feedback-toast" role="status"><Check size={16}/><span>{notice}</span></div>}
    {error && <div className="error-banner" role="alert"><span>{error}</span><button className="icon-button" aria-label="Dismiss error" onClick={() => setError('')}><X size={18}/></button></div>}
    {dialog === 'cancel' && <Modal title={queuedPhotos.length ? 'Leave these photos?' : 'Leave this photo?'} onClose={() => setDialog(null)}><p>{queuedPhotos.length ? `This photo and ${queuedPhotos.length} waiting ${queuedPhotos.length === 1 ? 'photo' : 'photos'} will be discarded. Already saved photos stay in your tray.` : `Photo and caption changes won’t be saved. Your tray keeps its ${spec.name} print size.`}</p><button className="primary-button" onClick={() => setDialog(null)}>Keep editing</button><button className="text-button discard-button" onClick={discard}>Discard changes</button></Modal>}
    {dialog === 'export' && <Modal title="Download print sheets" busy={exporting} onClose={() => { if (!exporting) setDialog(null); }}><p>{printCount} {spec.name} {printCount === 1 ? 'print' : 'prints'} across {pages.length} {pages.length === 1 ? 'sheet' : 'sheets'} of {paper.width} × {paper.height} mm paper.</p>{error && <p className="inline-error" role="alert">{error}</p>}<button className="export-option export-primary" disabled={exporting} onClick={() => exportFile('jpg')}><span><strong>{exporting ? 'Preparing…' : pages.length > 1 ? `Download sheet ${currentPage + 1} JPG` : 'Download JPG'}</strong><small>For photo kiosks, including dm · 600 DPI{pages.length > 1 ? ' · current sheet only' : ''}</small></span><ArrowDownToLine size={20}/></button><button className="export-option" disabled={exporting} onClick={() => exportFile('pdf')}><span><strong>{pages.length > 1 ? 'Download all sheets PDF' : 'Download PDF'}</strong><small>Lossless · print at 100% / Actual size</small></span><ArrowDownToLine size={20}/></button><p className="export-status" role="status">{exporting && <LoaderCircle size={16} className="busy-spinner"/>}{exportStatus}</p><p className="quiet-note">Choose glossy paper in the matching size. Turn off cropping and automatic enhancement where available.</p>{!exporting && exportStatus.endsWith('Check your downloads.') && <button className="text-button discard-button" onClick={startOver}>Done · start new prints</button>}</Modal>}
    {dialog === 'home' && <Modal title="Start over?" onClose={() => setDialog(null)}><p>{tray.length} {tray.length === 1 ? 'photo' : 'photos'} in your tray will be cleared. Download your print sheets first if you still need them.</p><button className="primary-button" onClick={() => setDialog(null)}>Keep my photos</button><button className="text-button discard-button" onClick={startOver}>Clear tray and start over</button></Modal>}
    {dialog === 'guide' && <Modal title="Printing help" onClose={() => setDialog(null)}><p>You’re making <strong>{spec.name} prints: {spec.width} × {spec.height} mm</strong>, with a {spec.imageWidth} × {spec.imageHeight} mm photo inside. One print size applies to the whole tray.</p><div className="size-comparison">{formatChoices.map(f => <span key={f}><strong>{formats[f].name}</strong>{formats[f].width} × {formats[f].height} mm</span>)}</div><p><strong>Fewer cuts</strong> uses a tight grid with shared borders. <strong>Fit more</strong> can rotate prints and split them into groups to use more of the paper. The photo size stays exact.</p><p>Each guide runs to the edge of the paper and has a small number. Cut in number order: the long cuts come first and turn the sheet into strips, the rest separate the prints. A paper trimmer is fastest; a craft knife against a metal ruler also works. Scissors are hardest to keep straight.</p><p>At dm, download the JPG for each sheet and choose matching glossy paper. Turn off cropping, extra borders and automatic enhancement where available. For home printing, the PDF includes all sheets: choose <strong>100% / Actual size</strong>, with “Fit to page” off.</p><p>These are instant-style prints on photo paper. The looks are interpretations, not calibrated film matches. Photos and optional prices stay in this tab; download before closing or reloading.</p></Modal>}

  </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
