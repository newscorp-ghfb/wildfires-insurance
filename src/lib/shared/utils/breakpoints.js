import { sortBy, isSafeInt } from "./utilities.js";

/**
 * Mapping between break point name and the
 * minimum pixel value for the given breakpoint.
 */
export const namedBreakpoints = {
  mobile: 0,
  desktop: 740,
};

/**
 * Array of all the named breakpoint slugs in a project.
 */
export const namedBreakpointSlugs = Object.keys(namedBreakpoints);

/**
 * Regular expression to find props that specify breakpoints.
 * Captures both the prop and the breakpoint name.
 * Dynamically generated to pickup changes to list of named breakpoints.
 * Functionally equivalent to the regex literal:
 * /^(\w+)-(\d+px|desktop|mobile)$/
 *
 * Examples:
 *   'hed-desktop' -> ['hed-desktop', 'hed', 'desktop']
 *   'cols-600px' -> ['cols-600', 'cols', '600px']
 */
export const breakpointAndPropRe = new RegExp(
  `^(\\w+)-(\\d+px|${namedBreakpointSlugs.join("|")})$`,
);

/**
 * Given a number, number like string or string named breakpoint (like "desktop"),
 * coerce value into an integer for use in breakpoint selection logic. Examples:
 *
 * '600' -> 600
 * '600px' -> 600
 * 1050 -> 1050
 * 'desktop' -> 740
 *
 * @param {number | string} breakpoint
 */
export const breakpointToWidth = (breakpoint) => {
  let breakpointWidth = 0;

  if (typeof breakpoint === "number") {
    breakpointWidth = Math.round(breakpoint); // coerce int
  } else if (typeof breakpoint === "string") {
    const isNamedBreakpoint = namedBreakpointSlugs.includes(
      breakpoint.toLowerCase(),
    );
    if (isNamedBreakpoint) {
      // @ts-ignore
      breakpointWidth = namedBreakpoints[breakpoint.toLowerCase()];
    } else {
      // remove 'px' from any `600px`-style string
      breakpoint = breakpoint.replace("px", "");
      if (isSafeInt(breakpoint)) {
        breakpointWidth = parseInt(breakpoint);
      } else {
        // throw an error?
      }
    }
  }

  return breakpointWidth;
};

/**
 * For ArchieML parent prop or child object, recursively
 * generate a "breakpoint object" denoting values for all given breakpoints,
 * and apply a default of 'mobile' to any non-breakpoint prop.
 *
 * For example, given an input of:
 *
 * {
 *  hed: 'Mobile hed'
 *  hed-desktop: 'Desktop hed'
 *  label: 'My Label'
 *  items: [{media: 'dog.jpg', media-600: 'cat.jpg'}]
 * }
 *
 * Generate this output:
 *
 * {
 *   hed: {
 *    mobile: 'Mobile hed',
 *    desktop: 'Desktop hed'
 *   }
 *   label: {
 *     mobile: 'My label'
 *   }
 *   items: [
 *     {
 *       media: {
 *         mobile: 'dog.jpg',
 *         600: 'cat.jpg'
 *       }
 *     }
 *   ]
 * }
 *
 * @param {Record<string, any>} archiemlObj
 * @param {Record<string, any>|undefined} target
 * @return {Record<string, any>}
 */
export const generateBreakpointObjects = (archiemlObj, target = undefined) => {
  /** @type Record<string, any> */
  const byProp = {};

  /**
   * Apply properties to the either the base `byProp` object or by reference in the `target` object.
   * @param { string } prop
   * @param { any } value
   * @param { string | undefined } breakpoint
   */
  const update = (prop, value, breakpoint = undefined) => {
    const objToUpdate = typeof target === "object" ? target : byProp;

    if (objToUpdate[prop] === undefined) {
      objToUpdate[prop] = {};
    }

    // if given a breakpoint, put value in that child object.
    // otherwise, put value directly on given prop
    if (breakpoint) {
      if (objToUpdate[prop][breakpoint] === undefined) {
        objToUpdate[prop][breakpoint] = {};
      }

      objToUpdate[prop][breakpoint] = value;
    } else {
      objToUpdate[prop] = value;
    }
  };

  // cycle through a *copy* of input object
  Object.entries({ ...archiemlObj }).forEach(([prop, value]) => {
    // Determine if given prop has the pattern of a breakpoint override
    // example:
    // hed -> baseProp: undefined, breakpoint: undefined
    // hed-desktop => baseProp: hed, breakpoint:desktop
    const [, baseProp, breakpoint] = breakpointAndPropRe.exec(prop) || [];

    // If given a true base prop, like 'hed', use that. If given a
    // value like `hed-desktop`, use the extracted `hed`
    const basePropToUse = baseProp || prop;

    // Use extracted breakpoint. Default to mobile not given a breakpoint.
    const breakpointToUse = breakpoint || "mobile";

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        // prop is an array, so recurse through each value of the array
        const arrValues = value.map((d) => {
          if (typeof d === "object") {
            return generateBreakpointObjects(d);
          } else {
            return d;
          }
        });
        update(basePropToUse, arrValues, breakpointToUse);
      } else {
        // prop is an object, so recurse into that object
        update(
          basePropToUse,
          generateBreakpointObjects(value),
          breakpointToUse,
        );
      }
    } else {
      // deepest level of object. No more recursion needed.
      update(basePropToUse, value, breakpointToUse);
    }
  });

  return byProp;
};

