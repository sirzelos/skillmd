#!/usr/bin/env node
// Build a Thai official-style .docx (ระเบียบงานสารบรรณ typography) from the lease markup.
// Markup reference: ../references/thai-official-format.md
//
// usage: node build_docx.js <input.md> <output.docx>
//          [--data data.json]          fill {{key}} {{baht:key}} {{num:key}} {{date:key}}
//          [--with a,b]                keep ::if a / ::if b blocks (also data._with)
//          [--font "TH SarabunIT๙"]    default "TH Sarabun New"
//          [--arabic]                  keep Arabic digits (default: convert to Thai digits)
//          [--margins 3,2,2.5,2.5]     left,right,top,bottom in cm
//          [--initials "ผู้ให้เช่า,ผู้เช่า" | --no-initials]   (or data._initials)
//          [--no-gov-header]           drop the official "- ๒ -" page number (top centre, from page 2)
//          [--layout official|hanging] official = กรมบัญชีกลาง standard form (default); hanging = hanging-indent items

const fs = require('fs');
const path = require('path');
const {
  AlignmentType, BorderStyle, Document, Footer, Header, HeightRule, Packer, PageBreak,
  PageNumber, Paragraph, ShadingType, SimpleField, Table, TableCell, TableRow, TabStopType,
  Tab, TextRun, VerticalAlign, WidthType,
} = require('docx');
const { bahtText, formatNumber, thaiDate } = require('./bahttext');

const CM = 567; // twips per centimetre
const BLANK = '……………………………';

// Dotted blank sized for handwriting the missing value (1 "…" ≈ 0.12 cm at 16 pt).
// A zero-width space every 10 dots lets long blanks wrap instead of stretching the line.
function dots(n) {
  return Array.from({ length: Math.ceil(n / 10) }, (_, i) => '…'.repeat(Math.min(10, n - i * 10))).join('​');
}

function blankFor(fn, key) {
  const override = (opts.data._blank_len || {})[key];
  if (override) return dots(override);
  if (fn === 'datelong') return `วันที่ ${dots(8)} เดือน${dots(18)} พ.ศ. ${dots(8)}`;
  if (fn === 'date') return `${dots(6)} ${dots(16)} ${dots(8)}`;
  if (fn === 'baht') return dots(40);
  const k = key.toLowerCase();
  if (/lease_ref$/.test(k)) return ` เลขที่ ${dots(15)} ลงวันที่ ${dots(25)}`;
  if (/address$/.test(k)) return dots(110);
  if (/occupants$/.test(k) && !/max_/.test(k)) return dots(90);
  if (/(^|\.)name$|^witness\d$/.test(k)) return dots(50);
  if (/id_no$/.test(k)) return dots(38);
  if (/(^|\.)age$|^max_occupants$|_days$|_months$|_cars$|_cameras$/.test(k)) return dots(8);
  if (/phone$/.test(k)) return dots(24);
  if (/(^|\.)line$/.test(k)) return dots(26);
  if (/email$/.test(k)) return dots(36);
  if (/(fee|rent|deposit|limit|cap|forfeit|stamp_duty|comp)$/.test(k)) return dots(14);
  if (/term_text$|contract_no$/.test(k)) return dots(20);
  if (/branch$|owner$|deed_|land_no|survey_page|area$/.test(k)) return dots(30);
  return BLANK;
}

