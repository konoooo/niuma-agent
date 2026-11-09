import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "docs", "public");

await mkdir(publicDir, { recursive: true });
await Promise.all(
  ["install.sh", "install.ps1"].map(async (name) => {
    const template = await readFile(join(root, "scripts", name), "utf8");
    const rendered = template
      // Website installers resolve /releases/latest at execution time. Release
      // asset packaging separately binds these templates to its release version.
      .replaceAll("@NIUMA_VERSION@", "")
      .replaceAll("@NIUMA_RELEASE_TAG_PREFIX@", "v");
    if (rendered.includes("@NIUMA_")) {
      throw new Error(`Unrendered installer metadata in ${name}`);
    }
    await writeFile(join(publicDir, name), rendered);
  }),
);
await chmod(join(publicDir, "install.sh"), 0o755);
