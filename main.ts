// A self-contained, deterministic PNG illustration. No files or network are read.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const W = 1024, H = 576;
const pixels = Buffer.alloc(W * H * 3);
const C = {
  ink: [10, 18, 35], paper: [241, 233, 210], sky: [31, 71, 118], sea: [23, 122, 151],
  red: [213, 64, 55], gold: [242, 187, 64], green: [68, 184, 123], white: [255, 250, 238],
  slate: [77, 100, 125], pink: [241, 133, 113], teal: [81, 202, 193]
};
function px(x, y, c) { if (x >= 0 && x < W && y >= 0 && y < H) { const i = (y * W + x) * 3; pixels[i] = c[0]; pixels[i + 1] = c[1]; pixels[i + 2] = c[2]; } }
function rect(x, y, w, h, c) { for (let yy = Math.max(0, y); yy < Math.min(H, y + h); yy++) for (let xx = Math.max(0, x); xx < Math.min(W, x + w); xx++) px(xx, yy, c); }
function line(x0, y0, x1, y1, c, t = 1) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) for (let a = -t; a <= t; a++) for (let b = -t; b <= t; b++) px(Math.round(x0 + (x1 - x0) * i / n) + a, Math.round(y0 + (y1 - y0) * i / n) + b, c); }
function circle(cx, cy, r, c) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) px(cx + x, cy + y, c); }
function ring(cx, cy, r, c, t = 2) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const d = x * x + y * y; if (d <= r * r && d >= (r - t) * (r - t)) px(cx + x, cy + y, c); } }

const glyph = {
  'A':['01110','10001','10001','11111','10001','10001','10001'], 'B':['11110','10001','10001','11110','10001','10001','11110'],
  'C':['01111','10000','10000','10000','10000','10000','01111'], 'D':['11110','10001','10001','10001','10001','10001','11110'],
  'E':['11111','10000','10000','11110','10000','10000','11111'], 'F':['11111','10000','10000','11110','10000','10000','10000'],
  'G':['01111','10000','10000','10111','10001','10001','01110'], 'H':['10001','10001','10001','11111','10001','10001','10001'],
  'I':['11111','00100','00100','00100','00100','00100','11111'], 'J':['00111','00010','00010','00010','10010','10010','01100'],
  'K':['10001','10010','10100','11000','10100','10010','10001'], 'L':['10000','10000','10000','10000','10000','10000','11111'],
  'M':['10001','11011','10101','10101','10001','10001','10001'], 'N':['10001','11001','10101','10011','10001','10001','10001'],
  'O':['01110','10001','10001','10001','10001','10001','01110'], 'P':['11110','10001','10001','11110','10000','10000','10000'],
  'Q':['01110','10001','10001','10001','10101','10010','01101'], 'R':['11110','10001','10001','11110','10100','10010','10001'],
  'S':['01111','10000','10000','01110','00001','00001','11110'], 'T':['11111','00100','00100','00100','00100','00100','00100'],
  'U':['10001','10001','10001','10001','10001','10001','01110'], 'V':['10001','10001','10001','10001','10001','01010','00100'],
  'W':['10001','10001','10001','10101','10101','10101','01010'], 'X':['10001','10001','01010','00100','01010','10001','10001'],
  'Y':['10001','10001','01010','00100','00100','00100','00100'], 'Z':['11111','00001','00010','00100','01000','10000','11111'],
  '0':['01110','10001','10011','10101','11001','10001','01110'], '1':['00100','01100','00100','00100','00100','00100','01110'],
  '2':['01110','10001','00001','00010','00100','01000','11111'], '3':['11110','00001','00001','01110','00001','00001','11110'],
  '4':['00010','00110','01010','10010','11111','00010','00010'], '5':['11111','10000','10000','11110','00001','00001','11110'],
  '6':['01110','10000','10000','11110','10001','10001','01110'], '7':['11111','00001','00010','00100','01000','01000','01000'],
  '8':['01110','10001','10001','01110','10001','10001','01110'], '9':['01110','10001','10001','01111','00001','00001','01110'],
  '-':['00000','00000','00000','11111','00000','00000','00000'], '.':['00000','00000','00000','00000','00000','00110','00110'],
  ':':['00000','00110','00110','00000','00110','00110','00000'], ' ':['00000','00000','00000','00000','00000','00000','00000']
};
function text(s, x, y, scale, c) { for (let n = 0; n < s.length; n++) { const g = glyph[s[n]] || glyph[' ']; for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 5; gx++) if (g[gy][gx] === '1') rect(x + (n * 6 + gx) * scale, y + gy * scale, scale, scale, c); } }
function card(x, y, w, h, accent) { rect(x, y, w, h, C.paper); rect(x, y, w, 6, accent); rect(x + 5, y + 8, w - 10, h - 13, C.white); }

// Paper-like dark background and a single readable editorial grid.
rect(0, 0, W, H, C.ink); rect(22, 18, W - 44, H - 36, C.paper); rect(30, 26, W - 60, 78, C.sky);
text('WORLD BRIEF', 52, 42, 4, C.white); text('18 NOV 2026', 710, 48, 3, C.gold); text('ONE DAY  -  MANY SIGNALS', 52, 76, 2, C.teal);

