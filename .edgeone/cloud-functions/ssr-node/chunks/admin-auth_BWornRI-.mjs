import { timingSafeEqual, createHmac } from 'node:crypto';

const sessionCookie = "blog_admin_session";
const stateCookie = "blog_oauth_state";
const sessionSecret = "development-only-change-me";
function getAdminPath() {
  return ("manage-setup-required").replace(/^\/+|\/+$/g, "");
}
function sign(value) {
  return createHmac("sha256", sessionSecret).update(value).digest("base64url");
}
function decode(token) {
  const [value, signature] = token.split(".");
  if (!value || !signature) return null;
  const expected = sign(value);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
function cookies(request) {
  return Object.fromEntries((request.headers.get("cookie") || "").split(";").map((x) => x.trim().split("=")).filter((x) => x.length === 2));
}
function isAdminAuthenticated(request) {
  const token = cookies(request)[sessionCookie];
  const payload = token ? decode(token) : null;
  return Boolean(payload && payload.login === ("Wxjxpp") && payload.exp > Date.now());
}
function verifyOAuthState(request, state) {
  const token = cookies(request)[stateCookie];
  const payload = token ? decode(token) : null;
  return Boolean(payload && payload.state === state && payload.exp > Date.now());
}
function clearSession() {
  return `${sessionCookie}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

export { clearSession as c, getAdminPath as g, isAdminAuthenticated as i, verifyOAuthState as v };
