// Site capture crawler for https://wibblejellygames.com
// Saves raw HTML per page + manifest.json under capture/raw and capture/.
import { parseHTML } from "linkedom";

const CAPTURE = "/home/user/git/wibble-jelly-games/capture";
const ORIGIN = "https://wibblejellygames.com";
const UA = "wibble-jelly-games-mirror/1.0 (local site capture; CfA Static rebuild groundwork)";

const SKIP = [
  /\/wp-admin/, /\/wp-login\.php/, /xmlrpc\.php/, /rest_route=/, /\/wp-json/,
  /(^|[?&])feed=/, /\/feed(\/|$)/i, /replytocom=/, /\/comment-page-/,
  /[?&]s=/, /[?&]m=\d{6}/, /[?&]share=/, /#$/, /^mailto:/, /^tel:/, /^javascript:/,
];
const ASSET_EXT =
  /\.(png|jpe?g|gif|svg|webp|avif|ico|css|js|mjs|pdf|zip|woff2?|ttf|eot|otf|mp3|mp4|ogg|wav|txt|json)$/i;

const normalize = (u) => {
  try {
    const url = new URL(u, ORIGIN + "/");
    if (url.hostname === "www.wibblejellygames.com") url.hostname = "wibblejellygames.com";
    url.hash = "";
    if (url.pathname === "/") url.pathname = "/wordpress/"; // bare root redirects here
    if (url.pathname === "/wordpress/index.php") url.pathname = "/wordpress/";
    return url.toString();
  } catch { return null; }
};

const isPage = (u) => {
  const url = new URL(u);
  if (url.hostname !== "wibblejellygames.com") return false;
  const s = url.toString();
  if (SKIP.some((re) => re.test(s))) return false;
  if (url.pathname.endsWith(".xml")) return false;
  if (ASSET_EXT.test(url.pathname)) return false;
  return true;
};

const fileFor = (u) => {
  const url = new URL(u);
  const q = url.searchParams;
  if (q.has("feed")) return `feed-${q.get("feed")}.xml`;
  if (q.has("page_id")) return `page-${q.get("page_id")}.html`;
  if (q.has("p")) return `post-${q.get("p")}.html`;
  if (q.has("cat")) return `category-${q.get("cat")}.html`;
  if (q.has("attachment_id")) return `attachment-${q.get("attachment_id")}.html`;
  if (q.has("cpage")) return `comment-page-${q.get("cpage")}.html`;
  if (url.pathname === "/wordpress/" || url.pathname === "/") return "index.html";
  const seg = url.pathname.replace(/^\/+|\/+$/g, "").replace(/[^\w.-]+/g, "_");
  const qs = [...q.entries()].map(([k, v]) => `${k}-${v}`).join("_").replace(/[^\w.-]+/g, "_");
  return `${seg || "page"}${qs ? "__q_" + qs : ""}.html`;
};

async function fetchChain(u) {
  const chain = [];
  let current = u;
  for (let hop = 0; hop < 10; hop++) {
    const r = await fetch(current, { headers: { "User-Agent": UA }, redirect: "manual" });
    const loc = r.headers.get("location");
    chain.push({ url: current, status: r.status, location: loc });
    if (r.status >= 300 && r.status < 400 && loc) {
      current = new URL(loc, current).toString();
      continue;
    }
    const body = r.status === 200 ? new Uint8Array(await r.arrayBuffer()) : null;
    return { final: current, status: r.status, chain, body };
  }
  return { final: current, status: 0, chain, body: null };
}

const PAGES = new Map();      // requested normalized -> record
const ALIASES = new Map();    // finalUrl -> requested of first fetch
const queue = [];
const seen = new Set();

function enqueue(u) {
  const n = normalize(u);
  if (!n || seen.has(n)) return;
  if (!isPage(n)) return;
  seen.add(n);
  queue.push(n);
}

// Seeds
enqueue("https://wibblejellygames.com/");
enqueue("https://wibblejellygames.com/wordpress/");
enqueue("https://wibblejellygames.com/wordpress/index.php");
enqueue("https://wibblejellygames.com/wordpress/?feed=rss2");
enqueue("https://wibblejellygames.com/wordpress/?feed=comments-rss2");

while (queue.length) {
  const u = queue.shift();
  if (PAGES.size >= 200) { console.log("PAGE LIMIT REACHED"); break; }
  const { final, status, chain, body } = await fetchChain(u);
  const nFinal = normalize(final) ?? final;
  if (ALIASES.has(nFinal) && body) {
    PAGES.set(u, { requested: u, finalUrl: final, status, redirects: chain, aliasOf: ALIASES.get(nFinal), file: null, bytes: 0, fetchedAt: new Date().toISOString() });
    console.log(`ALIAS ${u} -> ${nFinal} (=${ALIASES.get(nFinal)})`);
    continue;
  }
  const file = fileFor(nFinal);
  const rec = { requested: u, finalUrl: final, status, redirects: chain, file, bytes: body?.length ?? 0, fetchedAt: new Date().toISOString() };
  if (body) {
    ALIASES.set(nFinal, u);
    await Bun.write(`${CAPTURE}/raw/${file}`, body);
    if (file.endsWith(".html")) {
      const { document } = parseHTML(new TextDecoder().decode(body));
      rec.title = document.querySelector("title")?.textContent?.trim() ?? null;
      rec.metaDescription = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? null;
      const h1 = document.querySelector("h1");
      rec.h1 = h1?.textContent?.trim() ?? null;
      // discover links
      let found = 0;
      for (const a of document.querySelectorAll("a[href]")) {
        const href = a.getAttribute("href");
        try {
          const abs = new URL(href, final).toString();
          enqueue(abs);
          found++;
        } catch {}
      }
      rec.linksSeen = found;
    } else if (file.endsWith(".xml")) {
      // RSS: queue item links as pages
      const text = new TextDecoder().decode(body);
      const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)];
      rec.feedItems = items.map((m) => ({
        title: m[1].match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() ?? null,
        link: m[1].match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? null,
      }));
      for (const it of rec.feedItems) if (it.link) enqueue(it.link);
    }
  }
  PAGES.set(u, rec);
  console.log(`${status} ${u} -> ${file ?? "(alias)"}${rec.title ? ` | ${rec.title}` : ""}`);
  await Bun.sleep(250);
}

globalThis.PAGES = PAGES;
globalThis.ALIASES = ALIASES;
const manifest = {
  captureDate: new Date().toISOString(),
  source: "https://wibblejellygames.com/",
  canonicalBase: "https://wibblejellygames.com/wordpress/",
  pages: [...PAGES.values()],
};
await Bun.write(`${CAPTURE}/manifest.json`, JSON.stringify(manifest, null, 2));
console.log(`\nDONE pages=${PAGES.size} files=${[...PAGES.values()].filter(p => p.file).length}`);
