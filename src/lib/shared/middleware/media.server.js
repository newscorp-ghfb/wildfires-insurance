import { getScoopMedia } from './scoop.server.js';
// import {
//   inputImagePathToFileName,
//   inputImagePathToSlug,
//   getExtension,
//   getImageSize,
//   commaList,
//   getBaseImageSizerOptions
// } from '@newsdev/freebird/images/utils.server.js';
import { stripHtmlTags } from '$lib/shared/utils/strings.js';
import { breakpointAndPropRe } from '$lib/shared/utils/breakpoints.js';
import { AssetTypeToComponentMapping, AvailableAssetTypesSet } from '$lib/shared/Media/constants';
// import { imageTaskConfig } from 'virtual:freebird-images';
// import { fileExists, readFileSync } from 'node';


const fileExists = async (filePath) => {
  try {
    const response = await fetch(filePath);
    return response.ok;
  } catch (error) {
    console.error(`Error checking file existence for ${filePath}:`, error);
    return false;
  }
};

const readFileAsync = async (filePath) => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to read file ${filePath}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
};


/**
 * Regex to find and extract the 15 number-like pattern of a Scoop Id.
 * 100000007076663 -> 100000007076663
 */
const scoopIdRe = /^(\d{15})$/;

/**
 * Regex to verify and extract the filename of a VideoTape mp4/webm url
 * from:
 * https://int.nyt.com/data/videotape/finished/2022/10/mideast-heat/mideast_006-1254w.mp4
 * to:
 * mideast_006-1254w
 */
const videoTapeRe = /videotape\/finished\/.+\/([\w,-]+).(?:mp4|webm)/;

/**
 * Regex to verify local video is in public/_assets, or
 * a subfolder within. Returns that verified path.
 *
 * from:
 * _assets/cat.mp4
 * to:
 * _assets/cat.mp4
 *
 * */
const localVideoPathRe = /^(_assets\/[\w,\-,/]+\.(?:mp4|webm){1})+$/;

/**
 * Regex to verify local image is in public/_assets, or
 * a subfolder within. Returns that verified path.
 *
 * from:
 * _assets/cat.jpg
 * to:
 * _assets/cat.jpg
 *
 * */
const localImagePathRe =
  /^((?:_assets|_big_assets){1}\/[\w,\-,/]+\.(?:jpg|png|webp|svg|gif|jpeg){1})+$/;

/**
 * Regex to verify local image is in public/_images, which
 * is Freebird's clue to make it responsive with local renditions.
 *
 * from:
 * _images/cat.jpg
 * to:
 * _images/cat.jpg
 *
 * */
const localResponsiveImagePathRe = /^(_images\/[\w,\-,/]+\.(?:jpg|png|webp|jpeg){1})+$/;

/**
 * Path to html snippets
 */
const graphicsFilePath = '_assets';

/**
 * Check if a string matches the 15 number-like pattern of a Scoop Id.
 * @param {string} scoopId
 */
const isScoopId = (scoopId) => scoopIdRe.test(scoopId);

/**
 * Check if string matches the URL pattern of a VideoTape asset
 * @param {string} url
 * @returns boolean
 */
const isVideoTape = (url) => videoTapeRe.test(url);

const localFileExists = (filePath) => {
  return fileExists(`${filePath}`);
};

const localImageFileIsValid = (filePath) => {
  let validImage = false;
  const exists = localFileExists(filePath);
  if (exists) {
    try {
      // getImageSize(`public/${filePath}`);
      validImage = true;
    } catch (error) {
      console.log(`Image ${filePath} appears corrupt`);
    }
  }

  return validImage;
};

/**
 * Check if string matches an available image in the public/_assets folder
 * @param {string} filePath
 * @returns boolean
 */
const isLocalVideo = (filePath) => {
  return localVideoPathRe.test(filePath) && localFileExists(filePath);
};

/**
 * Check if string matches an available image in the public/_assets folder
 * @param {string} filePath
 * @returns boolean
 */
const isLocalImage = (filePath) => {
  return localImagePathRe.test(filePath) && localImageFileIsValid(filePath);
};

