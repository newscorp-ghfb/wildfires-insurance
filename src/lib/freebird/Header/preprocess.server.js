import { deriveUri, gql } from "$lib/shared/utils/gql.server.js";
// import { formatYYYYMMDD, formatDateLanguage } from "$lib/shared/utils/date.js";
// import { env } from "@newsdev/birdkit/vars.js";

/**
 * @param {Record<string, any>} block
 */
export default async function preprocess(block, { asset, body }) {
  const uri = asset?.payload?.publicationProperties?.uri;
  const scoopId = asset?.payload?.publicationProperties?.sourceId;
  const id =
    uri || deriveUri(asset?.payload?.publicationProperties?.type, scoopId);
  const scoopData = id ? await getScoopHeader(id) : null;

  const tz = "America/New_York";
  const language = scoopData?.language || { code: "en" };

  const pubDate =
    scoopData?.firstPublished ||
    asset?.payload?.publicationProperties?.firstPublished ||
    new Date().toISOString().slice(0, 10);

  const hideBylineAndTimestamp = body
    ?.map((d) => d.type)
    .includes("extendedbyline");

  return {
    ...block,
    value: {
      ...block.value,
      headline: asset?.payload?.creativeWork?.headline?.default,
      leadin: asset?.payload?.leadin,
      // bylines must be set in scoop.
      bylines: scoopData?.bylines || [],
      // firstPublished: formatDateLanguage(pubDate, language, tz),
      updatedText: asset?.payload?.updatedText,
      // dateTime: formatYYYYMMDD(pubDate, tz),
      language,
      // translations must be set in scoop.
      translations: scoopData?.translations || [],
      hideBylineAndTimestamp,
    },
  };
}

export async function getScoopHeader(id) {
  const { anyWork } = await gql(
    `query getFreebirdHeaderData($id: String!) {
			anyWork(id: $id) {
				... on CreativeWork {
					bylines {
						prefix
						creatorSnapshots {
							... on PersonSnapshot {
								displayName
								bioUrl
							}
						}
					}
					language {
						code
					}
				}
				... on Published {
					firstPublished
				}
				... on Interactive {
					translations {
						url
						language {
							code
						}
						linkText
						translatedLinkText
					}
				}
			}
		}`,
    { id },
    // `${env}-preview`,
  );

  return anyWork;
}
