// Palette + typography extraction from captured CSS, inline <style> blocks,
// and style attributes. Output: capture/palette-typography.md
const { readdir } = await import("node:fs/promises");

const CAPTURE = "/home/user/git/wibble-jelly-games/capture";

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...await walk(p));
    else out.push(p);
  }
  return out;
}

const cssFiles = (await walk(`${CAPTURE}/assets`)).filter((p) => p.endsWith(".css"));
const rawFiles = (await readdir(`${CAPTURE}/raw`)).filter((f) => f.endsWith(".html")).map((f) => `${CAPTURE}/raw/${f}`);

const sources = []; // { name, css }
for (const p of cssFiles) {
  sources.push({ name: p.replace(`${CAPTURE}/assets/`, ""), css: await Bun.file(p).text() });
}
const rawHtml = [];
for (const p of rawFiles) rawHtml.push({ name: p.replace(`${CAPTURE}/raw/`, ""), html: await Bun.file(p).text() });
const inlineCss = rawHtml.map(({ name, html }) =>
  ({ name: `${name} <style>`, css: [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n") })
).filter((s) => s.css.trim());
const styleAttrs = rawHtml.map(({ name, html }) =>
  ({ name: `${name} style=""`, css: [...html.matchAll(/style="([^"]*)"/g)].map((m) => m[1]).join(";\n") })
).filter((s) => s.css.trim());

const hex = (s) => s.toLowerCase();
const count = (map, key, src) => {
  const k = key.trim().replace(/\s*!important\s*$/i, "");
  if (!k) return;
  if (!map.has(k)) map.set(k, new Map());
  const m = map.get(k);
  m.set(src, (m.get(src) ?? 0) + 1);
};

const colors = new Map();
const families = new Map();
const sizes = new Map();
const weights = new Map();

const COLOR_RE = /(#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\))/gi;
const DECL_RE = /([a-z-]+)\s*:\s*([^;{}]+)/gi;

for (const { name, css } of [...sources, ...inlineCss, ...styleAttrs]) {
  for (const m of css.matchAll(COLOR_RE)) count(colors, m[1].startsWith("#") ? hex(m[1]) : m[1].replace(/\s+/g, " "), name);
  for (const m of css.matchAll(DECL_RE)) {
    const prop = m[1].toLowerCase();
    const val = m[2].replace(/\s+/g, " ").trim();
    if (prop === "font-family") count(families, val, name);
    else if (prop === "font-size") count(sizes, val, name);
    else if (prop === "font-weight") count(weights, val, name);
  }
}

const totalFor = (map) => [...map.values()].reduce((s, m) => s + [...m.values()].reduce((a, b) => a + b, 0), 0);
const sorted = (map) => [...map.entries()]
  .map(([k, m]) => ({ key: k, total: [...m.values()].reduce((a, b) => a + b, 0), where: [...m.entries()].sort((a, b) => b[1] - a[1]).map(([s, c]) => `${s}×${c}`).join(", ") }))
  .sort((a, b) => b.total - a.total);

const emitTable = (rows) => [
  `| value | count | top sources |`,
  `| --- | --- | --- |`,
  ...rows.map((r) => `| \`${r.key.replace(/\|/g, "\\|")}\` | ${r.total} | ${r.where.slice(0, 3)} |`),
];

const doc = [
  `# Palette and typography — wibblejellygames.com`,
  ``,
  `Extracted ${new Date().toISOString().slice(0, 10)} from captured CSS (${cssFiles.length} files), inline \`<style>\` blocks, and inline \`style\` attributes.`,
  `Counts are raw declaration frequencies; the live page applies cascade specificity on top.`,
  ``,
  `## Colors (by declaration frequency)`,
  ``,
  ...emitTable(sorted(colors)),
  ``,
  `## Font families`,
  ``,
  ...emitTable(sorted(families)),
  ``,
  `Google Fonts load Roboto and Merriweather 300/400 via \`fonts.googleapis.com\` (third-party; not downloaded).`,
  ``,
  `## Font sizes`,
  ``,
  ...emitTable(sorted(sizes)),
  ``,
  `## Font weights`,
  ``,
  ...emitTable(sorted(weights)),
];
await Bun.write(`${CAPTURE}/palette-typography.md`, doc.join("\n") + "\n");
console.log(`colors: ${colors.size} unique (${totalFor(colors)} decls); families: ${families.size}; sizes: ${sizes.size}; weights: ${weights.size}`);
