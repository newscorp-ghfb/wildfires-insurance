export default async function preprocess(block, event, handle) {
  return {
    ...block,
    value: await handle(block.value),
  };
}
