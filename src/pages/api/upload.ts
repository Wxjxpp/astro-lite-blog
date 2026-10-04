import type { APIRoute } from 'astro';
import { put } from '@vercel/blob';
import { getCurrentUser } from '@lib/auth';
import type { ApiResponse } from '@types/index';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif'];
const MAX_SIZE = 5 * 1024 * 1024;

export const POST: APIRoute = async ({ request }) => {
  const user = getCurrentUser(request);
  if (!user) return new Response(JSON.stringify({ success: false, error: 'Authentication required' } satisfies ApiResponse), { status: 401, headers: { 'Content-Type': 'application/json' } });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return new Response(JSON.stringify({ success: false, error: 'No file provided' } satisfies ApiResponse), { status: 400, headers: { 'Content-Type': 'application/json' } });
    if (!ALLOWED_TYPES.includes(file.type)) return new Response(JSON.stringify({ success: false, error: `Unsupported file type: ${file.type}` } satisfies ApiResponse), { status: 400, headers: { 'Content-Type': 'application/json' } });
    if (file.size > MAX_SIZE) return new Response(JSON.stringify({ success: false, error: `File too large. Max: 5MB` } satisfies ApiResponse), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = file.type.split('/')[1];
    const filename = `uploads/${user.id}/${timestamp}-${random}.${ext}`;
    const blob = await put(filename, file, { access: 'public', contentType: file.type, addRandomSuffix: false });

    return new Response(JSON.stringify({ success: true, data: { url: blob.url, filename, size: file.size, contentType: file.type }, message: 'Image uploaded successfully' } satisfies ApiResponse), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Image upload error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to upload image', message: (error as Error).message } satisfies ApiResponse), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
