import sharp from "sharp";
import { existsSync } from "node:fs";
// import { docs } from "@newsdev/freebird/vars.js";
// import { load } from "@newsdev/birdkit/loaders/index.js";
// import * as logger from "@newsdev/birdkit/utils/logger.js";

import setup from "./setup.js";
import { format, outputImagesPath } from "./config.js";

await setup();

// const downloads = await load({ docs });

// const log = (msg) => logger.log(msg, "[wayfinder]");
// const error = (msg) => logger.error(msg, "[wayfinder]");

const wayfinders = [];

// downloads.docs.forEach((item) => {
//   for (const page in item.data.body) {
//     const wayfinderEntries = item.data.body[page].filter(
//       (entry) => entry.type === "wayfinder",
//     );
//     wayfinderEntries.forEach((entry) => {
//       wayfinders.push({ ...entry, page: page });
//     });
//   }
// });

const hasValue = (key) => {
  return typeof key !== "undefined" && key !== null;
};

// check whether columns and rows are divisible by our img size
const isSizeEvenlyDivisible = (width, height, rows, columns) => {
  return width % columns === 0 && height % rows === 0;
};

// extract image with x y coordinates
// e.g. what do we get for column 2 out of 2 with 960px width?
// left 50% => left 960 * (50 / 100) = 480px
// and row 2 of 2 with 500px height?
// top 50% => top 480 * (50 / 100) = 250px
const extractImageTile = async (image, x, y, rows, columns, width, height) =>
  await image.clone().extract({
    left: Math.round(width * ((x * (100 / columns)) / 100)),
    top: Math.round(height * ((y * (100 / rows)) / 100)),
    width: Math.round((width * (100 / columns)) / 100),
    height: Math.round((height * (100 / rows)) / 100),
  });

// create tiles based on rows and columns from the doc
const createTiles = async (data, version) => {
  const imageId = data.value[`${version}Image`];
  const rows = data.value[`${version}Rows`];
  const columns = data.value[`${version}Columns`];

  if (!existsSync(imageId)) {
    throw new Error(
      `Missing [${version}Image] variable from the Google Doc. Skipping.`,
    );
  }

  if (!hasValue(rows) && hasValue(columns)) {
    throw new Error(
      `Missing [${version}Rows] or [${version}Columns] variable from the Google Doc. Skipping.`,
    );
  }

  const noDir = imageId.split("/");
  const split =
    noDir.length > 0 ? noDir[noDir.length - 1].split(".") : imageId.split(".");
  const name = split[0];

  // log(
  //   `${version} tiles: Creating ${rows * columns} image tiles for ${imageId}...`,
  // );

  // read image dimensions
  const image = sharp(`./${imageId}`);
  const { width, height } = await image.metadata();

  // create small image
  const imageSm = await image
    .clone()
    .resize({ width: Math.round(width * 0.1) });
  const widthSm = Math.round(width * 0.1);
  const heightSm = Math.round(height * 0.1);

  const isSrcImageDivisible = isSizeEvenlyDivisible(
    width,
    height,
    rows,
    columns,
  );
  const isSmallImageDivisible = isSizeEvenlyDivisible(
    widthSm,
    heightSm,
    rows,
    columns,
  );

  if (!isSrcImageDivisible) {
    throw new Error(
      `Source image dimensions are not evenly divisible by the number of rows and columns.`,
    );
  }

  if (!isSmallImageDivisible) {
    throw new Error(
      `Small image dimensions (10% of the original) are not evenly divisible by the number of rows and columns.`,
    );
  }

  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      // extract tiles
      const extracted = await extractImageTile(
        image,
        x,
        y,
        rows,
        columns,
        width,
        height,
      );
      const extractedSmall = await extractImageTile(
        imageSm,
        x,
        y,
        rows,
        columns,
        widthSm,
        heightSm,
      );

      await extracted
        .toFormat(format.extension, { quality: format.options.quality })
        .toFile(
          `${outputImagesPath}/${name}-${version}-${x}-${y}.${format.extension}`,
        );

      await extractedSmall
        .toFormat(format.extension, { quality: format.options.qualitySmall })
        .toFile(
          `${outputImagesPath}/${name}-low-${version}-${x}-${y}.${format.extension}`,
        );
    }
  }

  // create inset with overall image
  await image
    .clone()
    .resize(600, 600, { fit: "inside" })
    .toFormat(format.extension, { quality: format.options.quality })
    .toFile(`${outputImagesPath}/${name}-${version}-inset.${format.extension}`);

  // log(`${version} tiles: Done creating image tiles.`);
};

if (!wayfinders.length) {
  // error("No wayfinder elements found in the Google Doc.");
  // error(
  //   "To learn more check the docs: https://github.com/newsdev/birdkit/blob/main/packages/template-freebird/src/lib/freebird/Wayfinder/README.md",
  // );
  // error(
  //   "And the example project: https://runway.nyt.net/preview/2023-08-11-wayfinder-examples/main/index?screen=desktop.",
  // );
}

try {
  for (let i = 0; i < wayfinders.length; i++) {
    await createTiles(wayfinders[i], "desktop");
    await createTiles(wayfinders[i], "mobile");
  }
} catch (e) {
  // error("Error: " + e.message);
}
