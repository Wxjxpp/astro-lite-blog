import rss from '@astrojs/rss';
import { g as getCollection } from '../chunks/_astro_content_CVBcNLRR.mjs';
import { S as SITE_CONFIG } from '../chunks/utils_CIyKFLQf.mjs';
export { renderers } from '../renderers.mjs';

async function GET(context) {
  const posts = await getCollection("posts", ({ data }) => {
    return data.draft !== true ;
  });
  return rss({
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    site: context.site || SITE_CONFIG.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/posts/${post.id}/`,
      categories: post.data.tags
    })),
    customData: `<language>zh-CN</language>`
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
