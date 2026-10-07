import { spawnSync } from "node:child_process";
const result = spawnSync(process.execPath, ["node_modules/vite/bin/vite.js", "build"], {
  env: { ...process.env, NITRO_PRESET: "vercel" },
  stdio: "inherit",
});
process.exit(result.status ?? 1);
