export { renderers } from '../../renderers.mjs';

process.env.TWIKOO_PROXY_SECRET || "";
const POST = async (context) => {
  const { request } = context;
  {
    return new Response(JSON.stringify({ code: -1, message: "Twikoo backend is not configured" }), {
      status: 503,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }
};
const OPTIONS = () => new Response(null, { status: 204, headers: { "cache-control": "no-store" } });

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  OPTIONS,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
