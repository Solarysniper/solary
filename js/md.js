// Rendu markdown minimal et sûr (échappement systématique)
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`(.+?)`/g, '<code>$1</code>');
export function md(src) {
  const lines = String(src || '').replace(/\r/g, '').split('\n'); const out = []; let list = null; let table = null;
  const flush = () => { if (list) { out.push(`</${list}>`); list = null; } if (table) { out.push('</tbody></table></div>'); table = null; } };
  for (const raw of lines) {
    const l = raw.trimEnd();
    if (/^\|.*\|$/.test(l.trim())) {
      const cells = l.trim().slice(1, -1).split('|').map((c) => c.trim());
      if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
      if (!table) { flush(); out.push('<div class="tbl"><table><thead><tr>' + cells.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>'); table = true; continue; }
      out.push('<tr>' + cells.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>'); continue;
    }
    if (table) flush();
    let m;
    if ((m = /^(#{1,4})\s+(.*)/.exec(l))) { flush(); const n = Math.min(4, m[1].length + 1); out.push(`<h${n}>${inline(m[2])}</h${n}>`); }
    else if ((m = /^\s*[-*•]\s+(.*)/.exec(l))) { if (list !== 'ul') { flush(); out.push('<ul>'); list = 'ul'; } out.push(`<li>${inline(m[1])}</li>`); }
    else if ((m = /^\s*\d+[.)]\s+(.*)/.exec(l))) { if (list !== 'ol') { flush(); out.push('<ol>'); list = 'ol'; } out.push(`<li>${inline(m[1])}</li>`); }
    else if ((m = /^>\s?(.*)/.exec(l))) { flush(); out.push(`<blockquote>${inline(m[1])}</blockquote>`); }
    else if (!l.trim()) flush();
    else { flush(); out.push(`<p>${inline(l)}</p>`); }
  }
  flush();
  return out.join('');
}
