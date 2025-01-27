<script>
  /**
   *  Paragraph text, which can come in a variety of forms:
   *  1) A single paragraph string.
   *  2) Multiple paragraphs in a string to be auto-split at line endings '\n\n`.
   * 	Disable this behavior with `generateParagraphs: false` and tweak line endings with `newLineToken:yourvalue`	 *
   *  3) An array of 1 or 2, or ArchieML text objects.
   *
   * @type { import("./index").ArchieMLText[] | string[] | string }
   */
  export let text = "";

  export let props = {};

  /** Whether to use svelte's unsanitized html render in text */
  export let renderHtml = true;

  /** If true, split string on `newLineToken` and generate paragraphs */
  // export let generateParagraphs = true;

  /**
   * When `generateParagraphs: true`, string or regex to split text into paragraphs.
   * Defaults to Google Doc-friendly newline characters.
   * @type string|RegExp
   */
  // export let newLineToken = "\n\n";

  /**
   * Unique element ID for paragraph element.
   * @type string|null
   */
  export let id = null;

  /**
   * Space-delimited class names to add to paragraph element.
   */
  export let className = "";

  let paragraphs;
  $: ({ value, className, id } = props);

  // add classes to g-text and reformat into a string
  $: classes = ["g-text"]
    .concat(className?.split(/ +/))
    .filter(Boolean)
    .join(" ");

  // many various forms of input
  $: {
    // array of text or objects with values [{type, value}, ...]
    // if (Array.isArray(text)) {
    //   // We don't really like having this archieml-ism in /shared/,
    //   // but it's more onerous to ask every component to filter for us
    //   if (text[0]["value"]) {
    //     paragraphs = text.map((t) => t.value);
    //   } else {
    //     paragraphs = text;
    //   }
    // } else if (generateParagraphs) {
    //   paragraphs = text.split(newLineToken);
    // } else {
    //   paragraphs = [text];
    // }

    if (props.length > 0) {
      paragraphs = [props];
    } else {
      paragraphs = [text];
    }
  }

  $: if (paragraphs.length > 1 && id) {
    console.warn(
      `shared/Text: id=${id} is not unique. The attribute will be ignored.`,
    );
    id = null;
  }
</script>

{#each paragraphs as paragraph}
  {#if renderHtml}
    <p {id} class={classes}>{@html paragraph}</p>
  {:else}
    <p {id} class={classes}>{paragraph}</p>
  {/if}
{/each}

<style>
  p {
    font-family: var(--g-body-font-family);
    font-weight: var(--g-body-font-weight);
    font-size: var(--g-body-font-size);
    line-height: var(--g-body-line-height);
    color: var(--g-body-color);
    background-color: var(--g-body-background-color);
    margin-left: var(--g-margin-left);
    margin-right: var(--g-margin-right);
    margin-inline: var(--g-margin-inline);
    margin-bottom: var(--g-body-margin-bottom);
    padding-top: var(--g-body-padding-top);
    padding-right: var(--g-body-padding-right);
    padding-bottom: var(--g-body-padding-bottom);
    padding-left: var(--g-body-padding-left);
    max-width: var(--g-width-body);
  }

  /* since body text implements --g-margin-inline above
	for the main body loop, nested text blocks need to unset it */
  :global(.g-margin-inline) p {
    margin-left: auto;
    margin-right: auto;
    margin-inline: auto;
  }

  p :global(a) {
    color: var(--g-color-anchor);
    text-decoration: underline;
    text-decoration-thickness: 1px;
  }

  p :global(a:hover) {
    text-decoration: none;
  }

  @media (min-width: 640px) {
    p {
      margin-left: auto;
      margin-right: auto;
      margin-inline: auto;
    }
  }

  p.g-labelblock {
    color: var(--color-content-secondary, #363636);
    font-family: var(--g-franklin);
    font-weight: 500;
    letter-spacing: 0.05em;
    font-size: 0.8125em;
    line-height: 1.125;
    margin: 35px auto 3px;
    text-transform: uppercase;
  }

  @media (min-width: 740px) {
    p.g-labelblock {
      font-size: 0.875em;
      line-height: 1.25;
    }
  }

  p.g-detailblock {
    color: var(--color-content-secondary, #363636);
    font-family: var(--g-franklin);
    font-weight: 500;
    font-size: 0.9375rem;
    line-height: 1.25rem;
  }

  @media (min-width: 740px) {
    p.g-detailblock {
      font-size: 1em;
      line-height: 1.375;
    }
  }
</style>
