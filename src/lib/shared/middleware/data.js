/**
 * This function dynamically imports svelte components.
 **/
export async function preprocess(data) {
  if (!data?.body?.length) return data;

  const handle = (body) => {
    return Promise.all(
      body.map(async (block) => {
        if (block.type === "section") {
          /* Recursively import components that are nested inside Section blocks. */
          return {
            ...block,
            value: await handle(block.value),
          };
        } else if (block.type === "svelte") {
          let file = block.value.component;

          try {
            /* Dynamically import components from $lib/project */
            const { default: component } = await import(
              `../../project/${file}/index.svelte`
            );

            return {
              ...block,
              component: component,
            };
          } catch (/** @type {any} */ error) {
            return {
              type: "error",
              value: {
                message: `The svelte component failed to import <code>src/lib/project/${file}/index.svelte</code>. Please check that this file exists and is free of errors.`,
                stack: error.stack,
              },
            };
          }
        }

        return block;
      }),
    );
  };

  return {
    ...data,
    body: await handle(data.body),
  };
}
