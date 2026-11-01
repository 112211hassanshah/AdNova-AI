import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { pythonEnvironment, root } from "./runtime-env.mjs";

// Run serially: Spark/process tests and production builds should not compete.
const commands = [
  ["npm", ["run", "check"]],
  [`${root}.venv/bin/python`, ["-m", "pytest"]],
  [`${root}.venv/bin/ruff`, ["check", "backend", "scripts"]],
  ["npm", ["run", "format:check"]],
  ["npm", ["run", "build"]],
];
const results = [];
for (const [command, args] of commands) {
  const started = Date.now();
  const code = await new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: root,
      env: pythonEnvironment(),
      stdio: "inherit",
    });
    child.on("error", (error) => {
      console.error(error.message);
      resolve(1);
    });
    child.on("exit", (code) => resolve(code ?? 1));
  });
  results.push({
    command: [command.replace(root, ""), ...args].join(" "),
    exit_code: code,
    seconds: (Date.now() - started) / 1000,
  });
  if (code !== 0) break;
}
await mkdir(`${root}reports/phase6`, { recursive: true });
await writeFile(
  `${root}reports/phase6/checks.json`,
  JSON.stringify({ checked_at: new Date().toISOString(), results }, null, 2) +
    "\n",
);
if (results.some((r) => r.exit_code !== 0)) process.exitCode = 1;
