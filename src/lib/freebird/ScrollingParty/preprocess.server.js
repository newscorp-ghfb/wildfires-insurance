import processHeader from "$lib/freebird/Header/preprocess.server.js";
import processLorem from "$lib/freebird/Lorem/preprocess.server.js";

export default async function preprocess(block, event) {
  const items = block.value.slides;

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
      } catch (error) {
        console.error(error);
      }
    }

    if (
      item.lorem === "" ||
      typeof item.lorem === "string" ||
      typeof item.lorem === "object"
    ) {
      try {
        const loremProps = await processLorem({
          type: "lorem",
          value: item.lorem,
        });

        item.props = Object.assign({}, item.props, loremProps.value);
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
