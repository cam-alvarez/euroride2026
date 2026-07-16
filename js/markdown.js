/* =====================================================================
   MARKDOWN — tiny, safe renderer for assistant replies.

   Escape-first: the raw text is HTML-escaped in full, THEN a small
   whitelist of Markdown constructs is turned into tags — so nothing the
   model (or anyone upstream of it) writes can inject markup or scripts.

   Supported, deliberately nothing more:
     # headings (any depth → one bold style)   **bold**   *italic*
     `code`   [text](https://…)   - / * / 1. lists   --- rules
   ===================================================================== */
import { esc } from './ui.js';

/**
 * opts.saveLabel — when set, every list item is wrapped in a .li-text
 * span followed by a small "+" button (aria-label = saveLabel) so the
 * host view can offer "save this item" (the chat uses it for plans).
 */
export function md(raw, opts = {}) {
  const lines = esc(String(raw ?? '')).split(/\r?\n/);
  const out = [];
  let list = null; // 'ul' | 'ol' while inside one

  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  const openList = kind => { if (list !== kind) { closeList(); out.push(`<${kind}>`); list = kind; } };
  const li = content => opts.saveLabel
    ? `<li><span class="li-text">${inline(content)}</span><button type="button" class="li-save" aria-label="${esc(opts.saveLabel)}" title="${esc(opts.saveLabel)}">+</button></li>`
    : `<li>${inline(content)}</li>`;

  for (const line of lines) {
    const s = line.trim();
    if (!s) { closeList(); continue; }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(s)) { closeList(); out.push('<hr>'); continue; }

    const heading = s.match(/^#{1,6}\s+(.*)$/);
    if (heading) { closeList(); out.push(`<p class="md-h">${inline(heading[1])}</p>`); continue; }

    const bullet = s.match(/^[-*•]\s+(.*)$/);
    if (bullet) { openList('ul'); out.push(li(bullet[1])); continue; }

    const numbered = s.match(/^\d{1,3}[.)]\s+(.*)$/);
    if (numbered) { openList('ol'); out.push(li(numbered[1])); continue; }

    closeList();
    out.push(`<p>${inline(s)}</p>`);
  }
  closeList();
  return out.join('');
}

/* Inline spans. Order matters: code first (its content stays literal),
   then links (so URLs are consumed before * could touch them), then
   bold before italic (so ** is not eaten as two italics). Only http(s)
   URLs become links — "javascript:" can never survive the pattern. */
function inline(s) {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}
