import { extname, join } from "path";
import { existsSync, readFileSync } from "node:fs";
import { csvParse, tsvParse } from "d3-dsv";

const parsers = { ".csv": csvParse, ".tsv": tsvParse, ".json": JSON.parse };

// TODO: move this to a global and recursive resolver, like `media`
export default async function preprocess(block) {
  const value =
    typeof block.value === "object" ? block.value : { value: block.value };

  if ("data" in value) {
    return {
      type: "error",
      value: {
        message: `The prop name <code>data</code> is reserved for page data. Please give your prop a different name.`,
      },
    };
  }

  // dynamically import data files that are passed in as props
  // e.g. tempData: _assets/temps.csv imports public/_assets/temps.csv

  if (value["preloadData"] === false) return block;

  const data = {};

  for (const key in value) {
    const filename = value[key];

    if (typeof filename !== "string") continue;

    const ext = extname(filename);

    if (!(ext in parsers)) continue;

    const filepath = join(process.cwd(), "public", filename);

    if (!existsSync(filepath)) {
      return {
        type: "error",
        value: {
          message: `Failed to load <code>${filepath}</code>. Does this file exist?`,
        },
      };
    }

    const blob = readFileSync(filepath, "utf8");

    try {
      data[key] = parsers[ext](blob);
    } catch (/** @type {any} */ e) {
      return {
        type: "error",
        value: {
          message: `Failed to parse <code>${filepath}</code>. Is that file doing okay?`,
          stack: e.stack,
        },
      };
    }
  }

  return {
    ...block,
    value: {
      ...value,
      ...data,
    },
  };
}
