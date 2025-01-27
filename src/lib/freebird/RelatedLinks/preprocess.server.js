// import { env } from "@newsdev/birdkit/vars.js";
// import { log } from "@newsdev/birdkit/utils/logger.js";
import { deriveUri, gql } from "$lib/shared/utils/gql.server.js";
// import { formatDateLanguage } from "$lib/shared/utils/date.js";
import { getBylineAndConnector } from "$lib/shared/utils/bylines.js";

/**
 * @param {Record<string, any>} block
 */
export default async function preprocess(block) {
  const scoopIds = block?.value?.links.map((l) => l.asset);

  const uris = scoopIds.map((id) => [
    deriveUri("article", id),
    deriveUri("interactive", id),
  ]);

  const scoopData = await Promise.all(
    uris.map(async (ids) => {
      const { anyWorks } = await gql(
        `query getScoopRelatedLinks($ids: [ID!]!) {
					anyWorks(ids: $ids) {
						... on Published {
							url
							firstPublished
						}
						... on CreativeWork {
							headline {
								default
							}
							summary
							bylines {
								renderedRepresentation
								prefix
							}
							language {
								code
							}							
						}
						... on HasPromotionalProperties {
							promotionalImage {
								image {
									crops(renditionNames: ["thumbLarge", "articleLarge"]) {
										name
										renditions {
											width
											height
											url
										}
									}
								}
							}
						}						
					}
				}`,
        { ids },
        `${env}-preview`,
      );

      return anyWorks;
    }),
  );

  const links = scoopData.reduce((acc, curr, i) => {
    const d = curr.find((d) => d !== null);
    if (!d) {
      console.log('!d')
      // log(
      //   `Related Links warning: article data can't be found for asset ${scoopIds[i]}. Check if the article was been published to env and the scoop id is correct.`,
      //   "[relatedlinks]",
      // );
    } else {
      const headline = d.headline?.default;
      const byline = d.bylines[0]?.renderedRepresentation?.replace(
        " and ",
        getBylineAndConnector(d.bylines[0]?.prefix),
      );
      const thumbnail = d.promotionalImage?.image?.crops[1]?.renditions[0];
      const thumbnailDesktop =
        d.promotionalImage?.image?.crops[0]?.renditions[0];
      acc.push({
        headline,
        byline,
        summary: d.summary,
        url: d.url,
        // date: formatDateLanguage(d.firstPublished, d.language),
        thumbnail,
        thumbnailDesktop,
      });
    }
    return acc;
  }, []);

  return {
    ...block,
    value: {
      ...block.value,
      links,
    },
  };
}
