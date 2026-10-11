import { connect, type Connection, type FullResult } from '@tidbcloud/serverless';

const databaseUrl = import.meta.env.DATABASE_URL;
const host = import.meta.env.TIDB_HOST;
const port = import.meta.env.TIDB_PORT;
const username = import.meta.env.TIDB_USER;
const password = import.meta.env.TIDB_PASSWORD;
const database = import.meta.env.TIDB_DATABASE;

const hasTidbParts = Boolean(host && username && password && database);
export const isTiDbConfigured = Boolean(databaseUrl || hasTidbParts);

type TidbConfig = { url?: string; host?: string; port?: string; username?: string; password?: string; database?: string; fullResult: true };
let connection: Connection<TidbConfig> | undefined;
let schemaPromise: Promise<void> | undefined;

export function getTiDbConnection() {
  if (!isTiDbConfigured) throw new Error('TiDB connection variables are not configured');
  connection ??= connect(databaseUrl
    ? { url: databaseUrl, fullResult: true }
    : { host, port, username, password, database, fullResult: true });
  return connection;
}

export async function ensureTiDbSchema() {
  if (!isTiDbConfigured) return;
  schemaPromise ??= (async () => {
    const db = getTiDbConnection();
    await db.execute(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        slug VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        pub_date VARCHAR(40) NOT NULL,
        updated_date VARCHAR(40) NULL,
        category VARCHAR(255) NOT NULL,
        tags JSON NOT NULL,
        cover TEXT NULL,
        draft BOOLEAN NOT NULL DEFAULT FALSE,
        author VARCHAR(255) NULL,
        content LONGTEXT NOT NULL,
        created_at VARCHAR(40) NOT NULL,
        updated_at VARCHAR(40) NOT NULL,
        INDEX idx_blog_posts_pub_date (pub_date),
        INDEX idx_blog_posts_category (category)
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS blog_post_deletions (
        slug VARCHAR(255) PRIMARY KEY,
        deleted_at VARCHAR(40) NOT NULL
      )
    `);
  })().catch(error => {
    schemaPromise = undefined;
    throw error;
  });
  return schemaPromise;
}

export async function tidbQuery<T extends Record<string, unknown> = Record<string, unknown>>(sql: string, args: unknown[] = []) {
  await ensureTiDbSchema();
  const result = await getTiDbConnection().execute(sql, args);
  return ((result as FullResult).rows || []) as T[];
}

export async function tidbExecute(sql: string, args: unknown[] = []) {
  await ensureTiDbSchema();
  return getTiDbConnection().execute(sql, args);
}
