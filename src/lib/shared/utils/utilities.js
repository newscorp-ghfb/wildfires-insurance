/**
 * Given a preface string, return an
 * increment-based unique id each time
 * the method is called.
 *
 * example:
 * uniqueId('person_') -> person_0
 * uniqueId('person_') -> person_1
 * uniqueId('person_') -> person_2
 *
 * @param {string} str
 * @returns {string} unique id
 */
export const uniqueId = (
  (counter) =>
  (str = "") =>
    `${str}${++counter}`
)(0);

/**
 * Creates an array of array values not included in arr2.
 * Similar to _'s version.
 * @param {array} arr1
 * @param {array} arr2
 * @returns array
 */
export const difference = (arr1, arr2) => arr1.filter((x) => !arr2.includes(x));

/**
 * Sort array of objects by the given key. Similar
 * to Underscore's _.sortBy.
 *
 * Use with concat if you don't want to modify an array in place.
 *
 * Example:
 *
 * const editors = [{name: "Troy", mood: "happy"}, {name: "Josh", mood: "curious"}];
 * editors.concat().sort(sortBy('name));
 *
 * @param {string} key
 */
export const sortBy = (key) => {
  return (a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0);
};

/**
 * Splits a collection into sets, grouped by passed in property.
 *
 * @param {array} array
 * @param {string} prop
 * @returns
 */
export const groupByProperty = (array, prop) => {
  return array.reduce(function (acc, item) {
    (acc[item[prop]] = acc[item[prop]] || []).push(item);
    return acc;
  }, {});
};

export const noop = () => {};

/**
 * Underscore's debounce:
 * http://underscorejs.org/#debounce
 *
 * @param {function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @returns {function} result
 */
export const debounce = (func, wait, immediate = false) => {
  /** @type {function | undefined} */
  var result;

  /** @type { any } */
  var timeout = null;
  return function () {
    // @ts-ignore
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
      }
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
    }
    return result;
  };
};

/**
 * Given a value, probably a number-like string, see if it
 * can be safely parsed as an integer.
 * @param {any} num
 */
export const isSafeInt = (num) => Number.isSafeInteger(parseInt(num));

/**
 * Given a float, round number to the given number of digits. Defaults to 2.
 * @param {number} num
 * @param {number} digits
 * @returns number
 */
export const roundToDigits = (num, digits = 2) => {
  const multiplier = 10 ** digits;
  return Math.round((num + Number.EPSILON) * multiplier) / multiplier;
};

/**
 * Test if a given number is between a min and max.
 * @param {number} num
 * @param {number} min lowest number in range
 * @param {number} max heights number in range
 * @param {boolean} inclusive include first and last numbers in range, not just values in between. defaults true.
 * @return boolean
 */
export const inRange = (num, min = 0, max = 1, inclusive = true) => {
  if ([num, min, max].some((v) => typeof v !== "number")) return false;
  if (inclusive) {
    return num >= min && num <= max;
  } else {
    return num > min && num < max;
  }
};