function parseArgs(argv) {
  const opts = { positional: [], with: new Set(), font: 'TH Sarabun New', thaiDigits: true,
    margins: [3, 2, 2.5, 2.5], initials: ['ผู้ให้เช่า', 'ผู้เช่า'], govHeader: true, layout: 'official', data: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--data') opts.data = JSON.parse(fs.readFileSync(argv[++i], 'utf8'));
    else if (a === '--with') argv[++i].split(',').filter(Boolean).forEach((k) => opts.with.add(k.trim()));
    else if (a === '--font') opts.font = argv[++i];
    else if (a === '--arabic') opts.thaiDigits = false;
    else if (a === '--margins') opts.margins = argv[++i].split(',').map(Number);
    else if (a === '--initials') opts.initials = argv[++i].split(',').map((s) => s.trim());
    else if (a === '--no-initials') opts.initials = [];
    else if (a === '--gov-header') opts.govHeader = true;
    else if (a === '--no-gov-header') opts.govHeader = false;
    else if (a === '--layout') opts.layout = argv[++i];
    else opts.positional.push(a);
  }
  if (opts.positional.length !== 2) {
    console.error('usage: node build_docx.js <input.md> <output.docx> [options]');
    process.exit(1);
  }
  (opts.data._with || []).forEach((k) => opts.with.add(k));
  if (Array.isArray(opts.data._initials)) opts.initials = opts.data._initials;
  if (opts.data._layout) opts.layout = opts.data._layout;
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
const [inputPath, outputPath] = opts.positional;
const FONT = opts.font;
const [mLeft, mRight, mTop, mBottom] = opts.margins;
const CONTENT_WIDTH = Math.round((21 - mLeft - mRight) * CM);
const warnings = [];
const fillable = new Set();
const KEEP_OPEN = '';
const KEEP_CLOSE = '';

// ---------- text preprocessing ----------

function applyConditionals(lines) {
  const stack = [];
  const out = [];
  for (const line of lines) {
    const m = /^::if\s+(!?)([\w-]+)\s*$/.exec(line.trim());
    if (m) { stack.push(m[1] ? !opts.with.has(m[2]) : opts.with.has(m[2])); continue; }
    if (line.trim() === '::endif') { stack.pop(); continue; }
    if (stack.every(Boolean)) out.push(line);
  }
  if (stack.length) warnings.push(`unclosed ::if block (${stack.length})`);
  return out;
}

function lookup(key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), opts.data);
}

function fillPlaceholders(text) {
  return text.replace(/\{\{\s*(?:(baht|num|date|datelong):)?([\w.]+)\s*\}\}/g, (all, fn, key) => {
    // data._fillable: keys that change per tenant (rent, dates…) are always left as hand-fill blanks.
    if ((opts.data._fillable || []).includes(key)) {
      fillable.add(`${fn ? fn + ':' : ''}${key}`);
      return blankFor(fn, key);
    }
    const v = lookup(key);
    if (v === null) return ''; // explicit "nothing"
    if (v === undefined || v === '') {
      warnings.push(`missing: ${fn ? fn + ':' : ''}${key}`);
      return blankFor(fn, key);
    }
    if (Array.isArray(v)) return v.join('\n'); // e.g. table rows
    if (fn === 'baht') return bahtText(v);
    if (fn === 'num') return formatNumber(v);
    if (fn === 'date') return thaiDate(v, { long: false });
    if (fn === 'datelong') return thaiDate(v);
    if (typeof v === 'number') return formatNumber(v);
    // Personal names must not wrap mid-name ("นาง|สาว…"); thaiBreaks skips text between these markers.
    if (/(^|\.)(name|account_name|owner_name)$|^witness\d$/.test(key)) return `${KEEP_OPEN}${v}${KEEP_CLOSE}`;
    return String(v);
  });
}

