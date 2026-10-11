import { MongoClient } from 'mongodb';
import { connect } from '@tidbcloud/serverless';

const mongoUri = process.env.BLOG_MONGODB_URI;
const databaseUrl = process.env.DATABASE_URL;
const dbName = process.env.BLOG_MONGODB_DATABASE || 'astro_blog';
if (!mongoUri || !databaseUrl) throw new Error('需要设置 BLOG_MONGODB_URI 和 DATABASE_URL；脚本只会复制数据，不会删除 MongoDB 数据。');
const iso = value => value ? new Date(value).toISOString() : null;

const tidb = connect({ url: databaseUrl, fullResult: true });
await tidb.execute(`CREATE TABLE IF NOT EXISTS blog_posts (
  slug VARCHAR(255) PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
  pub_date VARCHAR(40) NOT NULL, updated_date VARCHAR(40) NULL, category VARCHAR(255) NOT NULL,
  tags JSON NOT NULL, cover TEXT NULL, draft BOOLEAN NOT NULL DEFAULT FALSE, author VARCHAR(255) NULL,
  content LONGTEXT NOT NULL, created_at VARCHAR(40) NOT NULL, updated_at VARCHAR(40) NOT NULL,
  INDEX idx_blog_posts_pub_date (pub_date), INDEX idx_blog_posts_category (category)
)`);
await tidb.execute(`CREATE TABLE IF NOT EXISTS blog_post_deletions (
  slug VARCHAR(255) PRIMARY KEY, deleted_at VARCHAR(40) NOT NULL
)`);

const mongo = await new MongoClient(mongoUri).connect();
try {
  const db = mongo.db(dbName);
  const posts = await db.collection('posts').find({}).toArray();
  const deletions = await db.collection('post_deletions').find({}).toArray();
  for (const post of posts) {
    await tidb.execute(`INSERT INTO blog_posts (slug,title,description,pub_date,updated_date,category,tags,cover,draft,author,content,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), pub_date=VALUES(pub_date), updated_date=VALUES(updated_date), category=VALUES(category), tags=VALUES(tags), cover=VALUES(cover), draft=VALUES(draft), author=VALUES(author), content=VALUES(content), created_at=VALUES(created_at), updated_at=VALUES(updated_at)`, [
      post.slug, post.title || '', post.description || '', iso(post.pubDate), iso(post.updatedDate), post.category || '', JSON.stringify(post.tags || []), post.cover || null,
      Boolean(post.draft), post.author || null, post.content || '', iso(post.createdAt) || new Date().toISOString(), iso(post.updatedAt) || new Date().toISOString(),
    ]);
  }
  for (const deletion of deletions) {
    await tidb.execute('INSERT INTO blog_post_deletions (slug, deleted_at) VALUES (?, ?) ON DUPLICATE KEY UPDATE deleted_at=VALUES(deleted_at)', [deletion.slug, iso(deletion.deletedAt) || new Date().toISOString()]);
  }
  console.log(JSON.stringify({ ok: true, posts: posts.length, deletions: deletions.length, message: '已复制到 TiDB，MongoDB 未被修改' }, null, 2));
} finally {
  await mongo.close();
}
