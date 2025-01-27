// import { init } from "@newsdev/birdkit/px.js";
// import { env } from "@newsdev/birdkit/vars.js";
import { deriveUri } from "$lib/shared/utils/gql.server.js";

import { preprocess as preprocessFB } from "$lib/preprocess.server.js";

// import { load as archieml } from "@newsdev/interactive-scripts/archieml.js";

import { allArticleFields as gqlQuery } from "./queries.js";

const processScoopArticle = async (
  /** @type {{ value: { asset: String; }; }} */ item,
) => {
  const id = item.value.asset;
  // const px = await init();

  const { data } = await px.iss.clients.Samizdat.query({
    // dataEnv: `${env}-preview`,
    gqlQuery,
    variables: { id: deriveUri("article", id) },
  });

  let article = {
    slug: data.article.slug,
    sourceId: data.article.sourceId,
    headline: data.article.headline,
    summary: data.article.summary,
    credits: data.article.credits,
  };

  const parsedBody = data.article.sprinkled.body?.content
    .map((block) => {
      if (block["__typename"] === "ParagraphBlock") {
        return {
          type: "text",
          value: formatText(block.content),
        };
      }

      if (
        block["__typename"] === "LabelBlock" ||
        block["__typename"] === "DetailBlock"
      ) {
        return {
          type: "text",
          value: formatText(block.content),
          className: `g-${block["__typename"].toLowerCase()}`,
        };
      }

      if (block["__typename"].includes("Heading")) {
        return {
          type: "subhed",
          value: formatText(block.content),
          className: `g-${block["__typename"].toLowerCase()} g-align-${block[
            "textAlign"
          ].toLowerCase()}`,
        };
      }

      if (block["__typename"] === "ImageBlock") {
        let width;
        switch (block.size) {
          case "SMALL":
            width = "300";
            break;
          case "LARGE":
            width = "wide";
            break;
          case "FULL":
            width = "full";
            break;
          default:
            width = "body";
        }
        return {
          type: "image",
          value: {
            media: block.media?.sourceId,
            maxWidth: width,
            marginInline: false,
          },
        };
      }

      if (block["__typename"] === "SlideshowBlock") {
        let width;
        switch (block.size) {
          case "LARGE":
            width = "wide";
            break;
          default:
            width = "body";
        }
        return {
          type: "scoopslideshow",
          value: {
            media: block.media?.sourceId,
            maxWidth: width,
            marginInline: false,
          },
        };
      }

      if (block["__typename"] === "VideoBlock") {
        return {
          type: "video",
          value: {
            media: block.media?.sourceId,
            controls: block?.hideControls,
            muted: block?.muted,
            loop: block?.looping,
            autoplay: block?.autoplay,
          },
        };
      }

      if (block["__typename"] === "AudioBlock") {
        return {
          type: "audio",
          value: {
            hed: block.media?.headline?.default,
            leadin: block.media?.summary,
            media: block.media?.sourceId,
          },
        };
      }

      if (block["__typename"] === "InteractiveBlock") {
        return {
          type: "embed",
          value: {
            media: block.media?.sourceId,
          },
        };
      }

      if (block["__typename"] === "UnstructuredBlock") {
        if (block.dataType === "ExperimentalBlock_AdHint")
          return { type: "ad" };

        const d = JSON.parse(block.data);
        // const parsed = archieml(d.aml);
        const type = Object.keys(parsed)[0];
        return {
          type,
          value: parsed[type],
        };
      }

      if (block["__typename"] === "RelatedLinksBlock") {
        // we don't support extended display on birdkit yet
        const display =
          block.displayStyle === "COMPACT" ? "compact" : "standard";

        return {
          type: "relatedlinks",
          value: {
            hed: formatText(block.title),
            leadin: formatText(block.description),
            display: display,
            hideFields: "",
            links: block.related?.map((d) => ({ asset: d.sourceId })),
          },
        };
      }
    })
    .filter(Boolean);

  article.body = await preprocessFB({ body: parsedBody });

  return article;
};

/**
 * @param {any} block
 * @returns
 */
export default async function preprocessArticle(block) {
  return {
    ...block,
    value: {
      ...block.value,
      ...(await processScoopArticle(block)),
    },
  };
}

const formatText = (content) =>
  content.map((elem) => tagConverter(elem)).join("");

function tagConverter(elem) {
  const formats = elem.formats
    .map(function (format) {
      return format["__typename"];
    })
    .join();

  let url = elem.formats.find((f) => f["__typename"] === "LinkFormat");
  if (url) url = url["url"];

  switch (formats) {
    case "LinkFormat":
      return `<a href="${url}">${elem.text}</a>`;
    case "LinkFormat,BoldFormat":
      return `<strong><a href="${url}">${elem.text}</a></strong>`;
    case "LinkFormat,ItalicFormat":
      return `<em><a href="${url}">${elem.text}</a></em>`;
    case "ItalicFormat,LinkFormat":
      return `<em><a href="${url}">${elem.text}</a></em>`;
    case "LinkFormat,ItalicFormat,BoldFormat":
      return `<em><strong><a href="${url}">${elem.text}</a></strong></em>`;
    case "ItalicFormat":
      return "<em>" + elem.text + "</em>";
    case "BoldFormat":
      return "<strong>" + elem.text + "</strong>";
    case "ItalicFormat,BoldFormat":
      return "<em><strong>" + elem.text + "</strong></em>";
    case "BoldFormat,LinkFormat":
      return `<em><a href="${url}">${elem.text}</a></em>`;
    case "BoldFormat,ItalicFormat,LinkFormat":
      return `<em><strong><a href="${url}">${elem.text}</a></strong></em>`;
    case "LinkFormat,BoldFormat,ItalicFormat":
      return `<em><strong><a href="${url}">${elem.text}</a></strong></em>`;
    case "ItalicFormat,LinkFormat,bold":
      return `<em><strong><a href="${url}">${elem.text}</a></strong></em>`;
    case "BoldFormat,LinkFormat,ItalicFormat":
      return `<em><strong><a href="${url}">${elem.text}</a></strong></em>`;

    default:
      return elem.text;
  }
}
