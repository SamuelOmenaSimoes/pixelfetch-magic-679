if (process.env.DATABASE_URL)
  throw new Error(
    "Para PostgreSQL, use backup do provedor ou pg_dump. Este script atende somente SQLite.",
  );
import { DatabaseSync, backup } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
const data = process.env.TOPFIT_DATA_DIR;
if (!data) throw new Error("Configure TOPFIT_DATA_DIR antes de gerar backup.");
const dir = resolve(process.env.TOPFIT_BACKUP_DIR || "backups");
mkdirSync(dir, { recursive: true, mode: 0o700 });
const source = new DatabaseSync(resolve(data, "topfit.sqlite"), { readOnly: true });
try {
  const target = resolve(
    dir,
    "topfit-" + new Date().toISOString().replaceAll(":", "-") + ".sqlite",
  );
  await backup(source, target);
  console.log("Backup concluído: " + target);
} finally {
  source.close();
}