// Main story: APEC / Asia-Pacific diplomacy represented as a globe and a summit hall.
card(42, 122, 454, 282, C.red); text('APEC  -  SHENZHEN', 62, 142, 3, C.ink); text('TRADE AND DIPLOMACY', 62, 170, 2, C.slate);
circle(210, 286, 88, C.sea); ring(210, 286, 88, C.ink, 3); line(122, 286, 298, 286, C.teal, 1); line(210, 198, 210, 374, C.teal, 1); ring(210, 286, 58, C.teal, 1);
rect(174, 242, 27, 18, C.green); rect(203, 235, 43, 25, C.green); rect(247, 258, 23, 16, C.green); rect(159, 275, 30, 38, C.green); rect(223, 286, 44, 35, C.green); rect(183, 324, 34, 18, C.green);
for (let i = 0; i < 7; i++) { circle(342 + i * 18, 259 + (i % 2) * 10, 7, i === 2 ? C.red : C.gold); line(342 + i * 18, 267 + (i % 2) * 10, 342 + i * 18, 304, C.ink, 2); }
line(321, 306, 474, 306, C.ink, 3); text('ASIA PACIFIC', 322, 327, 2, C.ink); text('TALKS TAKE CENTER STAGE', 322, 354, 1, C.slate);

// Main business story: chip and earnings, with the verified figure in a restrained badge.
card(514, 122, 468, 160, C.green); text('NVIDIA EARNINGS', 536, 142, 3, C.ink); text('AI CHIP DEMAND', 536, 170, 2, C.slate);
rect(544, 207, 78, 48, C.green); rect(554, 217, 58, 28, C.ink); for (let i = 0; i < 5; i++) { line(540 + i * 18, 197, 540 + i * 18, 207, C.gold, 2); line(540 + i * 18, 255, 540 + i * 18, 265, C.gold, 2); }
line(658, 247, 696, 224, C.green, 3); line(696, 224, 733, 234, C.green, 3); line(733, 234, 778, 188, C.green, 3); line(778, 188, 812, 201, C.green, 3); line(812, 201, 850, 163, C.green, 3); text('Q3  115.8B USD', 690, 226, 2, C.ink);

// Main security story: Manila travel, regional security and sea lanes.
card(514, 300, 468, 104, C.gold); text('MANILA  -  QUAD TALKS', 536, 319, 2, C.ink); text('SECURITY AND SEA LANES', 536, 345, 2, C.slate);
line(536, 380, 944, 380, C.sea, 2); rect(752, 362, 72, 15, C.red); line(744, 378, 836, 378, C.ink, 2); line(774, 362, 790, 348, C.ink, 2); text('PACIFIC', 850, 361, 2, C.ink);

// Supporting stories form a compact lower strip rather than a text wall.
card(42, 422, 185, 118, C.teal); text('AI MODELS', 55, 439, 2, C.ink); text('NEW TOOLS', 55, 463, 2, C.slate); circle(175, 494, 25, C.teal); ring(175, 494, 25, C.ink, 2); rect(162, 481, 8, 8, C.ink); rect(180, 481, 8, 8, C.ink); line(166, 505, 185, 505, C.ink, 1);
card(241, 422, 185, 118, C.pink); text('MARKETS', 254, 439, 2, C.ink); text('ASIA REBOUNDS', 254, 463, 1, C.slate); for (let i = 0; i < 5; i++) rect(258 + i * 24, 505 - i * 8, 13, 20 + i * 8, i === 4 ? C.green : C.pink);
card(440, 422, 185, 118, C.sky); text('KOREA EXAMS', 452, 439, 2, C.ink); text('AI CHECKS', 452, 463, 2, C.slate); rect(470, 485, 42, 30, C.white); line(478, 493, 503, 493, C.ink); line(478, 501, 503, 501, C.ink); circle(550, 498, 18, C.red);
card(639, 422, 343, 118, C.red); text('RING OF FIRE', 654, 439, 2, C.ink); text('INDONESIA QUAKE  -  NZ ALERT', 654, 463, 1, C.slate); line(662, 510, 830, 510, C.sea, 2); line(680, 499, 700, 520, C.red, 2); line(710, 495, 730, 520, C.red, 2); line(740, 500, 760, 520, C.red, 2); circle(885, 500, 20, C.gold);

function crc32(buf) { let c = 0xffffffff; for (const b of buf) { c ^= b; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return (c ^ 0xffffffff) >>> 0; }
function chunk(name, data) { const type = Buffer.from(name); const out = Buffer.alloc(12 + data.length); out.writeUInt32BE(data.length, 0); type.copy(out, 4); data.copy(out, 8); out.writeUInt32BE(crc32(Buffer.concat([type, data])), 8 + data.length); return out; }
const raw = Buffer.alloc((W * 3 + 1) * H); for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; pixels.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
const png = Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
const out = process.env.MAKEFUN_OUTPUT_DIR || '/output'; fs.mkdirSync(out, { recursive: true }); fs.writeFileSync(path.join(out, 'entry.png'), png);

