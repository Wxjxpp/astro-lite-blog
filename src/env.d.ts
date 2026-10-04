/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE_URL: string;
  readonly SITE_NAME: string;
  readonly SITE_DESCRIPTION: string;
  readonly GITHUB_CLIENT_ID: string;
  readonly GITHUB_CLIENT_SECRET: string;
  readonly GITHUB_REDIRECT_URI: string;
  readonly SESSION_SECRET: string;
  readonly KV_REST_API_URL: string;
  readonly KV_REST_API_TOKEN: string;
  readonly BLOB_READ_WRITE_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
