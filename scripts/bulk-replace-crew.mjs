import fs from "node:fs";
import path from "node:path";

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(md|mdc|yaml|yml)$/i.test(e.name)) acc.push(p);
  }
  return acc;
}

function repl(s) {
  return s
    .replace(/^SQUADS\b/mg, "CUADRILLAS")
    .replace(/\bCrews\b/g, "Cuadrillas")
    .replace(/\bcrews\b/g, "cuadrillas")
    .replace(/\bCrew\b/g, "Cuadrilla")
    .replace(/\bcrew\b/g, "cuadrilla")
    .replace(/Create Crew flow/g, "Create Cuadrilla flow")
    .replace(/Edit Crew flow/g, "Edit Cuadrilla flow")
    .replace(/Running a Crew/g, "Running a Cuadrilla")
    .replace(/Creating a Crew/g, "Creating a Cuadrilla")
    .replace(/\/nifillos run my-crew/g, "/nifillos run mi-cuadrilla");
}

const roots = process.argv.slice(2);
let count = 0;
for (const root of roots) {
  const stat = fs.statSync(root);
  const paths = stat.isDirectory() ? walk(root) : [root];
  for (const p of paths) {
    const s = fs.readFileSync(p, "utf8");
    const t = repl(s);
    if (t !== s) {
      fs.writeFileSync(p, t);
      count++;
    }
  }
}
console.log("updated", count, "files");