/**
 * Take a nested object of ArchieML properties encoded with per-property "breakpoint
 * objects" and recursively resolve the breakpoints by applying the most appropriate value
 * for the given windowWidth.
 *
 * For example, a windowWidth of 2048 and an input of:
 *
 * {
 *   hed: {
 *    mobile: 'Mobile hed',
 *    desktop: 'Desktop hed'
 *   }
 *   label: {
 *     mobile: 'My label'
 *   }
 *
 *   // separate arrays in archieml
 *   items: {
 *    mobile: [{text: mobile item 1, text: mobile item 2}]
 *    desktop: [{text: desktop item 1, text: desktop item 2}]
 *   }
 * }
 *
 * resolves to:
 *
 * {
 *   hed: 'Desktop hed',
 *   label: 'My label',
 *   items: [
 *    {
 *      text: desktop item 1
 * 		  text: desktop item 2
 *    }
 *   ]
 * }
 *
 * @param {Record<string, any>} propsWithBreakpoints
 * @param {number} windowWidth
 */
export const resolveBreakpointObjects = (
  propsWithBreakpoints,
  windowWidth = 0,
) => {
  /**
   * Recurse through given archiemlProps.
   *
   * Nested within `resolveBreakpointObjects` so the outer `windowWidth` value
   * can be referenced without passing it through the recursion.
   *
   * @param {Record<string, any>} propsWithBreakpointsLocal
   * @param {Record<string, any>|undefined} target
   */
  const resolve = (propsWithBreakpointsLocal, target = undefined) => {
    /** @type Record<string, any> */
    const byProp = {};

    /**
     * Apply properties to the either the base `byProp` object or by reference in the `target` object.
     * @param {string} prop
     * @param {any} value
     */
    const update = (prop, value) => {
      const objToUpdate = typeof target === "object" ? target : byProp;
      objToUpdate[prop] = value;
    };

    Object.entries(propsWithBreakpointsLocal).forEach(
      ([prop, breakpointObject]) => {
        // if the values are objects or arrays, recurse to
        // resolve all the items within before proceeding.
        const hasObject = Object.values(breakpointObject).every(
          (d) => typeof d === "object",
        );
        const hasArray =
          hasObject &&
          Object.values(breakpointObject).every((d) => Array.isArray(d));

        // array first since since arrays would
        // also pass the object test below
        if (hasArray) {
          /** @type {Record<string, any>} */
          const arrayBreakpointObject = {};
          Object.entries(breakpointObject).forEach(([breakpoint, value]) => {
            const arrayResolved = value.map(
              (/** @type {Record<string, any>} */ nested) => {
                if (typeof nested === "object") {
                  return resolve(nested);
                } else {
                  return nested;
                }
              },
            );
            arrayBreakpointObject[breakpoint] = arrayResolved;
          });

          // replace
          breakpointObject = arrayBreakpointObject;
        } else if (hasObject) {
          /** @type {Record<string, any>} */
          const objectBreakpoint = {};
          Object.entries(breakpointObject).forEach(([breakpoint, value]) => {
            objectBreakpoint[breakpoint] = resolve(value);
          });

          // replace
          breakpointObject = objectBreakpoint;
        }

        /**
         * Recursion complete. Sort all the possible values by breakpoint
         *
         * from object:
         * {mobile: 'my mobile hed', desktop: 'my desktop hed'}
         * to array sorted smallest to largest by pixel value of breakpoint:
         * [{width: 0, value: 'my mobile hed}, {width: 740, value: 'my desktop hed}]
         *
         * @type Array<{ width: number; value: string; }>
         */
        const sortedBreakpoints = Object.entries(breakpointObject)
          .reduce(
            (
              /** @type Array<{ width: number; value: string; }> */ acc,
              [prop, value],
            ) => {
              acc.push({
                value,
                width: breakpointToWidth(prop),
              });

              return acc;
            },
            [],
          )
          .concat()
          .sort(sortBy("width"));

        // Protect against the case where a viewport prop is passed in but no default/mobile
        // value is ever given. Do so by using the smallest found value for mobile.
        //
        // For example ,this object:
        // {
        //   person: "Troy",
        //   col-desktop: 3
        // }
        //
        // doesn't have a `col` or `col-mobile`, so we need to make one for `col`
        if (sortedBreakpoints.length && sortedBreakpoints[0].width !== 0) {
          update(prop, sortedBreakpoints[0].value);
        }

        // With a default ensured, we can apply the most appropriate
        // responsive value for this prop
        sortedBreakpoints.forEach(function (breakpoint) {
          if (windowWidth >= breakpoint.width) {
            update(prop, breakpoint.value);
          }
        });
      },
    );

    return byProp;
  };

  return resolve(propsWithBreakpoints);
};

