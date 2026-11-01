import { spawn } from "node:child_process";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { chromium } from "../frontend/node_modules/playwright/index.mjs";
import { pythonEnvironment, root } from "./runtime-env.mjs";

// Disposable credentials/data only. This is not a deployed access password.
const password = "fictional-browser-test-password-32-characters";
const data = await mkdtemp(join(tmpdir(), "ads-hosting-"));
const environment = {
  ...pythonEnvironment(),
  ADS_ACCESS_PASSWORD: password,
  ADS_HOSTED: "1",
  ADS_DATA_DIR: data,
  ADS_ALLOWED_ORIGINS: "http://127.0.0.1:3211",
};
const children = [];
let browser;
const checks = [];
function start(command, args, options) {
  const child = spawn(command, args, options);
  child.on("error", (error) => console.error(error.message));
  children.push(child);
}
async function ready(url) {
  for (let i = 0; i < 100; i++) {
    try {
      const response = await fetch(url);
      if (response.status === 200 || response.status === 401) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Service did not start: ${url}`);
}
try {
  start(
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
      "8211",
    ],
    { cwd: root, env: environment, stdio: "ignore" },
  );
  start(
    process.execPath,
    [
      `${root}frontend/node_modules/next/dist/bin/next`,
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3211",
    ],
    {
      cwd: `${root}frontend`,
      env: { ...environment, VERCEL: "1" },
      stdio: "ignore",
    },
  );
  await ready("http://127.0.0.1:8211/api/v1/health");
  await ready("http://127.0.0.1:3211");
  assert.equal((await fetch("http://127.0.0.1:3211")).status, 401);
  assert.equal(
    (await fetch("http://127.0.0.1:8211/api/v1/workspace")).status,
    401,
  );
  checks.push("Anonymous frontend and direct backend access denied");
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_EXECUTABLE,
  });
  const context = await browser.newContext({
    httpCredentials: { username: "owner", password },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3211");
  await page
    .getByRole("heading", { name: "Let’s make your budget count." })
    .waitFor();
  await page.waitForFunction(() => !document.querySelector('[role="alert"]'));
  const state = await page.evaluate(async () => {
    const response = await fetch("/api/v1/workspace");
    return { status: response.status, body: await response.json() };
  });
  assert.equal(state.status, 200);
  assert.equal(state.body.dataset_count, 0);
  checks.push(
    "Authenticated browser reaches backend through production rewrite",
  );
  const write = await page.evaluate(async () => {
    const response = await fetch("/api/v1/workspace/dataset", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataset_id: null }),
    });
    return response.status;
  });
  assert.equal(write, 200);
  checks.push("Same-origin authenticated write accepted through proxy");
  await mkdir(`${root}docs/screenshots`, { recursive: true });
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.screenshot({
      path: `${root}docs/screenshots/hosting-${width}.png`,
      fullPage: true,
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    checks.push(`Authenticated overview fits ${width}px`);
  }
  await writeFile(
    `${root}docs/hosting-browser-results.json`,
    JSON.stringify({ checks }, null, 2) + "\n",
  );
  console.log(checks.join("\n"));
} finally {
  await browser?.close();
  for (const child of children) child.kill("SIGTERM");
}
