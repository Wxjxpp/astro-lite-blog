import { del } from '@vercel/blob';

const BLOB_HOST_SUFFIX = '.blob.vercel-storage.com';

/** Extract only first-party Vercel Blob URLs from Markdown/content fields. */
export function extractBlogBlobUrls(...values: Array<string | undefined | null>): string[] {
  const urls = new Set<string>();
  const pattern = /https?:\/\/[^\s<>()"']+/g;

  for (const value of values) {
    for (const raw of value?.match(pattern) ?? []) {
      const cleaned = raw.replace(/[),.;!?]+$/g, '');
      try {
        const url = new URL(cleaned);
        if (url.protocol === 'https:' && url.hostname.endsWith(BLOB_HOST_SUFFIX)) {
          urls.add(url.toString());
        }
      } catch {
        // Ignore malformed or non-URL Markdown content.
      }
    }
  }

  return [...urls];
}

export async function permanentlyDeleteBlogBlobs(urls: string[]) {
  if (!urls.length) return { deleted: 0 };
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  }
  await del(urls);
  return { deleted: urls.length };
}

/** True for a public https URL on this project's Vercel Blob host. */
export function isBlogBlobUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.endsWith(BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

export const normalizeBlobUrl = (value: string) => new URL(value).toString();
