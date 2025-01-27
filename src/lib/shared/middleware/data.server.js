import { fetchMediaPropsInPage } from "./media.server.js"; // Renamed import
import { outputPath, outputImagesPath } from "$lib/freebird/wayfinder/config.js";

/**
 * Preprocess function that handles data transformation asynchronously.
 * @param {Record<string, Function>} processors - Mapping of component types to processors.
 * @returns {Function} - Asynchronous function that preprocesses data.
 */
export function preprocess(processors) {
  /**
   * Asynchronous function that preprocesses data.
   * @param {{ body: Array<{ value: any; type: string; component?: any }>; [property: string]: any }} data - Data to be processed.
   * @returns {Promise<Array>} - Processed data.
   */
  return async function (data) {
    if (!data?.body?.length) return data?.body;

    await fetchMediaPropsInPage(data.body, { recursive: true }); // Updated function call

    const handle = (body) =>
      Promise.all(
        body?.map?.(async (block) => {
          // convert type to lowercase
          const type = block?.type?.toLowerCase?.();
          const processor = processors[type];

          if (!processor) return block;

          try {
            return await processor(block, data, handle);
          } catch (e) {
            throw new Error(
              `The processor for the component "${type}" failed:\n${e?.stack}`,
              {
                cause: e,
              },
            );
          }
        }),
      );

    // We recursively preprocess the body array, which allows
    // us to preprocess components nested within Section blocks.
    return await handle(data.body);
  };
}

// Example of refactored fetchMediaPropsInPage function using browser-compatible APIs
// You need to implement this function in media.server.js accordingly
export async function fetchMediaPropsInPage(body, options) {
  try {
    const response = await fetch(`${outputImagesPath}`);
    // Process response as needed
  } catch (e) {
    console.error("Error accessing outputImagesPath:", e);
    throw e; // Optionally rethrow the error for higher-level handling
  }

  // Implement the rest of your logic as per your application's requirements
}
