import fs from "node:fs/promises";

try {
  await fs.access(`./ae`);
} catch (e) {
  await fs.mkdir(`./ae`, { recursive: true });
}
