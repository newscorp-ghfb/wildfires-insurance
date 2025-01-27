<script>
  import Text from "$lib/shared/Text/index.svelte";

  export let props;

  const { paragraphs, lede } = props;

  if (lede && paragraphs.length) {
    paragraphs[0] = lede + " " + paragraphs[0];
  }
</script>

<Text text={paragraphs} generateParagraphs={false} renderHtml={true} />
