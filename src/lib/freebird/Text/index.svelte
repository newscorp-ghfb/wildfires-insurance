<script>
  import Text from "$lib/shared/Text/index.svelte";

  export let props = {};

  let value;
  let className;
  let id;

  $: ({ value, className, id } = props);
</script>

<Text
  {id}
  {className}
  text={value}
  renderHtml={true}
  generateParagraphs={false}
/>