/**
 * @typedef {Object} amlConfigOptions
 * @property {number=} windowWidth Width of window is used to resolve responsive breakpoint props. Defaults to 0 for mobile.
 * @property {string[]=} neededProps Top level props to extract from the ArchieML
 * @property {string[]=} ignoreProps Props to not pass to the component, even if it is available
 * @property {Record<string,any>=} propDefaults If a given prop isn't set automatically, use this default value
 */

/**
 * Given an ArchieML object with any number
 * of props, return an object literal of just the neededProps[]
 * props for the component being configured.
 *
 * Optionally, ignore any ignoreProps[], which
 * can be useful for components that contextually
 * may want to deviate from the standard neededProps[].
 * For example, Wrapper support alt tags but should
 * ignore it when used with an Image component/element, which already
 * generates an alt tag.
 *
 * @param {Record<string,any>} archieml
 * @param {amlConfigOptions} options
 * @returns {Record<string,any>}
 *
 * @deprecated pass props manually
 */
export const archiemlPropsToConfig = (
  archieml,
  {
    windowWidth = 0,
    ignoreProps = [],
    neededProps = [],
    propDefaults = {},
  } = {},
) => {
  // resolve any `prop-viewport` props for the given windowWidth
  const responsiveProps = archiemlPropsForBreakpoint(archieml, windowWidth);

  const config = neededProps.reduce((acc, prop) => {
    if (
      typeof responsiveProps[prop] !== "undefined" &&
      !ignoreProps.includes(prop)
    ) {
      // @ts-ignore
      acc[prop] = responsiveProps[prop];
    }
    return acc;
  }, {});

  // Supply missing defaults as needed
  Object.entries(propDefaults).forEach(([prop, value]) => {
    // @ts-ignore
    if (typeof config[prop] === "undefined") {
      // @ts-ignore
      config[prop] = value;
    }
  });

  return config;
};

/**
 * Recurse through ArchieML props object applying
 * breakpoint overrides as dictated by available breakpoints
 * and the given windowWidth. When a prop is given without a
 * breakpoint, an implied 'mobile' is applied.
 *
 * In this example, a windowWidth of 2048 and an archiemlProps containing:
 *
 * {
 *  hed: 'Mobile hed'
 *  hed-desktop: 'Desktop hed'
 *  items: [{media: 'dog.jpg', media-600: 'cat.jpg'}]
 * }
 *
 * would result in the return object containing:
 *
 * {
 * 		hed:' Desktop hed'
 * 		items: {media: 'cat.jpg'}
 * }
 *
 * In addition to art directing by breakpoint, like the last example,
 * you can also content direct by breakpoint. For example, a
 * a windowWidth of 2048 and an archiemlProps containing these two
 * `items` array, with differing number of items per breakpoint:
 *
 * {
 *   items: [{hed: 'first mobile item'}, {hed: 'second mobile item'}, {hed: 'third mobile item'}]
 *   items-desktop: [{hed: 'first desktop item'}, {hed: 'second desktop item'}]
 * }
 *
 * would result in the return object containing
 * {
 *  items: [{hed: 'first desktop item'}, {hed: 'second desktop item'}]
 * }
 *
 * @param {object} archiemlProps
 * @param {number} windowWidth
 */
export const archiemlPropsForBreakpoint = (archiemlProps, windowWidth = 0) => {
  // explode into by-prop breakpoint options
  const propsByBreakpoint = generateBreakpointObjects(archiemlProps);

  // resolve all those previously exploded options for the given windowWidth
  return resolveBreakpointObjects(propsByBreakpoint, windowWidth);
};
