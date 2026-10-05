// Content inventory + link audit per captured page.
// Preserves inline links/bold/italic; emits DOM-order inventory and a
// per-page authoritative link list, then cross-checks anchor counts.
// Static imports cannot work here: this file is evaluated as a kernel
// script via %load (non-module), so dependencies are runtime-imported.
const { parseHTML } = await import("linkedom");
const { readdir } = await import("node:fs/promises");

const CAPTURE = "/home/user/git/wibble-jelly-games/capture";
const SKIP_TAGS = new Set(["script", "style", "noscript", "template"]);
const ASSET_RE = /\.(png|jpe?g|gif|svg|webp|avif|ico|css|js|mjs|pdf|zip|woff2?|ttf|eot|otf|mp3|mp4|ogg|wav|txt|json|xml)$/i;

const esc = (s) => s.replace(/\s+/g, " ").trim();

function renderInline(node, resolve) {
  let out = "";
  for (const child of node.childNodes) {
    if (child.nodeType === 3) { out += child.data; continue; }
    if (child.nodeType !== 1) continue;
    const tag = child.tagName.toLowerCase();
    if (tag === "br") { out += "\n"; continue; }
    if (tag === "a") {
      const href = child.getAttribute("href") ?? "";
      const inner = renderInline(child, resolve).trim();
      out += `[${inner || href}](${resolve(href)})`;
      continue;
    }
    if (tag === "strong" || tag === "b") { out += `**${renderInline(child, resolve).trim()}**`; continue; }
    if (tag === "em" || tag === "i") { out += `*${renderInline(child, resolve).trim()}*`; continue; }
    if (tag === "code") { out += "`" + esc(child.textContent) + "`"; continue; }
    if (tag === "img") {
      const alt = child.getAttribute("alt") ?? "";
      const src = child.getAttribute("src") ?? "";
      out += `![${alt}](${src})`;
      continue;
    }
    if (SKIP_TAGS.has(tag)) continue;
    out += renderInline(child, resolve);
  }
  return out;
}

const MARKERS = new Set(["header", "nav", "main", "aside", "footer", "article", "section", "figure", "form"]);
function markerFor(el) {
  const tag = el.tagName.toLowerCase();
  if (!MARKERS.has(tag)) return null;
  const id = el.getAttribute("id");
  const cls = (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean).slice(0, 3).join(".");
  const parts = [tag, id ? `#${id}` : "", cls ? `.${cls}` : ""].join("");
  return tag === "figure" || tag === "form" ? `\n[${parts}]` : `[${parts}]`;
}

const lines = [];
const emit = (s = "") => lines.push(s);

