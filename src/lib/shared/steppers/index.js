export const sampleItems = ["🎥", "📺", "📰"].map((emoji) => {
  return {
    type: "text",
    value: emoji,
  };
});

/**
 * Given raw ArchieML items array, normalize the two
 * possible types into an array of Item[].
 * @param {import('./index').GoogleDocItem[]} items
 * @returns {import('./index').PreprocessedItem[]} items
 */
export const normalizeArchieMlItems = (items) => {
  return (items || []).map((item) => {
    const normalizedItem = {};

    // Items come in two forms:
    //
    // 1) as a series of text
    // [.+items]
    //  scrolly text one, not in an array
    //  scrolly text two, not in an array
    // []
    //
    // 2) custom objects, which may include a text property
    // [.items]
    //  text: scrolly text one, in an array
    //  text: scrolly text two, in an array
    // []
    //
    // Here, we normalize this so every item
    // is an object, and includes a .text property,
    // even if it's blank

    // option 1, as archieml processes google doc
    if (item?.type === "text" && item?.value) {
      normalizedItem.text = item.value;
    } else {
      Object.assign(normalizedItem, item);
    }
    return normalizedItem;
  });
};

/**
 * Given an instanceId and item index, return a properly
 * scaffolded Item.
 *
 * @param {string} instanceId
 * @param {number} index
 * @returns {import('./index').Item} items
 */
export const getBaseItem = (instanceId, index) => {
  return {
    index,
    id: `${instanceId}-item-${index}`,
    active: false,
    previousActive: false,
    text: "",
    props: {},
    offset: 0,
  };
};