// Auto-number "### ข้อ #{label}", "- #.#{label}", "-- (#)" and "## …หมายเลข #{label}"; resolve {ref:label}.
function autoNumber(lines) {
  const labels = {};
  let clause = 0, sub = 0, subsub = 0, annex = 0;
  const out = lines.map((line) => {
    let m;
    if ((m = /^(###\s+ข้อ\s+)#(?:\{([\w-]+)\})?/.exec(line))) {
      clause++; sub = 0;
      if (m[2]) labels[m[2]] = String(clause);
      return line.replace(m[0], m[1] + clause);
    }
    if ((m = /^(##\s+.*?)#(?:\{([\w-]+)\})?/.exec(line))) {
      annex++;
      if (m[2]) labels[m[2]] = String(annex);
      return line.replace(m[0], m[1] + annex);
    }
    if ((m = /^(-\s+)#\.#(?:\{([\w-]+)\})?/.exec(line))) {
      sub++; subsub = 0;
      if (m[2]) labels[m[2]] = `${clause}.${sub}`;
      return line.replace(m[0], `${m[1]}${clause}.${sub}`);
    }
    if ((m = /^(--\s+)\(#\)/.exec(line))) {
      subsub++;
      return line.replace(m[0], `${m[1]}(${subsub})`);
    }
    return line;
  });
  return out.map((line) => line.replace(/\{ref:([\w-]+)\}/g, (all, label) => {
    if (!(label in labels)) { warnings.push(`unknown ref: ${label}`); return '…'; }
    return labels[label];
  }));
}

const THAI_DIGITS = '๐๑๒๓๔๕๖๗๘๙';
const THAI_CHAR = /[฀-๿]/;
const segmenter = new Intl.Segmenter('th', { granularity: 'word' });

// Word only breaks Thai lines at its own dictionary breaks, which is unreliable across installs.
// Insert zero-width spaces between Thai words so lines wrap cleanly and thaiDistribute doesn't stretch letters.
function thaiBreaks(s) {
  // Odd-indexed chunks sit between KEEP markers (names) and are left unbroken.
  return s.split(new RegExp(`[${KEEP_OPEN}${KEEP_CLOSE}]`)).map((chunk, ci) => {
    if (ci % 2 === 1) return chunk.replace(/ /g, ' ');
    const segs = [...segmenter.segment(chunk)].map((x) => x.segment);
    let out = '';
    segs.forEach((seg, i) => {
      if (i > 0 && THAI_CHAR.test(seg) && THAI_CHAR.test(segs[i - 1])) out += '​';
      out += seg;
    });
    return joinKeepWords(out);
  }).join('');
}

// Compound terms the word segmenter splits but that must never wrap mid-term.
const KEEP_WORDS = ['บ้านเลขที่', 'ผู้ให้เช่า', 'ผู้เช่า', 'ผู้ค้ำประกัน', 'ทรัพย์สินที่เช่า', 'เงินประกัน',
  'ค่าเช่า', 'อากรแสตมป์', 'ทะเบียนบ้าน', 'กรุงเทพมหานคร', 'ซอยพหลโยธิน', 'นางสาว'];
const KEEP_WORD_RES = KEEP_WORDS.map((w) => [new RegExp([...w].join('​?'), 'g'), w]);
function joinKeepWords(s) {
  return KEEP_WORD_RES.reduce((acc, [re, w]) => acc.replace(re, w), s);
}

function stripKeep(s) {
  return s.replace(new RegExp(`[${KEEP_OPEN}${KEEP_CLOSE}]`, 'g'), '');
}

function toThaiDigits(s) {
  const text = opts.thaiDigits ? s.replace(/[0-9]/g, (d) => THAI_DIGITS[Number(d)]) : s;
  return thaiBreaks(text);
}

// ---------- runs & paragraphs ----------

function runProps(extra = {}) {
  const size = extra.size || 32;
  return { font: FONT, size, sizeComplexScript: size, bold: extra.bold, boldComplexScript: extra.bold,
    underline: extra.underline ? {} : undefined, language: { value: 'th-TH', bidirectional: 'th-TH' } };
}

function runs(text, extra = {}) {
  if (text.includes('[[NUMPAGES]]')) {
    const field = () => pageField('NUMPAGES', new TextRun({ children: [PageNumber.TOTAL_PAGES], ...runProps(extra) }));
    return text.split('[[NUMPAGES]]').flatMap((seg, i) => (i ? [field(), ...runs(seg, extra)] : runs(seg, extra)));
  }
  const parts = text.split(/(\*\*.+?\*\*|__.+?__|`.+?`)/).filter((p) => p !== '');
  return parts.map((p) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      const inner = p.slice(2, -2);
      // Short bold terms ("ผู้เช่า", names) must not wrap mid-word; long bold clauses still get Thai breaks.
      const text = inner.length <= 30 && !inner.includes('……')
        ? (opts.thaiDigits ? inner.replace(/[0-9]/g, (d) => THAI_DIGITS[Number(d)]) : inner)
        : toThaiDigits(inner);
      return new TextRun({ text: stripKeep(text), ...runProps({ ...extra, bold: true }) });
    }
    if (p.startsWith('__') && p.endsWith('__')) {
      return new TextRun({ text: toThaiDigits(p.slice(2, -2)), ...runProps({ ...extra, underline: true }) });
    }
    if (p.startsWith('`') && p.endsWith('`')) {
      // IDs / account numbers: keep Arabic digits and never wrap mid-number (non-breaking hyphen + space)
      const keep = p.slice(1, -1).replace(/-/g, '‑').replace(/ /g, ' ');
      return new TextRun({ text: stripKeep(keep), ...runProps(extra) });
    }
    return new TextRun({ text: toThaiDigits(p), ...runProps(extra) });
  });
}

function para(text, { align = AlignmentType.THAI_DISTRIBUTE, firstLine = 2.5, before = 0, after = 0,
  keepNext = false, run = {} } = {}) {
  // thaiDistribute spreads letters on lines dominated by fill-in dots ("ก ั บ ……"); left-align those paragraphs.
  const alignment = align === AlignmentType.THAI_DISTRIBUTE && text.includes('……') ? AlignmentType.LEFT : align;
  return new Paragraph({
    alignment,
    indent: firstLine ? { firstLine: Math.round(firstLine * CM) } : undefined,
    spacing: { before, after, line: 240 },
    keepNext,
    children: runs(text, run),
  });
}

// Numbered sub-item with a hanging indent: the number sits at `numberAt` cm and every line of
// the text (first and wrapped) starts at numberAt + HANG, so items read as a clean column.
// Un-numbered lines at this level are block-indented to the same text column.
const HANG = 1.25;
const IND_LEAD = 2.0;  // opening/closing paragraphs and "ข้อ ๑ …" headings
const IND_BODY = 3.25; // clause text and numbered sub-items (first line; wrapped lines return to the margin)
function itemPara(text, numberAt) {
  const m = /^((?:\d+\.)+\d+|\(\d+\))\s+(.*)$/.exec(text);
  const textAt = numberAt + HANG;
  const alignment = text.includes('……') ? AlignmentType.LEFT : AlignmentType.THAI_DISTRIBUTE;
  if (!m) {
    return new Paragraph({ alignment, indent: { left: Math.round(textAt * CM) }, spacing: { line: 240 }, children: runs(text) });
  }
  return new Paragraph({
    alignment,
    indent: { left: Math.round(textAt * CM), hanging: Math.round(HANG * CM) },
    tabStops: [{ type: TabStopType.LEFT, position: Math.round(textAt * CM) }],
    spacing: { line: 240 },
    children: [...runs(m[1]), new TextRun({ children: [new Tab()], ...runProps() }), ...runs(m[2])],
  });
}

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NO_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER,
  insideHorizontal: NO_BORDER, insideVertical: NO_BORDER };
const THIN = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const THIN_BORDERS = { top: THIN, bottom: THIN, left: THIN, right: THIN };

function stampBox(amount) {
  const w = Math.round(3.5 * CM);
  return new Table({
    alignment: AlignmentType.RIGHT,
    width: { size: w, type: WidthType.DXA },
    columnWidths: [w],
    rows: [new TableRow({
      height: { value: Math.round(3 * CM), rule: HeightRule.EXACT },
      children: [new TableCell({
        width: { size: w, type: WidthType.DXA },
        borders: { top: { ...THIN, style: BorderStyle.DASHED }, bottom: { ...THIN, style: BorderStyle.DASHED },
          left: { ...THIN, style: BorderStyle.DASHED }, right: { ...THIN, style: BorderStyle.DASHED } },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          para('ติดอากรแสตมป์', { align: AlignmentType.CENTER, firstLine: 0, run: { size: 28 } }),
          para(amount ? `${amount} บาท` : '…………… บาท', { align: AlignmentType.CENTER, firstLine: 0, run: { size: 28 } }),
        ],
      })],
    })],
  });
}

function signatureTable(spec) {
  const cells = spec.split('|').map((c) => {
    const [role, ...rest] = c.split('=');
    return { role: role.trim(), name: rest.join('=').trim() };
  });
  if (cells.length === 1) cells.unshift(null); // single signer starts from the centre of the page
  const colW = Math.floor(CONTENT_WIDTH / 2);
  const cellOf = (c) => new TableCell({
    width: { size: colW, type: WidthType.DXA },
    borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
    children: c ? [
      para('', { firstLine: 0, keepNext: true }),
      para(`(ลงชื่อ)…………………………………${c.role}`, { align: AlignmentType.LEFT, firstLine: 0, keepNext: true }),
      // A missing name arrives as a long hand-fill blank; in the signature block use the form's one-line bracket instead.
      para(`( ${c.name && !/^[…​\s]+$/.test(c.name) ? c.name : '……………………………………'} )`,
        { align: AlignmentType.LEFT, firstLine: 0, keepNext: true }),
    ] : [para('', { firstLine: 0, keepNext: true })],
  });
  return new Table({
    width: { size: colW * 2, type: WidthType.DXA },
    columnWidths: [colW, colW],
    borders: NO_BORDERS,
    rows: [new TableRow({ cantSplit: true, children: cells.map(cellOf) })],
  });
}

function dataTable(rows) {
  // Separator row may carry column weights: |-5-|-55-|-40-|
  const isSep = (c) => /^:?-+\d*-*:?$/.test(c);
  const parsed = rows.map((r) => r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()));
  const sep = parsed.find((r) => r.every(isSep));
  const cells = parsed.filter((r) => !r.every(isSep));
  const ncol = Math.max(...cells.map((r) => r.length));
  const explicit = sep && sep.map((c) => Number((c.match(/\d+/) || [])[0]));
  const weights = [];
  for (let c = 0; c < ncol; c++) {
    const header = cells[0][c] || '';
    if (explicit && explicit[c]) { weights.push(explicit[c]); continue; }
    if (/^(ลำดับ|ที่|ข้อ|no\.?)$/i.test(header)) { weights.push(3); continue; }
    const len = Math.max(...cells.map((r) => (r[c] || '').replace(/<br>/g, ' ').length));
    weights.push(Math.min(40, Math.max(5, len)));
  }
  const total = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map((w) => Math.floor((w / total) * CONTENT_WIDTH));
  widths[widths.length - 1] += CONTENT_WIDTH - widths.reduce((a, b) => a + b, 0);
  const isNumeric = (s) => /^[\d.,\s๐-๙-]*$/.test(s);
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: widths,
    rows: cells.map((r, ri) => new TableRow({
      tableHeader: ri === 0,
      cantSplit: true,
      children: widths.map((w, ci) => {
        const text = r[ci] || '';
        return new TableCell({
          width: { size: w, type: WidthType.DXA },
          borders: THIN_BORDERS,
          margins: { top: 30, bottom: 30, left: 80, right: 80 },
          shading: ri === 0 ? { type: ShadingType.CLEAR, color: 'auto', fill: 'D9D9D9' } : undefined,
          verticalAlign: VerticalAlign.CENTER,
          children: text.split('<br>').map((t) => para(t, {
            align: ri === 0 || isNumeric(t) ? AlignmentType.CENTER : AlignmentType.LEFT,
            firstLine: 0, run: { bold: ri === 0, size: 30 },
          })),
        });
      }),
    })),
  });
}

