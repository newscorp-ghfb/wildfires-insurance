/**
 * Given a byline prefix, get a localised 'and' connector
 * only available for Spanish and English
 * Ex.: By -> and
 * Ex.: Por -> y
 * @param {string} prefix
 */
export const getBylineAndConnector = (prefix) => {
  const spanishPrefixes = ["Por", "Fotografías por"];
  return spanishPrefixes.includes(prefix) ? " y " : " and ";
};
