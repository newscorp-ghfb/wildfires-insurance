import { get } from "svelte/store";
import {
  sortBy,
  groupByProperty,
  difference,
} from "$lib/shared/utils/utilities.js";
import { namedBreakpoints } from "$lib/shared/utils/breakpoints.js";
import { isMobile } from "$lib/stores.js";

const desktopBreakpoint = namedBreakpoints["desktop"];
const isBrowser = typeof window !== "undefined";

/**
 * Generate media queries for picture element based
 * on the available rendition widths. Some rendition
 * generators (like local, responsive images) may include
 * multiple sources types (like jpg and webp) for the same
 * widths, so we need to account for that in our dynamic
 * mediaQuery generation.
 *
 * Because Scoop can include mobile and non-mobile renditions for
 * the same asset, we need to account for the existence of mobile-specific
 * renditions and serve them appropriately. See: #861
 *
 * @param {import('./types').ImageRenditions } renditions
 * @returns {import('./types').ProcessedImageRenditions }
 */
export const generateRenditionMediaQueries = (renditions) => {
  const processedRenditions = [];

  // scoop includes a cropName and uses 'mobile' as part of the name.
  const sortedMobileRenditions = renditions
    .filter(
      (rendition) =>
        rendition?.cropName &&
        rendition.cropName.toLowerCase().includes("mobile"),
    )
    .sort(sortBy("width"));

  const sortedNonMobileRenditions = difference(
    renditions,
    sortedMobileRenditions,
  ).sort(sortBy("width"));
  const hasMobileRenditions = sortedMobileRenditions.length;
  const hasNonMobileRenditions = sortedNonMobileRenditions.length;

  const addRenditions = (_subset, isMobileRendition = false) => {
    // Group renditions by width to account for renditions of same size but different file types.
    // For example, our default responsive image task generates jpgs and webps. We want to offer both
    // to the browser.
    const renditionsGroupedByWidth = groupByProperty([..._subset], "width");
    const renditionWidths = Object.keys(renditionsGroupedByWidth).map((s) =>
      parseInt(s),
    );
    const numberOfWidths = Object.values(renditionWidths).length;

    // Generate mediaQuery for this group
    Object.entries(renditionsGroupedByWidth).forEach(
      ([width, groupRenditions], idx) => {
        const renditionCounter = processedRenditions.length;
        const pixelDensityDivider = isMobileRendition ? 2 : 1;
        const currentWidth = parseInt(`${width}`) / pixelDensityDivider;

        // test for first rendition across mobile and non-mobile
        const isFirstRendition = renditionCounter === 0;

        // test for last rendition across mobile and non-mobile
        const isLastRendition = (() => {
          let isLast;
          // if there are only mobile renditions, and this is the last one
          if (
            isMobileRendition &&
            !hasNonMobileRenditions &&
            renditionCounter === numberOfWidths - 1
          ) {
            isLast = true;
            // is there are non-mobile renditions, then a mobile one can never be last.
          } else if (isMobileRendition && hasNonMobileRenditions) {
            isLast = false;
            // check for the last in the case where there are more than just mobile renditions.
          } else if (idx === numberOfWidths - 1) {
            isLast = true;
            // default
          } else {
            isLast = false;
          }
          return isLast;
        })();

        // Generated media query differs based on being a
        // the first, last or one of the in-between renditions.
        let mediaQuery;

        // b/c the mobile rendition may be useful at a larger viewport
        // than some of the smaller non-mobile renditions, we want to
        // filter our versions that don't make sense, where the source's
        // min-width exceeds its max-width.
        let viableRendition = true;

        // first, smallest rendition available. check for isMobileRendition b/c we want
        // to limit the maxWidth to our desktopBreakpoint. Beyond that, we need
        // to ensure desktop only renditions.
        if (isFirstRendition) {
          const maxWidth = isMobileRendition
            ? Math.max(currentWidth, desktopBreakpoint - 1)
            : currentWidth;
          mediaQuery = `(max-width: ${maxWidth}px)`;
        } else {
          // To prevent  small, non-mobile renditions from superseding mobile ones on mobile, we
          // need to smartly set the minimum width for this rendition's mediaQuery.
          const minWidth = (function () {
            let minWidth;

            // for mobile, set it to the bigger of the current rendition's width or the last tracked mobile rendition.
            // since all mobiles are process first, no need to for fancy checks in the running list.
            if (isMobileRendition) {
              minWidth = Math.max(
                processedRenditions[renditionCounter - 1].width + 1,
                currentWidth,
              );
            } else {
              // Set the minimum width based the non-mobile renditions we've seen so far. If this is the first,
              // the minimum width needs to patch the breakpoint cutoff for mobile devices.
              const nonMobileRenditionsSoFar = processedRenditions.filter(
                (r) => !r.isMobileRendition,
              );
              minWidth = nonMobileRenditionsSoFar.length
                ? nonMobileRenditionsSoFar[nonMobileRenditionsSoFar.length - 1]
                    .width + 1
                : desktopBreakpoint;
            }

            return minWidth;
          })();

          // last, largest rendition.
          if (isLastRendition) {
            mediaQuery = `(min-width: ${minWidth}px)`;
            // all other in-betweens
          } else {
            const maxWidth = renditionWidths[idx];
            mediaQuery = `(min-width: ${minWidth}px) and (max-width: ${maxWidth}px)`;

            // with both mobile and desktop renditions, we can end up with
            // wonky, non viable renditions, where minWidth is bigger than a maxWidth.
            // no real harm, but better to not print them in the markup.
            viableRendition = maxWidth >= minWidth;
          }
        }
        // Generate all renditions for this group
        groupRenditions.forEach((rendition) => {
          const { url, retinaUrl, width, height } = rendition;

          if (viableRendition) {
            processedRenditions.push({
              ...rendition,
              srcSetUrl: retinaUrl ? `${url}, ${retinaUrl} 2x` : url,
              ratio: width / height,
              aspectRatio: `${width}/${height}`,
              mediaQuery,
              isMobileRendition,
            });
          }
        });
      },
    );
  };

  // order is important. Mobile renditions, if they exist,
  // must be processed first.
  if (hasMobileRenditions) {
    addRenditions(sortedMobileRenditions, true);
  }

  addRenditions(sortedNonMobileRenditions);

  return processedRenditions;
};

