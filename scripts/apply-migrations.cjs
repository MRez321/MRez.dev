// One-time repair: apply the blog migration manually (0000 was never tracked —
// the base schema pre-existed via `push`) and record it in __drizzle_migrations
// with the same sha256 hash drizzle-kit computes, so `drizzle-kit migrate`
// becomes a clean no-op going forward.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Database = require("better-sqlite3");

const root = process.cwd();
const dir = path.join(root, "drizzle");
const db = new Database(path.join(root, "data", "sqlite.db"));

// ensure tracking table exists with drizzle-kit's schema
db.exec(`CREATE TABLE IF NOT EXISTS __drizzle_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hash TEXT NOT NULL,
  created_at INTEGER
)`);

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
for (const file of files) {
  if (file.startsWith("0000_")) {
    console.log(`skipping ${file} (schema pre-existed via push)`);
    continue;
  }
  const sql = fs.readFileSync(path.join(dir, file), "utf8");
  const hash = crypto.createHash("sha256").update(sql).digest("hex");
  const already = db.prepare("SELECT 1 FROM __drizzle_migrations WHERE hash = ?").get(hash);
  if (already) {
    console.log(`${file} already recorded`);
    continue;
  }
  const tx = db.transaction(() => {
    for (const stmt of sql.split("--> statement-breakpoint")) {
      if (stmt.trim()) db.exec(stmt.trim());
    }
    db.prepare("INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)").run(hash, Date.now());
  });
  tx();
  console.log(`applied ${file} (${hash.slice(0, 12)})`);
}

console.log("tables:", db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map((r) => r.name).join(","));
console.log("user cols:", db.prepare("PRAGMA table_info(user)").all().map((c) => c.name).join(","));
console.log("migrations:", JSON.stringify(db.prepare("SELECT hash FROM __drizzle_migrations").all().map((r) => r.hash.slice(0, 12))));
db.close();
