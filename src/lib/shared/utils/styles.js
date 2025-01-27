/**
 * Regular expression to match one on more digits followed
 * by one of px, vw or %. For example, this regex would evaluate
 * to true for: '1600px', '100vw' and '36%'
 */
export const supportedWidthUnitsRe = /^\d+(?:px|vw|%)$/;

/**
 * Regular expression to match one on more digits followed
 * by one of px, vh or %. For example, this regex would evaluate
 * to true for: '1600px', '100vh' and '36%'
 */
export const supportedHeightUnitsRe = /^\d+(?:px|vh|%)$/;

/**
 * Given a number or number-like string (like from an ArchieML width setting)
 * return inline style rule. If needed, appending implied 'px'.
 *
 *
 * Examples:
 *  600 -> '600px'
 * '620' -> '620px'
 * '1050px' -> '1050px'
 * '80vw' -> '80vw'
 * '100vh' -> '100vh'
 *
 * @param {any|string|number} dimension
 * @return {string} value with unit
 */
const dimensionToStyle = (dimension, type = "width") => {
  const supportedUnitsRe =
    type === "height" ? supportedHeightUnitsRe : supportedWidthUnitsRe;
  let styleRule = "";

  // if just a number, it's an implied px:
  // ex: 1024
  if (typeof dimension === "number") {
    styleRule = `${dimension}px`;
  } else if (typeof dimension === "string") {
    dimension = dimension.trim();
    // if: check for digit plus unit. ex: '600px'
    // else: check for just digit, which is implied pixel: ex: '600'
    if (supportedUnitsRe.test(dimension)) {
      styleRule = `${dimension}`;
    } else if (/^\d+$/.test(dimension)) {
      styleRule = `${dimension}px`;
    }
  }

  return styleRule;
};

/**
 * Given a number or number-like string (like from an ArchieML width setting)
 * return inline style rule. If needed, appending implied 'px'.
 *
 * Ignore named widths.
 *
 * Examples:
 * 600 -> '600px'
 * '620' -> '620px'
 * '1050px' -> '1050px'
 * '80vw' -> '80vw'
 *
 * @param {string|number} width
 * @return {string} value with unit
 */
export const widthToStyle = (width) => {
  return dimensionToStyle(width, "width");
};

/**
 * Given a number or number-like string (like from an ArchieML width setting)
 * return inline style rule. If needed, appending implied 'px'.
 * *
 * Examples:
 * 600 -> '600px'
 * '620' -> '620px'
 * '1050px' -> '1050px'
 * '80vh' -> '80vh'
 *
 * @param {string|number} height
 * @return {string} value with unit
 */
export const heightToStyle = (height) => {
  return dimensionToStyle(height, "height");
};

/**
 * Given a logical margin (block or inline) looking string (with implied px values
 * for unit-less values) or a number, return a valid margin-line
 * value, complete with units. Ignore other input types. If
 * an invalid value is part of the string, just that value
 * will be skipped.
 *
 * Examples:
 * 30 -> '30px'
 * '30px' -> '30px'
 * '10vw 30' -> '10vw 30px'
 * 'true' -> '',
 * true -> '',
 * false -> '',
 *
 * @param {any} margin
 * @param {string} type 'width' or 'height'
 * @return {string} value with unit
 */
export const logicalMarginToStyle = (margin, type = "width") => {
  const dimensionToStyleCb = type === "height" ? heightToStyle : widthToStyle;
  let styleRule = "";

  // cast a unit-less number to string. It'll be treated as a pixel value
  if (typeof margin === "number") {
    margin = `${margin}`;
  }

  // ignore non-strings
  if (typeof margin === "string") {
    // Look for space delimited values, filter to
    // just two since margin-block/inline only accept two,
    // verify units or apply pixels to unit-less, and convert
    // back to a value margin-line string
    // '10vw 20' -> ['10vw', '20px'] -> '10vh 20px';
    styleRule = margin
      .trim()
      .split(" ")
      .filter((s, i) => i < 2) // only two
      .map(dimensionToStyleCb) // '10' -> `10px`, etc
      .join(" "); // rejoin as a string
  }

  return styleRule;
};

/**
 * Given a margin-inline looking string (with implied px values
 * for unit-less values) or a number, return a valid margin-line
 * value, complete with units. Ignore other input types. If
 * an invalid value is part of the string, just that value
 * will be skipped.
 *
 * Examples:
 * 30 -> '30px'
 * '30px' -> '30px'
 * '10vw 30' -> '10vw 30px'
 * 'true' -> '',
 * true -> '',
 * false -> '',
 *
 * @param {any} marginInline
 * @return {string} value with unit
 */
export const marginInlineToStyle = (marginInline) => {
  return logicalMarginToStyle(marginInline, "width");
};

/**
 * Given a margin-block looking string (with implied px values
 * for unit-less values) or a number, return a valid margin-block
 * value, complete with units. Ignore other input types. If
 * an invalid value is part of the string, just that value
 * will be skipped.
 *
 * Examples:
 * 30 -> '30px'
 * '30px' -> '30px'
 * '10vh 30' -> '10vh 30px'
 * 'true' -> '',
 * true -> '',
 * 'true 30' -> '30px'
 *
 * @param {any} marginBlock
 * @return {string} value with unit
 */
export const marginBlockToStyle = (marginBlock) => {
  return logicalMarginToStyle(marginBlock, "height");
};

/**
 * Given an object literal with CSS property names, return a
 * stringified version.
 *
 * From:
 *
 * { '--g-height': '30px', 'margin-left': '10px', marginRight: '10px' }
 *
 * to:
 *
 * "--g-height: 30px; margin-left: 10px; margin-right: 10px"
 *
 * @param {object}  obj
 * @return {string} stringified object as CSS
 */
export const objectToCss = (obj) => {
  return Object.entries(obj)
    .map(([k, v]) => {
      // convert marginRight -> margin-right
      k = k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
      return `${k}:${v}`;
    })
    .join(";");
};

/**
 * Replicates object-fit math for use with any elements.
 * Assumes object-position of 50%, 50%.
 * See: cover() and container()
 *
 * From:
 * intrinsic-scale
 * https://github.com/bfred-it/intrinsic-scale
 * MIT
 * @param {boolean} contains
 */
const fit = function (contains = true) {
  /**
   * @param {number} parentWidth
   * @param {number} parentHeight
   * @param {number} childWidth
   * @param {number} childHeight
   */
  return (parentWidth, parentHeight, childWidth, childHeight) => {
    const doRatio = childWidth / childHeight;
    const cRatio = parentWidth / parentHeight;
    let width = parentWidth;
    let height = parentHeight;

    if (contains ? doRatio > cRatio : doRatio < cRatio) {
      height = width / doRatio;
    } else {
      width = height * doRatio;
    }

    return {
      width,
      height,
      x: (parentWidth - width) / 2,
      y: (parentHeight - height) / 2,
    };
  };
};

/**
 * Get width, height, x and y needed to modify
 * an existing element to cover a parent element.
 * Emulates `object-fit: cover` with any element.
 */
export const cover = fit(false);

/**
 * Get width, height, x and y needed to modify
 * an existing element to be container within
 * a parent element.
 * Emulates `object-fit: contain` with any element.
 */
export const contain = fit(true);
