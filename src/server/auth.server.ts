import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { database, digest } from "./store.server";
const scrypt = promisify(nodeScrypt);
export function adminHash() {
  return process.env["TOPFIT_ADMIN_PASSWORD_HASH"] || "";
}
export async function verifyPassword(password: string) {
  const parts = adminHash().split(":");
  if (parts.length !== 2 || !/^[a-f0-9]{32}$/.test(parts[0]!) || !/^[a-f0-9]{128}$/.test(parts[1]!))
    return false;
  const candidate = (await scrypt(password, parts[0]!, 64)) as Buffer;
  return timingSafeEqual(candidate, Buffer.from(parts[1]!, "hex"));
}
export function sessionCookie(request: Request, token: string, clear = false) {
  const secure = new URL(process.env["TOPFIT_SITE_URL"] || request.url).protocol === "https:";
  return `topfit_session=${token}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${clear ? 0 : 28800}${secure ? "; Secure" : ""}`;
}
export function newSession() {
  const token = randomBytes(32).toString("hex");
  database().prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());
  database()
    .prepare("INSERT INTO sessions(token_hash,expires_at,auth_version) VALUES(?,?,?)")
    .run(digest(token), Date.now() + 8 * 60 * 60_000, digest(adminHash()));
  return token;
}
export function requestToken(request: Request) {
  return (
    request.headers.get("cookie")?.match(/(?:^|;\s*)topfit_session=([a-f0-9]{64})(?:;|$)/)?.[1] ||
    ""
  );
}
export function authenticated(request: Request) {
  const token = requestToken(request);
  if (!token || !adminHash()) return false;
  return !!database()
    .prepare(
      "SELECT token_hash FROM sessions WHERE token_hash=? AND expires_at>? AND auth_version=?",
    )
    .get(digest(token), Date.now(), digest(adminHash()));
}
export function revoke(request: Request) {
  database()
    .prepare("DELETE FROM sessions WHERE token_hash=?")
    .run(digest(requestToken(request)));
}
