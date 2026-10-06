import type { APIRoute } from 'astro';
import { clearSession, getAdminPath } from '@lib/admin-auth';

export const GET: APIRoute = ({ redirect }) =>
  new Response(null, { status: 302, headers: { location: `/${getAdminPath()}`, 'set-cookie': clearSession() } });
