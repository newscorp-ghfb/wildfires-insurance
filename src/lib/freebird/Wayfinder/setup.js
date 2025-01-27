import fs from "node:fs/promises";
import { outputPath, outputImagesPath } from "./config.js";

export default async () => {
  try {
    await fs.access(`${outputImagesPath}`);
  } catch (e) {
    await fs.mkdir(`${outputImagesPath}`, { recursive: true });
  }

  try {
    await fs.access(`${outputPath}/symbols`);
  } catch (e) {
    await fs.mkdir(`${outputPath}/symbols`, { recursive: true });
  }

  try {
    await fs.access(`${outputPath}/json`);
  } catch (e) {
    await fs.mkdir(`${outputPath}/json`, { recursive: true });
  }
};