function pageField(instr, fallback) {
  if (!opts.thaiDigits) return fallback;
  return new SimpleField(`${instr} \\* ThaiArabic`, '๑');
}

function buildFooter() {
  const children = [];
  if (opts.initials.length) {
    const dots = opts.initials.length > 2 ? '…………………' : '……………………'; // keep 3 signers on one footer line
    const gap = opts.initials.length > 2 ? '  ' : '     ';
    children.push(new TextRun({ text: opts.initials.map((r) => `ลงชื่อ${dots}${r}`).join(gap), ...runProps({ size: 28 }) }));
  }
  if (!opts.govHeader) {
    children.push(new TextRun({ text: '\tหน้า ', ...runProps({ size: 28 }) }));
    children.push(pageField('PAGE', new TextRun({ children: [PageNumber.CURRENT], ...runProps({ size: 28 }) })));
    children.push(new TextRun({ text: '/', ...runProps({ size: 28 }) }));
    children.push(pageField('NUMPAGES', new TextRun({ children: [PageNumber.TOTAL_PAGES], ...runProps({ size: 28 }) })));
  }
  return new Footer({ children: [new Paragraph({
    style: 'SmallTH',
    tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
    children,
  })] });
}

function buildHeader() {
  return new Header({ children: [new Paragraph({
    style: 'NormalTH',
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: '- ', ...runProps() }),
      pageField('PAGE', new TextRun({ children: [PageNumber.CURRENT], ...runProps() })),
      new TextRun({ text: ' -', ...runProps() })],
  })] });
}

