import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const path = resolve(".env.local");
const old = existsSync(path) ? readFileSync(path, "utf8") : "";
if (old.includes("TOPFIT_ADMIN_PASSWORD_HASH=") && !process.argv.includes("--rotate")) {
  console.error(
    "Já existe acesso configurado. Use npm run setup -- --rotate para trocar a senha e invalidar as sessões.",
  );
  process.exit(1);
}
const password = randomBytes(24).toString("base64url");
const salt = randomBytes(16).toString("hex");
const hash = salt + ":" + scryptSync(password, salt, 64).toString("hex");
const cleaned = old.replace(/^TOPFIT_ADMIN_PASSWORD_HASH=.*$/gm, "").trim();
writeFileSync(
  path,
  cleaned +
    "\nTOPFIT_ADMIN_PASSWORD_HASH=" +
    hash +
    "\n" +
    (old.includes("TOPFIT_DATA_DIR=")
      ? ""
      : 'TOPFIT_DATA_DIR="' + resolve(".data").replaceAll("\\", "/") + '"\n'),
  { mode: 0o600 },
);
console.log(
  "Acesso configurado. Guarde esta senha em um gerenciador seguro; ela não será exibida novamente.",
);
console.log(password);
console.log("Reinicie o servidor e acesse /admin. Nunca publique .env.local ou a base de dados.");
