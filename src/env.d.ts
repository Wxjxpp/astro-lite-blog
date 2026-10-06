/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE_URL: string;
  readonly SITE_NAME: string;
  readonly SITE_DESCRIPTION: string;
  readonly PUBLIC_TWIKOO_ENV_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}