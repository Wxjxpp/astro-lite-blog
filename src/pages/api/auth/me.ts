import type { APIRoute } from 'astro';
import { getCurrentUser, clearSessionCookie } from '@lib/auth';

export const GET: APIRoute = async ({ request }) => {
  const user = getCurrentUser(request);
  return new Response(JSON.stringify({ success: true, data: user ? { user } : { user: null } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ request }) => {
  const response = new Response(JSON.stringify({ success: true, message: 'Logged out successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  clearSessionCookie(response);
  return response;
};
