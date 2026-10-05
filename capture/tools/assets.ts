// Asset capture: same-host assets under their original filenames.
// Parses each raw page for asset URLs (and CSS files for nested refs),
// downloads same-host assets into capture/assets/<origin path>,
// and writes capture/assets.json (first-party) + third-party reference list.
const { parseHTML } = await import("linkedom");
const { readdir, mkdir } = await import("node:fs/promises");

const CAPTURE = "/home/user/git/wibble-jelly-games/capture";
const ORIGIN = "https://wibblejellygames.com";
const UA = "wibble-jelly-games-mirror/1.0 (local site capture; CfA Static rebuild groundwork)";
const ASSET_EXT = /\.(png|jpe?g|gif|svg|webp|avif|ico|css|js|mjs|pdf|zip|woff2?|ttf|eot|otf|mp3|mp4|ogg|wav|txt|json)$/i;

const collected = new Map(); // absoluteUrl -> { url, file, bytes, contentType, from: Set<string> }
const thirdParty = new Map(); // url -> Set<page>
const queue = []; // { url, from }

function addAsset(abs, from, note) {
  if (!abs || abs.startsWith("data:")) return;
  let u;
  try { u = new URL(abs); } catch { return; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return;
  const isSame = u.hostname === "wibblejellygames.com" || u.hostname === "www.wibblejellygames.com";
  if (!isSame) {
    if (!thirdParty.has(u.toString())) thirdParty.set(u.toString(), new Set());
    thirdParty.get(u.toString()).add(from);
    return;
  }
  if (u.hostname === "www.wibblejellygames.com") u.hostname = "wibblejellygames.com";
  const key = u.toString();
  if (!collected.has(key)) {
    collected.set(key, { url: key, file: null, bytes: 0, contentType: null, from: new Set(), note });
    queue.push(key);
  }
  collected.get(key).from.add(from);
}

function collectFromHtml(html, pageFile, baseUrl) {
  const { document } = parseHTML(html);
  const abs = (h) => { try { return new URL(h, baseUrl).toString(); } catch { return null; } };
  for (const el of document.querySelectorAll("link[href]")) {
    const rel = (el.getAttribute("rel") ?? "").toLowerCase();
    if (/\b(stylesheet|icon|apple-touch-icon|shortcut|profile)\b/.test(rel)) {
      const a = abs(el.getAttribute("href"));
      if (a) addAsset(a, pageFile, rel);
    }
  }
  for (const el of document.querySelectorAll("script[src]")) {
    const a = abs(el.getAttribute("src"));
    if (a) addAsset(a, pageFile, "script");
  }
  for (const el of document.querySelectorAll("img")) {
    const a = abs(el.getAttribute("src"));
    if (a) addAsset(a, pageFile, "img");
    for (const part of (el.getAttribute("srcset") ?? "").split(",")) {
      const u = part.trim().split(/\s+/)[0];
      const au = u && abs(u);
      if (au) addAsset(au, pageFile, "img-srcset");
    }
  }
  for (const el of document.querySelectorAll("source")) {
    const a = abs(el.getAttribute("src"));
    if (a) addAsset(a, pageFile, "source");
    for (const part of (el.getAttribute("srcset") ?? "").split(",")) {
      const u = part.trim().split(/\s+/)[0];
      const au = u && abs(u);
      if (au) addAsset(au, pageFile, "source-srcset");
    }
  }
  for (const el of document.querySelectorAll("video, audio")) {
    for (const attr of ["src", "poster"]) {
      const a = abs(el.getAttribute(attr));
      if (a) addAsset(a, pageFile, el.tagName.toLowerCase());
    }
  }
  for (const el of document.querySelectorAll("iframe[src]")) {
    const a = abs(el.getAttribute("src"));
    if (a) addAsset(a, pageFile, "iframe");
  }
  for (const el of document.querySelectorAll("a[href]")) {
    const a = abs(el.getAttribute("href"));
    if (a && ASSET_EXT.test(new URL(a).pathname)) addAsset(a, pageFile, "download-link");
  }
  // inline styles: url(...) refs
  for (const el of document.querySelectorAll("[style]")) {
    for (const m of (el.getAttribute("style") ?? "").matchAll(/url\((['"]?)([^'")]+)\1\)/g)) {
      const a = abs(m[2]);
      if (a) addAsset(a, pageFile, "inline-style");
    }
  }
  for (const style of document.querySelectorAll("style")) {
    for (const m of (style.textContent ?? "").matchAll(/url\((['"]?)([^'")]+)\1\)/g)) {
      const a = abs(m[2]);
      if (a) addAsset(a, pageFile, "style-block");
    }
  }
}

const files = (await readdir(`${CAPTURE}/raw`)).sort();
for (const file of files) {
  if (file.endsWith(".html")) {
    collectFromHtml(await Bun.file(`${CAPTURE}/raw/${file}`).text(), file, `${ORIGIN}/wordpress/`);
  }
}
console.log(`pages scanned: ${files.length}; same-host assets: ${collected.size}; third-party refs: ${thirdParty.size}`);

// download loop (CSS recursion)
const cssDone = new Set();
await mkdir(`${CAPTURE}/assets`, { recursive: true });
while (queue.length) {
  const url = queue.shift();
  const rec = collected.get(url);
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (!r.ok) { rec.error = `HTTP ${r.status}`; continue; }
    const buf = new Uint8Array(await r.arrayBuffer());
    rec.bytes = buf.length;
    rec.contentType = r.headers.get("content-type");
    const u = new URL(url);
    const rel = decodeURIComponent(u.pathname).replace(/^\/+/, "").replace(/[^\w./-]+/g, "_");
    rec.file = rel;
    await Bun.write(`${CAPTURE}/assets/${rel}`, buf);
    if (/text\/css|\.css($|\?)/i.test(rec.contentType ?? "") || url.endsWith(".css")) {
      if (!cssDone.has(url)) {
        cssDone.add(url);
        const text = new TextDecoder().decode(buf);
        for (const m of text.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) {
          const a = new URL(m[2], url).toString();
          addAsset(a, rel, "css");
        }
        for (const m of text.matchAll(/@import\s+(?:url\()?(['"])([^'"]+)\1/gm)) {
          const a = new URL(m[2], url).toString();
          addAsset(a, rel, "css-import");
        }
      }
    }
  } catch (e) {
    rec.error = String(e).slice(0, 200);
  }
  await Bun.sleep(120);
}

const assetList = [...collected.values()].map((a) => ({ ...a, from: [...a.from] }));
await Bun.write(`${CAPTURE}/assets.json`, JSON.stringify({
  capturedAt: new Date().toISOString(),
  assets: assetList,
  thirdParty: [...thirdParty.entries()].map(([url, pages]) => ({ url, referencedBy: [...pages] })),
}, null, 2));

const failed = assetList.filter((a) => a.error);
const totalBytes = assetList.reduce((s, a) => s + (a.bytes ?? 0), 0);
console.log(`downloaded: ${assetList.length - failed.length}/${assetList.length}, total ${(totalBytes / 1024).toFixed(0)} KiB`);
if (failed.length) console.log("FAILED:", failed.map((a) => `${a.url} (${a.error})`).join("; "));
const kinds = {};
for (const a of assetList) { const ext = (a.file ?? "").split(".").pop() ?? "?"; kinds[ext] = (kinds[ext] ?? 0) + 1; }
console.log("by type:", JSON.stringify(kinds));
for (const [url, pages] of thirdParty) console.log(`3P ${url} <- ${[...pages].join(",")}`);
