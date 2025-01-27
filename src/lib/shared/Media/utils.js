// @ts-ignore: Object is possibly 'null'.

import { getBaseItem } from "$lib/shared/steppers/index.js";
import { sortBy } from "$lib/shared/utils/utilities.js";

/**
 *  * Given Scoop audio mediaObj, return just the renditions.

 * @param {import('./index').ScoopAudioObject} mediaObj 
 * @returns 
 */
export const getScoopAudioUrl = (mediaObj) => {
  return mediaObj.fileUrl;
};

/**
 * Given Scoop Image mediaObj, return just the renditions for desired crop/s.
 *
 * @param {import('./index').ScoopImageObject} mediaObj
 * @param { string | string[]} cropName single desired crop name, space-delimited crop names or an array of crop names
 * @returns {import('./index').MediaRenditions}
 */
export const getScoopImageRenditions = (mediaObj, cropName = "MASTER") => {
  let renditions = [];
  // generate an array of lowercase names of crops to find
  let cropsToFind = Array.isArray(cropName)
    ? cropName
    : [...cropName.trim().split(" ")];
  cropsToFind = cropsToFind.map((s) => s.toLowerCase().trim());

  // add crops in mediaObject to `renditions` whose name belongs in our target `cropsToFind` array
  mediaObj?.crops
    .filter((/** @type {{ name: string; }} */ crop) =>
      cropsToFind.includes(crop?.name.toLowerCase()),
    )
    .forEach((crop) => {
      const cropName = crop.name;
      crop.renditions.forEach((rendition) => {
        renditions.push({
          ...rendition,
          cropName,
        });
      });
    });

  return renditions;
};

/**
 *
 * @param {import('./index').LocalVideoObject} mediaObj
 * @returns
 */
export const getLocalVideoUrl = (mediaObj) => {
  return mediaObj.url;
};

/**
 *
 * @param {import('./index').LocalImageObject} mediaObj
 * @returns
 */
export const getLocalImageUrl = (mediaObj) => {
  return mediaObj.url;
};

/**
 * Given responsive local image mediaObj, return just the renditions.
 *
 * @param {import('./index').LocalResponsiveImageObject} mediaObj
 * @returns {import('./index').MediaRenditions}
 */
export const getLocalResponsiveImageRenditions = (mediaObj) => {
  const { outputPath, slug, ratio, hasRetina, extensions } = mediaObj;
  const renditions = [];
  mediaObj.widths.forEach((width) => {
    extensions.forEach((extension) => {
      const rendition = {
        // url: `${outputPath}/${getResizedImageFilename({ slug, width, extension, retina: false })}`,
        height: Math.round(width * (1 / ratio)),
        width,
      };

      if (hasRetina) {
        rendition.retinaUrl = `${outputPath}/${getResizedImageFilename({
          slug,
          width,
          extension,
          retina: true,
        })}`;
      }

      renditions.push(rendition);
    });
  });
  return renditions;
};

/**
 * Given Scoop Video json mediaObj, return video renditions. Defaults to non-mobile.
 *
 * @param {import('./index').ScoopVideoObject} mediaObj
 * @returns {import('./index').MediaRenditions}
 */
export const getScoopVideoRenditions = (
  mediaObj,
  { mobileRendition = false } = { mobileRendition: false },
) => {
  return mediaObj.renditions
    .filter((/** @type {{ type: any; }} */ video) => {
      if (mobileRendition) {
        return video.type.includes("p_mp4_mobile");
      } else {
        return (
          video.type.includes("p_mp4") && !video.type.includes("p_mp4_mobile")
        );
      }
    })
    .sort(sortBy("width"));
};

/**
 * Given Scoop Video json mediaObj, return poster renditions.
 *
 * @param {import('./index').ScoopVideoObject} mediaObj
 * @returns {import('./index').MediaRenditions}
 */
export const getScoopVideoPosters = (mediaObj) => {
  if (mediaObj?.promotionalImage?.image) {
    return getScoopImageRenditions(mediaObj.promotionalImage.image);
  } else {
    return [];
  }
};

