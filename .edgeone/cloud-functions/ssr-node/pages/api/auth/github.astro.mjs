export { renderers } from '../../../renderers.mjs';

const GET = async ({ request, redirect }) => {
  return new Response("GITHUB_CLIENT_ID 尚未配置", { status: 503 });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
