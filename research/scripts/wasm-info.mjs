// Prints facts about a built .wasm: whether its memory is shared (imported or
// defined with the shared flag), its limits, and the target features section.
// node research/scripts/wasm-info.mjs path/to/highs.wasm
import fs from "node:fs";

const bytes = fs.readFileSync(process.argv[2]);
let p = 8;
const u32 = () => {
  let result = 0;
  let shift = 0;
  for (;;) {
    const b = bytes[p++];
    result |= (b & 0x7f) << shift;
    if (!(b & 0x80)) return result >>> 0;
    shift += 7;
  }
};
const name = () => {
  const n = u32();
  const s = bytes.subarray(p, p + n).toString("utf8");
  p += n;
  return s;
};
const limits = () => {
  const flags = u32();
  const min = u32();
  const max = flags & 1 ? u32() : null;
  return { shared: Boolean(flags & 2), minPages: min, maxPages: max };
};
const out = { memories: [], features: [], threadImports: [], exceptionTags: 0 };
while (p < bytes.length) {
  const id = bytes[p++];
  const size = u32();
  const end = p + size;
  if (id === 2) {
    const count = u32();
    for (let i = 0; i < count; i += 1) {
      const mod = name();
      const field = name();
      const kind = bytes[p++];
      if (kind === 0) u32();
      else if (kind === 1) {
        p += 1;
        limits();
      } else if (kind === 2) out.memories.push({ import: `${mod}.${field}`, ...limits() });
      else if (kind === 3) p += 2;
      else if (kind === 4) {
        u32(); // tag attribute
        u32(); // tag type index
        out.tagImports = (out.tagImports ?? 0) + 1;
      }
      if (/thread|futex|atomic|wait|notify/i.test(field)) out.threadImports.push(`${mod}.${field}`);
    }
  } else if (id === 5) {
    const count = u32();
    for (let i = 0; i < count; i += 1) out.memories.push({ defined: true, ...limits() });
  } else if (id === 13) {
    out.exceptionTags = u32();
  } else if (id === 0) {
    const sectionName = name();
    if (sectionName === "target_features") {
      const count = u32();
      for (let i = 0; i < count; i += 1) {
        const prefix = String.fromCharCode(bytes[p++]);
        out.features.push(prefix + name());
      }
    }
  }
  p = end;
}
for (const m of out.memories) {
  m.minMB = (m.minPages * 65536) / 1048576;
  if (m.maxPages != null) m.maxMB = (m.maxPages * 65536) / 1048576;
}
console.log(JSON.stringify(out));
