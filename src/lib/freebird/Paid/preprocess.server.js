let uuid = 0;

/**
 * @param {Record<string, any>} block
 */
export default function preprocess(block) {
  return { ...block, value: { id: uuid++, size: block.value.size } };
}
