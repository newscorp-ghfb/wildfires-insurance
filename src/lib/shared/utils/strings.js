/**
 * Given a string, strip any HTML tags
 *
 * @param {string} value
 */

export const stripHtmlTags = (value) => {
  if (typeof value === "string") {
    value = value.replace(/(<([^>]+)>)/gi, "");
  }
  return value;
};

/**
 * Given a string, return lowercased version
 * @param {string} value
 * @returns {string}
 */
export const lowercase = (value) => {
  if (typeof value === "string") {
    value = value.toLowerCase();
  }

  return value;
};
