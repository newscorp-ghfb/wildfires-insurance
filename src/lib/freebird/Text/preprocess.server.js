export default function preprocess(block) {
  let value =
    typeof block.value === "object" ? block.value : { value: block.value };

  // A list of strings or type array. Very unlikely.
  if (Array.isArray(value)) {
    value = { value: value };
  }

  return {
    ...block,
    value,
  };
}
