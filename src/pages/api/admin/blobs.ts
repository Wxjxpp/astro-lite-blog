import type { APIRoute } from 'astro';
import { list } from '@vercel/blob';
import { isAdminAuthenticated } from '@lib/admin-auth';
import { getAllPostRecords } from '@lib/posts';
import { getAboutPage } from '@lib/about';
import { extractBlogBlobUrls, isBlogBlobUrl, normalizeBlobUrl, permanentlyDeleteBlogBlobs } from '@lib/blob-storage';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

/** Every Blob URL referenced by any post (drafts included) or cover. */
async function usedUrls(): Promise<Set<string>> {
  const used = new Set<string>();
  for (const post of await getAllPostRecords({ includeDrafts: true })) {
    const body = post.body ?? post.entry?.body ?? '';
    extractBlogBlobUrls(body, post.data.cover).forEach(u => used.add(normalizeBlobUrl(u)));
  }
  extractBlogBlobUrls((await getAboutPage()).content).forEach(u => used.add(normalizeBlobUrl(u))); // images on the About page
  return used;
}

/** Metadata only (no image bytes): a few hundred bytes per blob. */
async function listAll() {
  const all: Awaited<ReturnType<typeof list>>['blobs'] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 10; page++) {
    const result = await list({ limit: 1000, cursor });
    all.push(...result.blobs);
    if (!result.hasMore) break;
    cursor = result.cursor;
  }
  return all.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export const GET: APIRoute = async ({ request, url }) => {
  if (!isAdminAuthenticated(request)) return json({ error: '未登录或会话已过期' }, 401);
  if (!process.env.BLOB_READ_WRITE_TOKEN) return json({ error: '图片存储尚未配置：缺少 BLOB_READ_WRITE_TOKEN' }, 503);

  const offset = Math.max(0, Number(url.searchParams.get('offset')) || 0);
  const limit = Math.min(12, Math.max(1, Number(url.searchParams.get('limit')) || 3));
  const onlyUnused = url.searchParams.get('unused') === '1';

  try {
    const [blobs, used] = await Promise.all([listAll(), usedUrls()]);
    const rows = blobs.map(b => ({ url: b.url, pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt, used: used.has(normalizeBlobUrl(b.url)) }));
    const pool = onlyUnused ? rows.filter(r => !r.used) : rows;
    const items = pool.slice(offset, offset + limit);
    return json({
      items,
      nextOffset: offset + items.length,
      hasMore: offset + items.length < pool.length,
      total: pool.length,
      storeTotal: rows.length,
      unusedTotal: rows.filter(r => !r.used).length,
    });
  } catch (error) {
    console.error('[Blob scan] failed', error);
    return json({ error: '扫描 Blob 失败，请稍后重试' }, 502);
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  if (!isAdminAuthenticated(request)) return json({ error: '未登录或会话已过期' }, 401);
  let body: { url?: string; force?: boolean } = {};
  try { body = await request.json(); } catch { /* handled below */ }
  const target = String(body.url || '');
  if (!isBlogBlobUrl(target)) return json({ error: '只能删除本站 Vercel Blob 中的图片' }, 400);

  try {
    // Re-check on the server: the list the browser holds may be stale.
    if (!body.force && (await usedUrls()).has(normalizeBlobUrl(target))) {
      return json({ error: '这张图片正被文章使用，删除会导致文章里的图片失效', used: true }, 409);
    }
    await permanentlyDeleteBlogBlobs([target]);
    return json({ ok: true });
  } catch (error) {
    console.error('[Blob delete] failed', error);
    return json({ error: '删除失败，请稍后重试' }, 502);
  }
};
