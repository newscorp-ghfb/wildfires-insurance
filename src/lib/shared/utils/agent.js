// Safeguard for non-browser env
const userAgent =
  typeof window !== "undefined" ? window.navigator.userAgent : "";

// Speed up later lookups
const cache = new Map();

/**
 * Is current client the NYT native app?
 * @returns {boolean}
 */
const isAppTest = () =>
  !!(
    (
      window.location.href.indexOf("app.html") > 0 ||
      window.location.search.indexOf("nytapp") > -1 || // sometimes this query param is present
      userAgent.match(/nyt[-_]?(?:ios|android)/i) || // usually the user agent is set
      // @ts-ignore
      (userAgent.match(/android/i) && window.__HYBRID__)
    ) // on hybrid articles in android, the user agent and qs is missing
  );

/**
 * Get cached userAgent string
 * @returns {string} userAgent
 */
export function getUserAgent() {
  return userAgent;
}

/**
 * Is current device running iOS?
 * @returns {boolean}
 */
export function isIos() {
  if (!cache.has("isIos")) {
    cache.set("isIos", /iP(hone|od|ad)/.test(userAgent));
  }
  return cache.get("isIos");
}

/**
 * Is current device running Android?
 * @returns {boolean}
 */
export function isAndroid() {
  if (!cache.has("isAndroid")) {
    cache.set("isAndroid", /Android/.test(userAgent));
  }
  return cache.get("isAndroid");
}

/**
 * Is current client running in the NYT app?
 * @returns {boolean}
 */
export function isApp() {
  if (!cache.has("isApp")) {
    cache.set("isApp", isAppTest());
  }
  return cache.get("isApp");
}