// ---------- main ----------

let source = fs.readFileSync(inputPath, 'utf8').replace(/^﻿/, '').replace(/<!--[\s\S]*?-->/g, '');
let lines = applyConditionals(source.split(/\r?\n/));
lines = autoNumber(lines.map(fillPlaceholders).join('\n').split('\n')).map((l) => l.replace(/``/g, ''));

const body = [];
let inClause = false; // plain paragraphs inside a "ข้อ" use IND_BODY, elsewhere IND_LEAD
for (let i = 0; i < lines.length; i++) {
  const raw = lines[i];
  const line = raw.trim();
  if (!line) continue;
  if (line.startsWith('|')) {
    const rows = [];
    while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(lines[i++]);
    i--;
    body.push(dataTable(rows));
    continue;
  }
  let m;
  if ((m = /^::stamp\s*(.*)$/.exec(line))) body.push(stampBox(toThaiDigits(m[1].trim())));
  else if ((m = /^::right\s+(.*)$/.exec(line))) body.push(para(m[1], { align: AlignmentType.RIGHT, firstLine: 0 }));
  else if ((m = /^::center\s+(.*)$/.exec(line))) body.push(para(m[1], { align: AlignmentType.CENTER, firstLine: 0 }));
  else if ((m = /^::noindent\s+(.*)$/.exec(line))) body.push(para(m[1], { firstLine: 0 }));
  else if ((m = /^::lead\s+(.*)$/.exec(line))) {
    const next = lines.slice(i + 1).find((l) => l.trim());
    body.push(para(m[1], { firstLine: IND_LEAD, keepNext: Boolean(next && next.trim().startsWith('::sign')) }));
  }
  else if ((m = /^::sign\s+(.*)$/.exec(line))) { inClause = false; body.push(signatureTable(m[1])); }
  else if (line === '::blank') body.push(para('', { firstLine: 0 }));
  else if (line === '::pagebreak') { inClause = false; body.push(new Paragraph({ children: [new PageBreak()] })); }
  else if ((m = /^#\s+(.*)$/.exec(line))) {
    body.push(para(m[1], { align: AlignmentType.CENTER, firstLine: 0, before: 120, after: 120, run: { bold: true, size: 32 } }));
  } else if ((m = /^##\s+(.*)$/.exec(line))) {
    inClause = false;
    body.push(para(m[1], { align: AlignmentType.CENTER, firstLine: 0, before: 120, after: 60, keepNext: true, run: { bold: true, size: 32 } }));
  } else if ((m = /^###\s+(.*)$/.exec(line))) {
    inClause = true;
    body.push(para(m[1], { align: AlignmentType.LEFT, firstLine: IND_LEAD, before: 120, keepNext: true, run: { bold: true } }));
  } else if ((m = /^--\s+(.*)$/.exec(line))) {
    body.push(opts.layout === 'hanging' ? itemPara(m[1], IND_LEAD + HANG) : para(m[1], { firstLine: IND_BODY }));
  } else if ((m = /^-\s+(.*)$/.exec(line))) {
    body.push(opts.layout === 'hanging' ? itemPara(m[1], IND_LEAD) : para(m[1], { firstLine: IND_BODY }));
  }
  else {
    // Keep the closing paragraph on the same page as the signature blocks that follow it.
    const next = lines.slice(i + 1).find((l) => l.trim());
    body.push(para(line, { firstLine: inClause ? IND_BODY : IND_LEAD, keepNext: Boolean(next && next.trim().startsWith('::sign')) }));
  }
}

const footer = buildFooter();
const doc = new Document({
  creator: 'thai-lease-contract skill',
  title: path.basename(outputPath, '.docx'),
  styles: {
    default: { document: { run: { font: FONT, size: 32, sizeComplexScript: 32 } } },
    paragraphStyles: [
      { id: 'NormalTH', name: 'Normal TH', basedOn: 'Normal', run: { font: FONT, size: 32, sizeComplexScript: 32 } },
      { id: 'SmallTH', name: 'Small TH', basedOn: 'Normal', run: { font: FONT, size: 28, sizeComplexScript: 28 } },
    ],
  },
  sections: [{
    properties: {
      titlePage: opts.govHeader,
      page: {
        size: { width: 11906, height: 16838 },
        margin: { left: Math.round(mLeft * CM), right: Math.round(mRight * CM), top: Math.round(mTop * CM),
          bottom: Math.round(mBottom * CM), header: Math.round(1.25 * CM), footer: Math.round(1 * CM) },
      },
    },
    headers: opts.govHeader ? { default: buildHeader(), first: new Header({ children: [new Paragraph('')] }) } : undefined,
    footers: opts.govHeader ? { default: footer, first: buildFooter() } : { default: footer },
    children: body,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outputPath, buf);
  console.log(`wrote ${outputPath}`);
  const unique = [...new Set(warnings)];
  if (unique.length) {
    console.log(`\n${unique.length} warning(s) — fill these before signing:`);
    unique.forEach((w) => console.log(`  - ${w}`));
  }
  if (fillable.size) console.log(`\n${fillable.size} intentional hand-fill blank(s) (_fillable): ${[...fillable].join(', ')}`);
});