/**
 * Check if string matches an available image in the public/_images folder
 * @param {string} filePath
 * @returns boolean
 */
const isResponsiveLocalImage = (filePath) => {
  return localResponsiveImagePathRe.test(filePath) && localImageFileIsValid(filePath);
};

/**
 * Determine if the URL is a valid, non-local url.
 * @param {string} url
 * @returns boolean
 */
const isRemoteImage = (url) => {
  try {
    // throw error and return false if malformed URL
    new URL(url);

    // very crude regex to ensure string starts with https
    // and ends when an image format
    return /^https:\/\/\S+(?:jpg|png|webp|svg|gif|jpeg){1}$/.test(url);
  } catch (error) {
    return false;
  }
};

/**
 * Determine if the URL is a valid, non-local mp3.
 * @param {string} url
 * @returns boolean
 */
const isRemoteMp3 = (url) => {
  try {
    // throw error and return false if malformed URL
    new URL(url);

    // very crude regex to ensure string starts with https
    // and ends when an image format
    return /^https:\/\/\S+(?:mp3){1}$/.test(url);
  } catch (error) {
    return false;
  }
};

/**
 * Check if a string fileName matches an available html fragment in src/lib/graphics folder.
 * @param {string} fileName
 * @returns boolean
 */
const isGraphicFragment = (fileName) => {
  const filePath = `${graphicsFilePath}/${fileName}`;
  return fileName.includes('.html') && fileExists(filePath);
};

/**
 * @typedef archiemlObj
 * @property Record<string,any>
 */

/**
 * Given a top-level ArchieML props oject, like the JSON version of this:
 * {.video}
 *   hed: My video
 *   media: 100000007076585
 * {}
 *
 * loop through all the property names for `targetProp`, replacing
 * the value with the returned value from `callback`.
 *
 * Returns a Promise so that the callback can perform  async tasks.
 *
 * @param {archiemlObj} archiemlObj
 * @param {string} targetProp
 * @param {function} callback
 * @property {boolean} options.recursive
 * @returns {Promise<archiemlObj[]>}
 */
export async function updateArchiemlProp(
  archiemlObj,
  targetProp,
  callback,
  { recursive = false } = {}
) {
  // running list of callback promises
  /** @type {Promise<archiemlObj>[]} */
  const taskPromises = [];

  const searchObject = async (/** @type Record<string,any> */ obj) => {
    const objEntries = Object.entries(obj);

    for (let index = 0; index < objEntries.length; index++) {
      const [propName, value] = objEntries[index];

      // Determine if given propName has the pattern of a breakpoint override
      // example:
      // hed -> baseProp: undefined, breakpoint: undefined
      // hed-desktop => baseProp: hed, breakpoint:desktop
      const [, baseProp, breakpointName] = breakpointAndPropRe.exec(propName) || [];

      // If given a true base prop, like 'hed', use that. If given a
      // value like `hed-desktop`, use the extracted `hed`
      const basePropToUse = baseProp || propName;
      // Match found, stop recursing and replace the value via callback
      if (basePropToUse === targetProp) {
        // Take the result of given callback and replace the original
        // value by reference in archiemlObj
        const callbackHandler = new Promise((resolve, reject) => {
          (async () => {
            try {
              const d = await callback(value, breakpointName);
              obj[propName] = d;
              return resolve(d);
            } catch (err) {
              return reject(err);
            }
          })();
        });

        taskPromises.push(callbackHandler);
      } else if (recursive && typeof value === 'object') {
        // recurse as needed through child objects
        if (Array.isArray(value)) {
          value.forEach((arrItemValue) => searchObject(arrItemValue));
        } else {
          searchObject(value);
        }
      }
    }
  };

  searchObject(archiemlObj);

  // run tasks
  const tasks = await Promise.all(taskPromises);
  return tasks;
}

/**
 * Given a top-level ArchieML props oject, like the JSON version of this:
 * {.video}
 *   hed: My video
 *   media: 100000007076585
 *   media-desktop: 100000007076545
 * {}
 *
 * find `media` and breakpoint style media properties (like media-desktop) and replace the
 * string with an object of metadata needed to render the asset represented by the string slug
 * via shared media components, like <Image> or <Video>.
 *
 * @param {archiemlObj} archiemlObj
 * @property {boolean} options.recursive
 * @property {string} options.targetProp
 * @returns {Promise<archiemlObj>}
 */
