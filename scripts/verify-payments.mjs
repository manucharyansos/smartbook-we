import { build } from "esbuild";
import { createRequire } from "node:module";
import path from "node:path";
const result = await build({
  entryPoints: ["scripts/payment-render.test.tsx"], bundle: true, write: false,
  platform: "node", format: "cjs", target: "node22", alias: { "@": path.resolve("src") },
  loader: { ".css": "empty" }, define: { "import.meta.env": JSON.stringify({ DEV: false, VITE_API_URL: "http://127.0.0.1:8000/api" }) },
});
const module = { exports: {} };
new Function("require", "module", "exports", result.outputFiles[0].text)(createRequire(import.meta.url), module, module.exports);