function walkBlock(el, ctx) {
  for (const child of el.childNodes) {
    if (child.nodeType === 3) {
      const t = esc(child.data);
      if (t) emit(t);
      continue;
    }
    if (child.nodeType !== 1) continue;
    const tag = child.tagName.toLowerCase();
    if (SKIP_TAGS.has(tag)) continue;
    const mk = markerFor(child);
    if (mk) emit(mk);
    if (/^h[1-6]$/.test(tag)) {
      emit(`${"#".repeat(+tag[1])} ${esc(renderInline(child, ctx.resolve))}`);
      continue;
    }
    if (tag === "p" || tag === "figcaption" || tag === "label" || tag === "legend" || tag === "summary" || tag === "dt" || tag === "dd") {
      const txt = renderInline(child, ctx.resolve).trim();
      if (txt) emit(txt);
      continue;
    }
    if (tag === "ul" || tag === "ol") {
      walkList(child, ctx, tag === "ol" ? 1 : 0, 0);
      continue;
    }
    if (tag === "table") { walkTable(child, ctx); continue; }
    if (tag === "img") {
      emit(`![${child.getAttribute("alt") ?? ""}](${child.getAttribute("src") ?? ""}) ${imgAttrs(child)}`);
      ctx.images.push(child);
      continue;
    }
    if (tag === "a") {
      const href = child.getAttribute("href");
      if (!href) {
        emit(`[button: ${esc(renderInline(child, ctx.resolve))} href=(none)]`);
        ctx.links.push(child);
        continue;
      }
      const img = child.querySelector("img");
      if (img) {
        ctx.images.push(img);
        emit(`- [![${img.getAttribute("alt") ?? ""}](${img.getAttribute("src") ?? ""})](${ctx.resolve(href)})`);
      } else {
        emit(`- [${esc(renderInline(child, ctx.resolve)) || href}](${ctx.resolve(href)})`);
      }
      ctx.links.push(child);
      continue;
    }
    if (tag === "blockquote") {
      for (const part of esc(renderInline(child, ctx.resolve)).split("\n")) emit(`> ${part}`);
      continue;
    }
    if (tag === "pre") { emit("```", child.textContent.replace(/\s+$/, ""), "```"); continue; }
    if (tag === "button" || (tag === "input" && /^(submit|button)$/i.test(child.getAttribute("type") ?? ""))) {
      emit(`[button: ${esc(child.textContent || child.getAttribute("value") || "(no label)")} type=${tag}]`);
      continue;
    }
    if (tag === "input" || tag === "textarea" || tag === "select") {
      const t = tag === "textarea" ? "textarea" : (child.getAttribute("type") ?? "text");
      emit(`[field: ${t} name=${child.getAttribute("name") ?? "(none)"} required=${child.hasAttribute("required")}]`);
      continue;
    }
    if (tag === "iframe" || tag === "video" || tag === "audio") {
      emit(`[${tag}: src=${child.getAttribute("src") ?? "(none)"} w=${child.getAttribute("width") ?? "?"} h=${child.getAttribute("height") ?? "?"}]`);
      continue;
    }
    if (child.childNodes.length) walkBlock(child, ctx);
  }
}

function walkList(list, ctx, startNum, depth) {
  let n = startNum;
  const pad = "  ".repeat(depth);
  for (const li of list.children) {
    if (li.tagName.toLowerCase() !== "li") { walkList(li, ctx, 0, depth); continue; }
    const head = list.tagName.toLowerCase() === "ol" ? `${pad}${n++}. ` : `${pad}- `;
    const inline = [];
    const sub = [];
    for (const c of li.childNodes) {
      if (c.nodeType === 3) { const t = esc(c.data); if (t) inline.push(t); continue; }
      if (c.nodeType !== 1) continue;
      const t2 = c.tagName.toLowerCase();
      if (t2 === "ul" || t2 === "ol") { sub.push([c, t2]); continue; }
      if (t2 === "a") {
        const href = c.getAttribute("href");
        if (!href) {
          const label = esc(renderInline(c, ctx.resolve));
          if (label) inline.push(label);
          continue;
        }
        ctx.links.push(c);
        const label = esc(renderInline(c, ctx.resolve)) || href;
        inline.push(`[${label}](${ctx.resolve(href)})`);
        continue;
      }
      if (t2 === "img") { ctx.images.push(c); inline.push(`![${c.getAttribute("alt") ?? ""}](${c.getAttribute("src") ?? ""})`); continue; }
      const t = esc(renderInline(c, ctx.resolve));
      if (t) inline.push(t);
    }
    emit(head + inline.join(" "));
    for (const [subList, kind] of sub) walkList(subList, ctx, kind === "ol" ? 1 : 0, depth + 1);
  }
}

function walkTable(table, ctx) {
  const rows = [...table.querySelectorAll("tr")];
  rows.forEach((tr, i) => {
    const cells = [...tr.children].map((c) => esc(renderInline(c, ctx.resolve)).replace(/\|/g, "\\|") || " ");
    emit(`| ${cells.join(" | ")} |`);
    if (i === 0 && tr.querySelector("th")) emit(`| ${cells.map(() => "---").join(" | ")} |`);
  });
}

