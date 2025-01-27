import { tick } from "svelte";
import { readable, derived } from "svelte/store";
import { sortBy } from "$lib/shared/utils/utilities.js";
import { isIos, isApp } from "$lib/shared/utils/agent.js";
import { namedBreakpoints } from "$lib/shared/utils/breakpoints.js";

const isBrowser = typeof window !== "undefined";
const isNytIosApp = isIos() && isApp();

const getVisualViewportWidth = () => {
  if (isBrowser) {
    // width minus scrollbar, as opposed to window.innerWidth
    return (
      window?.visualViewport?.width || document.documentElement.clientWidth
    );
  }

  // default for non-browser env
  return 0;
};

const getVisualViewportHeight = () => {
  if (isBrowser) {
    // height minus scrollbar, as opposed to window.innerHeight
    return (
      window?.visualViewport?.height || document.documentElement.clientHeight
    );
  }

  // default for non-browser env
  return 0;
};

/**
 * Return the width of the viewable viewport, which excludes the scrollbar.
 * This more accurately reflects what's visible in the viewport, but differs
 * slightly from the value used by browsers with media queries.
 *
 * See also: $windowWidth
 *
 */
export const viewportWidth = readable(0, function start(set) {
  const update = () => {
    set(getVisualViewportWidth());
  };
  if (isBrowser) {
    window.addEventListener("resize", update);
    Promise.resolve(tick).then(() => {
      update();
    });
  }
  return function stop() {
    if (isBrowser) {
      window.removeEventListener("resize", update);
    }
  };
});

/**
 * Return the width of the window, which includes the scrollbar.
 * This width is used by the browser in media queries but may not
 * match the number of pixels you see on the screen.
 *
 * See also: $viewportWidth;
 *
 * (using already-bound resize events in $viewportWidth to derive this value,
 * instead of making a new readable with attached listeners)
 */
export const windowWidth = derived(viewportWidth, ($viewportWidth) =>
  isBrowser && $viewportWidth ? Math.max(window.innerWidth, $viewportWidth) : 0,
);

/**
 * Return the height of the viewable viewport, which excludes a scrollbar.
 * This more accurately reflects what's visible in the viewport, but differs
 * slightly from the value used by browsers with media queries.
 *
 * See also: $windowHeight
 *
 */
export const viewportHeight = readable(0, function start(set) {
  const update = () => {
    set(getVisualViewportHeight());
  };
  if (isBrowser) {
    window.addEventListener("resize", update);
    Promise.resolve(tick).then(() => {
      update();
    });
  }
  return function stop() {
    if (isBrowser) {
      window.removeEventListener("resize", update);
    }
  };
});

/**
 * Return the height of the window, which includes any scrollbar.
 * This height is used by the browser in media queries but may not
 * match the number of pixels you see on the screen.
 *
 * See also: $viewportHeight;
 *
 * (using already-bound resize events in $viewportHeight to derive this value,
 * instead of making a new readable with attached listeners)
 */
export const windowHeight = derived(viewportHeight, ($viewportHeight) =>
  isBrowser && $viewportHeight
    ? Math.max(window.innerHeight, $viewportHeight)
    : 0,
);

// default to true if server rendered
export const isMobile = derived(windowWidth, ($windowWidth) =>
  isBrowser && $windowWidth >= namedBreakpoints["desktop"] ? false : true,
);

export const isDesktop = derived(isMobile, ($isMobile) => !$isMobile);

export const currentBreakpoint = derived(windowWidth, ($windowWidth) => {
  /**
   * Transform Object literal {mobile: 0; desktop: 740} into
   * a an array of objects sorted smallest to largest:
   * [{name: 'mobile'; width: 0;}, {name: 'desktop'; width: 740;}]
   */
  const sortedBreakpoints = Object.entries(namedBreakpoints)
    .map(([name, width]) => {
      return {
        name,
        width,
      };
    })
    .concat()
    .sort(sortBy("width"));

  // default to smallest
  let selectedBreakpoint = sortedBreakpoints[0].name;

  // see if larger breakpoints are applicable
  sortedBreakpoints.forEach((breakpoint) => {
    if ($windowWidth >= breakpoint.width) {
      selectedBreakpoint = breakpoint.name;
    }
  });

  return selectedBreakpoint;
});

/*
 * Find the full potential viewport height, even on mobile devices
 * where collapsing and expanding UI chrome on scroll give
 * real-time results from window.innerHeight and the like but
 * don't account for the final height of a mobile browser after
 * the mobile chrome contracts on scroll.
 *
 * This full viewport height is useful for pre-sizing element heights
 * that are 1) accurate to the final height and 2) don't thrash as they
 * reactively resize when the mobile UI changes state.
 *
 * To get the final value, we measure a real element set to 100vh,
 * which is the true after-collapse value, even when the browser chrome is
 * still visible.
 *
 * As of 12/2022, the NYT iOS app seems to need the window.innerHeight value, as
 * the 100vh div and our content stays covered by some NYT app chrome over the real viewport.
 * https://github.com/nytnews-projects/2022-09-19-mideast-heat/pull/132
 */
export const viewport100vh = derived(viewportHeight, ($viewportHeight, set) => {
  /** @type {HTMLElement | undefined} */
  let el;
  let viewportHeight = 0;

  if (isBrowser) {
    // only create once
    if (!el) {
      el = document.createElement("div");
      el.id = "g-freebird-100vh-placeholder";
      Object.assign(el.style, {
        position: "absolute",
        height: "100vh",
        width: 0,
        left: "-300vh",
        top: 0,
      });
      document.body.append(el);
    }

    viewportHeight = isNytIosApp ? $viewportHeight : el.clientHeight;
  }

  set(viewportHeight);

  return () => {
    // remove element when no longer needed
    if (el) {
      el.remove();
    }
  };
});

export const hasJs = readable(isBrowser);

export const shouldReduceMotion = readable(
  isBrowser && window?.matchMedia("(prefers-reduced-motion)")?.matches,
);

export const dockInfo = readable(
  { dockHeight: 0, dockVisible: false, dockExpanded: false },
  function start(set) {
    const update = (e) => {
      set({
        dockHeight: e.detail.dockHeight,
        dockVisible: e.detail.dockVisible,
        dockExpanded: e.detail.dockExpanded,
      });
    };

    const boundListener = (e) => update(e);
    if (isBrowser) {
      window.addEventListener("dockInfo", boundListener);
    }

    return function stop() {
      if (isBrowser) {
        window.removeEventListener("dockInfo", boundListener);
      }
    };
  },
);
