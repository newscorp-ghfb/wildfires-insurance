import { v5 as uuidv5 } from "uuid";
// import { init } from "@newsdev/birdkit/px.js";
// import { env } from "@newsdev/birdkit/vars.js";

/**
 * GraphQL / Samizdat client for node
 * @param {string} gqlQuery
 * @param {Record<string, any>=} variables
//  * @param {import ('@newsdev/interactive-scripts/types').SamizdatDataEnv=} dataEnv
 * @returns {Promise<any>}
 */
export async function gql(gqlQuery, variables, dataEnv) {
  // const px = await init();

  const { data } = await px.iss.clients.Samizdat.query({
    dataEnv: dataEnv,
    gqlQuery,
    variables: variables || {},
  });

  return data;
}

/**
 * Generate Samizdat Uri from 15 digit scoopId
 * @param {string} assetType 'image', 'video', etc
 * @param {string} scoopId 15 digit number-like string
 * @returns {string}
 */
export function deriveUri(assetType, scoopId) {
  try {
    const uuid3 = uuidv5("scoop.nyt.net", uuidv5.DNS);
    const uuid2 = uuidv5(assetType, uuid3);
    const uuid1 = uuidv5(scoopId.toString(), uuid2);
    return `nyt://${assetType}/${uuid1}`;
  } catch (e) {
    return "";
  }
}
