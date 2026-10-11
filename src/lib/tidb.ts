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

export function getTiDbConnection() {
  if (!isTiDbConfigured) throw new Error('TiDB connection variables are not configured');
  connection ??= connect(databaseUrl
    ? { url: databaseUrl, fullResult: true }
    : { host, port, username, password, database, fullResult: true });
  return connection;
}

/**
 * Schema creation is intentionally kept out of request handling.
 * The Vercel integration user can query and write data but may not have CREATE
 * privileges. Run the migration script or SQL editor once before deployment.
 */
export async function ensureTiDbSchema() {
  return undefined;
}

export async function tidbQuery<T extends Record<string, unknown> = Record<string, unknown>>(sql: string, args: unknown[] = []) {
  const result = await getTiDbConnection().execute(sql, args);
  return ((result as FullResult).rows || []) as T[];
}

export async function tidbExecute(sql: string, args: unknown[] = []) {
  return getTiDbConnection().execute(sql, args);
}