const imgAttrs = (img) =>
  ["width", "height", "class", "srcset"].map((a) => `${a}=${img.getAttribute(a) ?? "-"}`).join(" ");

// --- run over every captured HTML page ---
const rawDir = `${CAPTURE}/raw`;
const files = (await readdir(rawDir)).filter((f) => f.endsWith(".html")).sort();
const auditSummary = [];
for (const file of files) {
  const html = await Bun.file(`${rawDir}/${file}`).text();
  const { document } = parseHTML(html);
  const base = "https://wibblejellygames.com/wordpress/";
  const ctx = {
    resolve: (href) => { try { return new URL(href, base).toString(); } catch { return href; } },
    links: [],
    images: [],
  };
  lines.length = 0;
  // page metadata header
  emit(`# Inventory: ${file}`);
  emit(`- URL: ${document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? base}`);
  emit(`- Title: ${esc(document.querySelector("title")?.textContent ?? "")}`);
  emit(`- Meta description: ${esc(document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "(none)")}`);
  const gen = document.querySelector('meta[name="generator"]');
  if (gen) emit(`- Generator: ${esc(gen.getAttribute("content"))}`);
  emit("");
  walkBlock(document.body, ctx);

  // link audit (authoritative, DOM order)
  const anchors = [...document.querySelectorAll("a[href]")];
  const audit = anchors.map((a, i) => {
    const href = a.getAttribute("href") ?? "";
    let abs = href;
    try { abs = new URL(href, base).toString(); } catch {}
    let kind = "other";
    if (href.startsWith("#")) kind = "fragment";
    else if (/^(mailto|tel|javascript):/i.test(href)) kind = href.split(":")[0];
    else {
      const u = new URL(abs);
      if (u.hostname === "wibblejellygames.com") {
        kind = ASSET_RE.test(u.pathname) ? "internal-asset" : "internal-page";
      } else kind = "external";
    }
    return { i: i + 1, text: esc(renderInline(a, ctx.resolve)).slice(0, 120), href, abs, kind };
  });
  const counts = {};
  for (const l of audit) counts[l.kind] = (counts[l.kind] ?? 0) + 1;
  const rawHrefs = (html.match(/<a(?=[\s>])[^>]*\bhref=/gi) ?? []).length;
  const check = { parsedAnchors: anchors.length, rawATags: rawHrefs, ok: anchors.length === rawHrefs, counts };
  auditSummary.push({ file, ...check });

  const invName = file.replace(/\.html$/, ".md");
  await Bun.write(`${CAPTURE}/inventory/${invName}`, lines.join("\n") + "\n");
  const auditLines = [
    `# Link audit: ${file}`,
    ``,
    `Parsed anchors: ${anchors.length}; raw <a> tags in HTML: ${rawHrefs}; match: ${check.ok}`,
    `Kinds: ${JSON.stringify(counts)}`,
    ``,
    `| # | text | raw href | resolved | kind |`,
    `| --- | --- | --- | --- | --- |`,
    ...audit.map((l) => `| ${l.i} | ${l.text.replace(/\|/g, "\\|")} | ${l.href.replace(/\|/g, "\\|")} | ${l.abs} | ${l.kind} |`),
  ];
  await Bun.write(`${CAPTURE}/audit/links-${invName}`, auditLines.join("\n") + "\n");
  console.log(`${file}: anchors=${anchors.length} rawHref=${rawHrefs} match=${check.ok} kinds=${JSON.stringify(counts)}`);
}
await Bun.write(`${CAPTURE}/audit/extractor-check.json`, JSON.stringify(auditSummary, null, 2));
const bad = auditSummary.filter((a) => !a.ok);
console.log(`\nextractor check: ${auditSummary.length} pages, mismatches: ${bad.length ? bad.map((b) => b.file).join(",") : "none"}`);
