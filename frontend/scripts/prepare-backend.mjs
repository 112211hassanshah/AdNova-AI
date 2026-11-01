import { cpSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Bundle the authoritative Python source inside the frontend deployment root.
// This generated copy is ignored by Git and is never a second source of truth.
const generated = fileURLToPath(new URL("../.backend/", import.meta.url));
rmSync(generated, { recursive: true, force: true });
mkdirSync(generated, { recursive: true });
cpSync(new URL("../../backend/src/", import.meta.url), `${generated}/src`, {
  recursive: true,
  filter: (source) =>
    !source.includes("__pycache__") && !source.endsWith(".pyc"),
});
