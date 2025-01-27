import { gql, deriveUri } from "$lib/shared/utils/gql.server.js";

const query = `query FreebirdMedia($IDS: [ID!]!) {
  anyWorks(ids: $IDS) {
    __typename
    ... on Published {
      sourceId
      url
      uri
      lastModified
      lastMajorModification
    }
    ... on CreativeWork {
      headline {
        default
      }
      bylines {
        ...Bylines
      }
    }
    ... on Image {
      ...Image
    }
    ... on Video {
      ...Video
    }
    ... on Audio {
      ...Audio
    }
    ... on EmbeddedInteractive {
      ...EmbeddedInteractive
    }
    ... on Slideshow {
      ...Slideshow
    }
  }
}

fragment Bylines on Byline {
  renderedRepresentation
  prefix
  creators {
    ... on Person {
      displayName
      givenName
      familyName
      url
      uri
      bioUrl
      honorificSuffix
      honorificPrefix
      description
      promotionalMedia {
        ... on Image {
          crops(cropNames: [MASTER], renditionNames: ["master315", "jumbo"]) {
            renditions {
              name
              width
              height
              url
            }
          }
        }
      }
    }
  }
}

fragment Slideshow on Slideshow {
  summary
  slides {
    url
    slug
    caption {
      text
    }
    image {
      ...Image
    }
  }
  promotionalImage {
    image {
      ...Image
    }
  }
}

fragment EmbeddedInteractive on EmbeddedInteractive {
  credit
  summary
  leadin
  html
  css
  js
  promotionalImage {
    image {
      ...Image
    }
  }
}

fragment Audio on Audio {
  credit
  summary
  length
  podcastSeries {
    name
  }
  fileUrl
  fileName
  promotionalImage {
    image {
      ...Image
    }
  }
  transcript {
    transcriptFragment {
      text
      speaker
      timecode {
        start
        end
      }
    }
  }
}

fragment Video on Video {
  summary
  renditions {
    width
    height
    url
    type
    bitrate
    aspectRatio
    fileSize
  }
  promotionalImage {
    image {
      ...Image
    }
  }
}

fragment Image on Image {
  type
  caption {
    text
  }
  altText
  credit
  summary
  original {
    width
    height
  }
  imageType
  crops(
    renditionNames: [
      "articleLarge"
      "jumbo"
      "superJumbo"
      "facebookJumbo"
      "videoSixteenByNine600"
      "mobileMasterAt3x"
    ]
  ) {
    name
    box {
      y2
      y1
      x2
      x1
    }
    bleed {
      percentTop
      percentRight
      percentLeft
      percentBottom
    }
    renditions {
      width
      url
      name
      height
    }
  }
}
`;

const mediaTypes = [
  "embeddedinteractive",
  "audio",
  "image",
  "video",
  "slideshow",
];

/**
 * Given a 15 digit media scoopId, return metadata for
 * the 'image', 'video', 'interactive', etc.
 *
 * @param {string} scoopId
 * @returns {Promise<any>}
 */
export async function getScoopMedia(scoopId) {
  let asset;

  // Construct a query that looks for all possible media
  // types for the given scoopId, using derived Samizdat URLs like:
  // 'nyt://image/derivedUrl', 'nyt://video/derivedUrl', etc.
  const queryVars = {
    IDS: mediaTypes.map((type) => deriveUri(type, scoopId)),
  };

  // The resulting query, if the scoopId is valid, will return an array
  // of all the results per media type, with only one valid object:
  // {
  // 	anyWorks: [
  // 		null,
  // 		null,
  // 		null,
  // 		{
  // 			__typename: 'Image',
  // 			sourceId: '100000007076663',
  // 			lastModified: '2023-02-03T20:33:12.843Z',
  // 			lastMajorModification: '2023-02-03T20:33:12.843Z'
  // 		},
  // 		null,
  // 		null
  // 	]
  // }

  const response = await gql(query, queryVars);

  if (response?.anyWorks) {
    asset = response.anyWorks.find((/** @type object[] */ d) => !!d);
  }

  return asset;
}

/**
 * Given a 15 digit media scoopId, return the media
 * type like 'image', 'video', 'interactive', etc.
 *
 * @param {string} scoopId
 * @returns {Promise<string>}
 */
export async function getScoopMediaType(scoopId) {
  let type = "";

  const asset = await getScoopMedia(scoopId);

  if (asset?.__typename) {
    type = asset.__typename;
  }

  return type;
}
