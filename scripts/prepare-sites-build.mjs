#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const index = path.join(dist, "client", "index.html");
const worker = path.join(root, "worker", "index.js");
const hosting = path.join(root, ".openai", "hosting.json");

for (const file of [index, worker, hosting]) {
  if (!existsSync(file)) throw new Error("Missing Sites build input: " + file);
}

mkdirSync(path.join(dist, "server"), { recursive: true });
mkdirSync(path.join(dist, ".openai"), { recursive: true });
copyFileSync(worker, path.join(dist, "server", "index.js"));
// Site identity is local source metadata; the deployment accepts runtime keys only.
const { project_id, site_url, ...runtimeHosting } = JSON.parse(readFileSync(hosting, "utf8"));
writeFileSync(path.join(dist, ".openai", "hosting.json"), JSON.stringify(runtimeHosting, null, 2) + "\n");

console.log("Prepared Sites build: dist/server/index.js and dist/.openai/hosting.json");
