import { Marked } from 'marked';
import hljs from 'highlight.js/lib/common';
import markedKatex from 'marked-katex-extension';
import markedFootnote from 'marked-footnote';

/** A private Marked instance (same features as article pages) for content outside the post pipeline. */
const md = new Marked();
md.use(markedKatex({ throwOnError: false, nonStandard: true }));
md.use(markedFootnote());
md.use({
  renderer: {
    code({ text, lang }) {
      const language = lang?.trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9_+-]/g, '');
      const highlighted = language && hljs.getLanguage(language) ? hljs.highlight(text, { language }).value : hljs.highlightAuto(text).value;
      return `<pre><code class="hljs${language ? ` language-${language}` : ''}">${highlighted}</code></pre>`;
    },
  },
});

export async function renderMarkdown(source: string): Promise<string> {
  return await md.parse(source);
}
