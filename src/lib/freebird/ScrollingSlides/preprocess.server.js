import { normalizeArchieMlItems } from "$lib/shared/steppers/index.js";
import processHeader from "$lib/freebird/Header/preprocess.server.js";

export default async function preprocess(block, event) {
  let items = normalizeArchieMlItems(block.value.items);
  for (let index = 0; index < items.length; index++) {
    const item = items[index];

    // prep for in-item header, as needed
    if (typeof item.header === "object") {
      try {
        const headerProps = await processHeader(
          {
            type: "header",
            value: item.header,
          },
          event,
        );

        item.props = Object.assign({}, item.props, headerProps.value);

        // private for ScrollingSlides
        item._insertHeader = true;
      } catch (error) {
        console.error(error);
      }
    }
  }

  return {
    ...block,
    value: {
      ...block.value,
      items,
    },
  };
}
