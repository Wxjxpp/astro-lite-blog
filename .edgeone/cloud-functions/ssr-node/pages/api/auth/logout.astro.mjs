import { c as clearSession, g as getAdminPath } from '../../../chunks/admin-auth_BWornRI-.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = ({ redirect }) => new Response(null, { status: 302, headers: { location: `/${getAdminPath()}`, "set-cookie": clearSession() } });

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
