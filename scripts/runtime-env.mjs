import { existsSync, readdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("../", import.meta.url));

export function pythonEnvironment() {
  const environment = { ...process.env };
  const libraries = `${root}.venv/lib`;
  if (process.platform === "darwin" && existsSync(libraries)) {
    const openMP = readdirSync(libraries)
      .map(
        (version) =>
          `${libraries}/${version}/site-packages/sklearn/.dylibs/libomp.dylib`,
      )
      .find(existsSync);
    if (openMP) {
      environment.DYLD_LIBRARY_PATH = [
        dirname(openMP),
        environment.DYLD_LIBRARY_PATH,
      ]
        .filter(Boolean)
        .join(":");
    }
  }
  return environment;
}
