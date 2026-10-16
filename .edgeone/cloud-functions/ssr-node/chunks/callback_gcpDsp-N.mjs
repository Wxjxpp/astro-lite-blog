import { v as verifyOAuthState } from './admin-auth_BWornRI-.mjs';

const GET = async ({ request, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state || !verifyOAuthState(request, state)) return new Response("OAuth state 无效", { status: 400 });
  return new Response("GitHub OAuth 尚未配置", { status: 503 });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

export { GET as G, _page as _ };
