import type { APIRoute } from 'astro';
import { getGitHubAuthUrl } from '@lib/auth';
import crypto from 'node:crypto';

export const GET: APIRoute = async ({ request, redirect }) => {
  const state = crypto.randomBytes(16).toString('hex');
  const response = redirect(getGitHubAuthUrl(state));
  response.headers.append('Set-Cookie', `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  return response;
};
