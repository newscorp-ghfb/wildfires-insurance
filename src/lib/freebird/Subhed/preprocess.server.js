export default function preprocess(block) {
  const value =
    typeof block.value === "object" ? block.value : { value: block.value };
  return {
    ...block,
    value,
  };
}
