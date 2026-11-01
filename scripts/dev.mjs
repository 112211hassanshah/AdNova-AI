import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { pythonEnvironment, root } from "./runtime-env.mjs";
if (!existsSync(`${root}.venv/bin/python`)) {
  console.error("Create .venv and install the backend first. See README.md.");
  process.exit(1);
}
const backendEnvironment = pythonEnvironment();
const children = [
  spawn(
    `${root}.venv/bin/python`,
    [
      "-m",
      "uvicorn",
      "ads_optimizer.api:app",
      "--app-dir",
      "backend/src",
      "--host",
      "127.0.0.1",
      "--port",
      "8000",
      "--reload",
      "--reload-dir",
      "backend/src",
    ],
    { cwd: root, stdio: "inherit", env: backendEnvironment },
  ),
  spawn(
    process.execPath,
    [
      `${root}frontend/node_modules/next/dist/bin/next`,
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3000",
    ],
    { cwd: `${root}frontend`, stdio: "inherit" },
  ),
];
let stopping = false;
function stop(code) {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => child.kill("SIGTERM"));
  process.exitCode = code;
}
for (const child of children) {
  child.on("error", (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!stopping) stop(code || 0);
  });
}
process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