/**
 * To reduce page re-renders as images load, we attempt to
 * set the aspect ratio for the <picture> element dynamically
 * to help the browser pre-size the image height. We
 * have to take a few things into account.
 *
 * 1) In cases where, like our built-in responsive images,
 * all renditions are nearly the identical aspect ration,
 * we can pre-make the `--g-picture-ratio` variable server side,
 * which allows for best experience.
 *
 * Scoop images include a mobile crop, which is
 * usually the same image and is treated like our
 * regular responsive images.
 *
 * 2) But sometimes that Scoop mobile crop
 * is drastically different (See: #861). In
 * these cases, we can't pre-bake the aspect ratio
 * b/c we don't know what the user's viewport will be.
 *
 * When we don't know, we default to `auto`, which
 * doesn't hint anything to the browser. After JS runs,
 * we update the aspect-ratio with the correct value, allowing
 * the browser to pre-size (if a touch after page ready) images
 * farther down the page.
 *
 * ---
 *
 * This isn't ideal, but it's better than pre-baking the wrong
 * size, and if JS is disabled, we'd be stuck with the wrong size.
 * Now, version 1 above always has the correct aspect ratio generate
 * server side. Some scoop images, version 2, may start `auto` and then
 * update if/when JS runs.
 *
 */
export const getCurrentAspectRatio = (processedRenditions) => {
  let newStyle = "auto";

  if (processedRenditions?.length) {
    const defaultRendition = processedRenditions[0];

    if (processedRenditions.length === 1) {
      newStyle = defaultRendition.aspectRatio;
    } else if (processedRenditions.length > 1) {
      const firstMobileRendition = processedRenditions.find(
        (r) => r.isMobileRendition,
      );
      const firstNonMobileRendition = processedRenditions.find(
        (r) => !r.isMobileRendition,
      );

      // check if mobile and non-mobile exist, and that their calculated
      // aspect ratios are't close
      // (scoop and our dynamic images are often a couple pixels off perfect);
      const useMultipleRatios =
        !!firstMobileRendition &&
        !!firstNonMobileRendition &&
        Math.abs(firstMobileRendition.ratio - firstNonMobileRendition.ratio) >
          0.02;

      // we don't know what the final ratio will
      // be until after the page loads, so don't pre-fill
      // the space when multiple ratios are possible
      if (useMultipleRatios) {
        newStyle = "auto;";

        // determine which ratio to use if/when JS kicks in
        if (isBrowser) {
          if (get(isMobile)) {
            newStyle = firstMobileRendition.aspectRatio;
          } else {
            newStyle = firstNonMobileRendition.aspectRatio;
          }
        }
      } else {
        newStyle = defaultRendition.aspectRatio;
      }
    }
  }

  return newStyle;
};