/**
 * @typedef {Object} getVideotapeRenditionsOptions
 * @property {number[]=} options.widths Array of available video tape renditions
 * @property {number=} options.aspectRatio width/height aspect ratio of available renditions
 */

/**
 * Given a VideoTape mediaObj, generate rendition array from available widths
 * @param {import('./index').VideoTapeObject} mediaObj
 * @param {getVideotapeRenditionsOptions} options
 * @returns {import('./index').MediaRenditions}
 */
export const getVideotapeRenditions = (
  mediaObj,
  { widths = [320, 640, 900, 1254], aspectRatio = 16 / 9 } = {},
) => {
  const renditions = [];

  /**
   * Regular expression to extract just the width string from the url, so
   * we can easily replace it.
   * from: https://int.nyt.com/data/videotape/finished/2022/10/mideast-heat/mideast_006-900w.mp4
   * to: 900w
   */
  const extractSizeFromUrlRe =
    /https:\/\/int.nyt.com\/data\/videotape\/finished\/.+\/[\w,-]+-(\d+w).(?:mp4|webm)/;

  if (extractSizeFromUrlRe.test(mediaObj.assetSlug)) {
    const numToReplace = extractSizeFromUrlRe.exec(mediaObj.assetSlug);
    if (Array.isArray(numToReplace)) {
      const numToReplaceStr = numToReplace[1];
      widths.forEach((width) => {
        renditions.push({
          width,
          height: Math.round((width * 1) / aspectRatio),
          url: mediaObj.assetSlug.replace(numToReplaceStr, `${width}w`),
        });
      });
    }
  } else {
    renditions.push({
      url: mediaObj.assetSlug,
      width: 0,
      height: 0,
    });
  }
  return renditions;
};

/**
 * Given a VideoTape mediaObj, return poster image renditions.
 *
 * @param {import('./index').VideoTapeObject} mediaObj
 * @returns {import('./index').MediaRenditions}
 */
export const getVideotapePosters = (mediaObj) => {
  return getVideotapeRenditions(mediaObj).map((r) => {
    r.url = r.url.replace(".mp4", ".jpg").replace(".webm", ".jpg");
    return r;
  });
};

/**
 * Find the best sized media rendition, opting for larger over smaller
 * @param  {import('./index').MediaRendition[]} renditions
 * @param  {number} targetWidth
 * @returns {import('./index').MediaRendition}
 */

export const getBestFitRendition = (renditions, targetWidth = 320) => {
  // sort smallest to largest
  const sorted = renditions.concat().sort(sortBy("width"));

  // default to largest
  let selectedIndex = sorted.length - 1;

  // find best fit
  let index = sorted.length;
  while (index--) {
    if (targetWidth <= sorted[index].width) {
      selectedIndex = index;
    }
  }

  return sorted[selectedIndex];
};

/**
 * Transform Scoop Slideshow JSON into <Slideshow> Stepper-compatible props.
 * (as if it has been processed with freebird/archieml/index.js resolveMedia)
 *
 * @param {import('./index').ScoopSlideShowObject} mediaObj
 * @return {{ id: string, items:  import('../Slideshow').SlideshowItem[] } }}
 */
export const processScoopSlideshow = (mediaObj) => {
  /** @type string */
  const id = mediaObj.assetSlug;

  const slideshow = {
    id,
    /** @type {import('../Slideshow').SlideshowItem[] } */
    items: mediaObj.slides.map((slide, /** @type {number} */ index) => {
      const { image } = slide;
      const { caption: captionObj, credit } = image;
      return Object.assign({}, getBaseItem(id, index), {
        caption: captionObj.text,
        credit,
        media: Object.assign(
          {
            assetType: "scoopImage",
            assetSlug: id,
            mediaComponent: "ImageLoader",
            assetErrors: [],
          },
          slide.image,
        ),
      });
    }),
  };

  return slideshow;
};

/**
 * Given an unknown word string, return it prefaced with either 'a' or 'an'.
 * @param word
 */
export const aOrAn = (word = "") => {
  const vowels = ["a", "e", "i", "o", "u"];
  const isVowel = vowels.includes(word.charAt(0).toLowerCase());
  return `${isVowel ? "an" : "a"} ${word}`;
};