export const resolveMediaProp = async (
  archiemlObj,
  { recursive = false, targetProp = 'media' } = {}
) => {
  /**
   * @param {string} assetSlug
   * @param {string} breakpointName
   * @returns Promise<{import('../shared/Media/index').MediaObject}>
   */
  const resolveMedia = async (assetSlug, breakpointName) => {
    assetSlug = stripHtmlTags(assetSlug); // clean the prop value of gdoc tags and links

    /** @type {import('../Media/index').MediaObject} */
    const processedMedia = { assetType: '', assetSlug, breakpointName, assetErrors: [] };

    // console.log(assetSlug)

    switch (true) {
      case isScoopId(assetSlug): {
        const scoopAsset = await getScoopMedia(assetSlug);
        if (scoopAsset) {
          // merge scoop data into processedMedia record
          const scoopAssetType = `scoop${scoopAsset.__typename}`;
          if (
            AvailableAssetTypesSet.has(scoopAssetType) &&
            AssetTypeToComponentMapping[scoopAssetType]
          ) {
            Object.assign(
              processedMedia,
              {
                assetType: scoopAssetType
              },
              scoopAsset
            );
          } else {
            processedMedia.assetErrors.push(
              // @ts-ignore
              `${scoopAssetType} doesn't have a media template.`
            );
          }
        } else {
          processedMedia.assetErrors.push(
            // @ts-ignore
            `Slug is a valid looking Scoop ID that doesn't exist or has other issues.`
          );
        }
        break;
      }
      case isVideoTape(assetSlug): {
        Object.assign(processedMedia, {
          assetType: 'videotape'
        });
        break;
      }
      case isResponsiveLocalImage(assetSlug): {
        // collect post-sized image data for templates
        // (this only generates known endpoints, doesn't ensure they exist yet. vite middleware will dynamically create)
        const imageConfig = { ...getBaseImageSizerOptions(), ...imageTaskConfig };
        const { inputPath, widths, outputExtensions, preservePng, retinaQuality, outputPath } =
          imageConfig;
        const slug = inputImagePathToSlug(assetSlug);
        const fileName = inputImagePathToFileName(assetSlug);
        const filePath = `${inputPath}/${fileName}`;
        const ratio = getImageSize(filePath).ratio;
        const hasRetina = !!retinaQuality;
        const extensions = [];
        const extension = getExtension(assetSlug);

        if (extension === 'png' && preservePng) {
          extensions.push('png');
        } else {
          // ensure webp is at front of list
          if (outputExtensions.includes('webp')) {
            extensions.push('webp');
          }

          // add remainder. exclude already-added webp
          outputExtensions
            .filter((ext) => ext !== 'webp')
            .forEach((ext) => {
              extensions.push(ext);
            });
        }
        Object.assign(processedMedia, {
          assetType: 'localResponsiveImage',
          outputPath: outputPath.replace('public/', '/'),
          fileName,
          slug,
          ratio,
          extensions,
          widths,
          hasRetina
        });
        break;
      }
      // this must come after isResponsiveLocalImage
      // since both can be served out of public/_images/
      // and this test verifies anything in public/*
      case isLocalImage(assetSlug): {
        Object.assign(processedMedia, {
          assetType: 'localImage',
          url: `${assetSlug}`
        });
        break;
      }
      case isRemoteImage(assetSlug): {
        Object.assign(processedMedia, {
          assetType: 'remoteImage',
          url: `${assetSlug}`
        });
        break;
      }
      case isRemoteMp3(assetSlug): {
        Object.assign(processedMedia, {
          assetType: 'remoteAudio',
          url: `${assetSlug}`
        });
        break;
      }
      case isGraphicFragment(assetSlug): {
        Object.assign(processedMedia, {
          assetType: 'graphic',
          html: readFileAsync(`${graphicsFilePath}/${assetSlug}`, 'utf-8')
        });
        break;
      }
      case isLocalVideo(assetSlug): {
        Object.assign(processedMedia, {
          assetType: 'localVideo',
          url: `${assetSlug}`
        });
        break;
      }
    }

    // set component type to use.
    if (processedMedia.assetType) {
      const availableComponents = AssetTypeToComponentMapping[processedMedia.assetType];

      if (availableComponents) {
        // Does editor want to override the default component for this assetType
        // by defining an {.object} media: tk; component: tk {.} value?
        // For example, using a VHS player instead of a svelte Video player.
        // @ts-ignore
        if (archiemlObj?.mediaComponent && typeof archiemlObj.mediaComponent === 'string') {
          // @ts-ignore
          const { mediaComponent } = archiemlObj;
          // compare lowercase to ma	ke google doc work easier. 'vhs' or 'VHS' would find the correct VHS component
          const lowerCaseComponentNames = availableComponents.map((s) => s.toLowerCase());

          if (lowerCaseComponentNames.includes(mediaComponent.toLowerCase())) {
            const idx = lowerCaseComponentNames.findIndex(
              (s) => s === mediaComponent.toLowerCase()
            );
            // use the proper cased component name
            processedMedia.mediaComponent = availableComponents[idx];
          } else {
            processedMedia.assetErrors.push(
              // @ts-ignore
              `The "${processedMedia.assetType
              }" asset can not be loaded in the mediaComponent "${mediaComponent}". It can only be loaded in: tk`
            );
          }
        } else {
          // default to first available handler.
          processedMedia.mediaComponent = AssetTypeToComponentMapping[processedMedia.assetType][0];
        }
      } else {
        processedMedia.assetErrors.push(
          // @ts-ignore
          `Failed to find a media component for "${processedMedia.assetType}".`
        );
      }
    } else {
      // Infer some possible error states to surface in Freebird.
      const { assetSlug, assetErrors } = processedMedia;
      switch (true) {
        case !assetSlug: {
          processedMedia.assetErrors.push(
            // @ts-ignore
            `processing of '${targetProp}' failed. No valid slug.`
          );
          break;
        }
        case localResponsiveImagePathRe.test(assetSlug) && !localImageFileIsValid(assetSlug): {
          assetErrors.push(
            // @ts-ignore
            `${assetSlug} is a responsive image path to a file that does't exists or is corrupt.`
          );
          break;
        }
        case localImagePathRe.test(assetSlug) && !localImageFileIsValid(assetSlug): {
          assetErrors.push(
            // @ts-ignore
            `${assetSlug} is a local image path to a file that does't exists or is corrupt.`
          );
          break;
        }
        case assetSlug.includes('.html') && !!fileExists(`${graphicsFilePath}/${assetSlug}`): {
          assetErrors.push(
            // @ts-ignore
            `${assetSlug} is a local ai2html or fragment path that does't exists or is corrupt. Verify ${assetSlug} lives in ${graphicsFilePath}`
          );
          break;
        }
        default:
          assetErrors.push(
            // @ts-ignore
            `assetType couldn't be determined from the given slug.`
          );
      }
    }

    // filter out empty strings
    processedMedia.assetErrors = processedMedia.assetErrors.filter((s) => !!s);

    return processedMedia;
  };

  const resolve = await updateArchiemlProp(archiemlObj, targetProp, resolveMedia, { recursive });

  return resolve;
};

/**
 * Given a full ArchieML body loop array for a page, which consist of various
 * types of content, find any component with a `media` property and
 * replace the slug with a all the metadata needed for the various media
 * components, like <Image> or <Video>, to render the asset correctly.
 *
 * @param {Record<string,any>[]} archiemlBodyLoopArray
 * @property {boolean} options.recursive
 * @returns {Promise<archiemlObj[]>}
 */
export const resolveMediaPropsInPage = async (
  archiemlBodyLoopArray,
  { recursive = false, targetProp = 'media' } = {}
) => {
  const resolvePromises = archiemlBodyLoopArray
    .filter((archiemlObj) => typeof archiemlObj.value === 'object')
    .map((archiemlObj) => {
      return resolveMediaProp(archiemlObj.value, { recursive, targetProp });
    });

  const resolve = await Promise.all(resolvePromises);
  return resolve;
};
