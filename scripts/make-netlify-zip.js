const fs = require("fs");
const path = require("path");

const out = path.join(__dirname, "..", "crianza-netlify.zip");
if (fs.existsSync(out)) fs.unlinkSync(out);

const files = [];
function walk(dir, base = "") {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    if (fs.statSync(full).isDirectory()) walk(full, rel);
    else files.push({ full, rel });
  }
}

const roots = [
  "index.html",
  "comunidad.html",
  "canales.html",
  "admin.html",
  "app.js",
  "styles.css",
  "firebase-config.js",
  "netlify.toml",
  "css",
  "js",
  "data",
  "assets",
];

const rootDir = path.join(__dirname, "..");
for (const r of roots) {
  const full = path.join(rootDir, r);
  if (!fs.existsSync(full)) continue;
  if (fs.statSync(full).isDirectory()) walk(full, r);
  else files.push({ full, rel: r });
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function u16(n) {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n, 0);
  return b;
}
function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n, 0);
  return b;
}

const localParts = [];
const centralParts = [];
let offset = 0;
for (const f of files) {
  const data = fs.readFileSync(f.full);
  const name = Buffer.from(f.rel, "utf8");
  const crc = crc32(data);
  const local = Buffer.concat([
    u32(0x04034b50),
    u16(20),
    u16(0),
    u16(0),
    u16(0),
    u16(0),
    u32(crc),
    u32(data.length),
    u32(data.length),
    u16(name.length),
    u16(0),
    name,
    data,
  ]);
  const central = Buffer.concat([
    u32(0x02014b50),
    u16(20),
    u16(20),
    u16(0),
    u16(0),
    u16(0),
    u16(0),
    u32(crc),
    u32(data.length),
    u32(data.length),
    u16(name.length),
    u16(0),
    u16(0),
    u16(0),
    u16(0),
    u32(0),
    u32(offset),
    name,
  ]);
  localParts.push(local);
  centralParts.push(central);
  offset += local.length;
}
const centralDir = Buffer.concat(centralParts);
const end = Buffer.concat([
  u32(0x06054b50),
  u16(0),
  u16(0),
  u16(files.length),
  u16(files.length),
  u32(centralDir.length),
  u32(offset),
  u16(0),
]);
fs.writeFileSync(out, Buffer.concat([...localParts, centralDir, end]));
console.log(`Wrote ${out} (${files.length} files)`);
