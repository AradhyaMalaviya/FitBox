import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!file.includes("node_modules") && !file.includes(".git") && !file.includes("dist")) {
        results = results.concat(walk(fullPath));
      }
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      results.push(fullPath);
    }
  }
  return results;
}

const appFile = fs.readFileSync(path.join(rootDir, "src/App.tsx"), "utf8");
const routeRegex = /path="([^"]+)"/g;
const validRoutes = new Set();
let match;
while ((match = routeRegex.exec(appFile)) !== null) {
  validRoutes.add(match[1]);
}
console.log("Defined routes in App.tsx:", Array.from(validRoutes));

const files = walk(path.join(rootDir, "src"));
const linkRegex = /(?:to|href)=["'](\/[^"'?#]*)["']|navigate\(["'](\/[^"'?#]*)["']\)/g;
const foundLinks = [];

for (const f of files) {
  const content = fs.readFileSync(f, "utf8");
  while ((match = linkRegex.exec(content)) !== null) {
    const target = match[1] || match[2];
    if (target && target.startsWith("/") && !target.startsWith("//") && !target.startsWith("/preview") && !target.startsWith("/favicon")) {
      foundLinks.push({ file: path.relative(rootDir, f), target });
    }
  }
}

console.log("Total internal links/navigates found:", foundLinks.length);
const invalid = [];
for (const l of foundLinks) {
  const base = l.target;
  let matched = validRoutes.has(base);
  if (!matched) {
    for (const r of validRoutes) {
      if (r.includes(":")) {
        const pattern = new RegExp("^" + r.replace(/:[^/]+/g, "[^/]+") + "$");
        if (pattern.test(base)) {
          matched = true;
          break;
        }
      }
    }
  }
  if (!matched && base !== "*") {
    invalid.push(l);
  }
}

if (invalid.length > 0) {
  console.error("❌ Potential dead route targets found:", invalid);
  process.exit(1);
} else {
  console.log("✅ ALL internal route targets match defined routes in App.tsx!");
}
