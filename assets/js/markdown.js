/* Shared Markdown rendering for build and browser. Raw HTML is displayed as text. */
(function (root) {
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function safeURL(value, image = false) {
    const url = String(value || '').trim();
    if (!url || /[\u0000-\u0020\u007f]/.test(url) || url.includes('\\') || url.startsWith('//')) return '';
    if (/^[a-z][a-z\d+.-]*:/i.test(url) && !/^https?:/i.test(url) && !(image === false && /^mailto:/i.test(url))) return '';
    return url;
  }
  function renderMarkdown(input, options = {}) {
    const engine = options.engine || root.marked;
    if (!engine) return '<p>' + escapeHTML(input) + '</p>';
    const ids = new Map();
    const headings = [];
    const renderer = {
      html(token) { return escapeHTML(token.text); },
      heading(token) {
        const level = Math.max(2, token.depth);
        const text = this.parser.parseInline(token.tokens);
        const base = token.text.toLowerCase().replace(/<[^>]*>/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-') || 'section';
        const n = ids.get(base) || 0; ids.set(base, n + 1);
        const id = base + (n ? '-' + (n + 1) : '');
        headings.push({id, text: token.text.replace(/[*`]/g,''), level});
        return `<h${level} id="${id}">${text}</h${level}>\n`;
      },
      link(token) {
        const href = safeURL(token.href);
        const content = this.parser.parseInline(token.tokens);
        return href ? `<a href="${escapeHTML(href)}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${content}</a>` : content;
      },
      image(token) {
        let src = safeURL(token.href, true);
        if (src && options.assetPrefix && src.startsWith('assets/')) src = options.assetPrefix + src;
        return src ? `<img src="${escapeHTML(src)}" alt="${escapeHTML(token.text)}" loading="lazy">` : escapeHTML(token.text);
      }
    };
    const instance = new engine.Marked({gfm:true,breaks:false,renderer});
    const html = instance.parse(String(input || ''));
    return options.withHeadings ? {html, headings} : html;
  }
  root.SiteMarkdown = {escapeHTML, safeURL, render: renderMarkdown};
  if (typeof module !== 'undefined') module.exports = root.SiteMarkdown;
})(typeof globalThis !== 'undefined' ? globalThis : this);
