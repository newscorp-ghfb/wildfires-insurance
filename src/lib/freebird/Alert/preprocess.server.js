// normalizes doc data when coming inline from aml
// `alert: This is my alert`
// equals:
// {.alert}
//   text: This is my alert
// {}
export default function preprocess(block) {
  let value =
    typeof block.value === "object" ? block.value : { text: block.value };

  return {
    ...block,
    value,
  };
}
