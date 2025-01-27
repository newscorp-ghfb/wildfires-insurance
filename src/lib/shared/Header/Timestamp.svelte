<script>
  export let language, updatedText, firstPublished, dateTime;

  // https://github.com/nytimes/news/blob/main/projects/components/src/Timestamp/index.js#L38-L54
  const updated = {
    en: "Updated ",
    es: "Actualizado ",
    "zh-cn": "最后更新于",
  };

  const updatedString = updated[language?.code] || updated.en;
</script>

{#if updatedText}
  <time
    id="g-interactive-timestamp-updated"
    class="g-interactive-timestamp-updated"
  >
    {updatedString}{updatedText}
  </time>
{:else if firstPublished}
  <time
    id="g-interactive-timestamp"
    class="g-interactive-timestamp"
    class:capitalize={language?.code === "en"}
    datetime={dateTime}
  >
    {firstPublished}
  </time>
{/if}

<style>
  time {
    font-weight: 500;
    font-size: 0.8125rem;
    line-height: 1.125rem;
    margin-right: auto;
    margin-top: 0;
    display: inline-block;
    color: #363636;
  }
  time.capitalize {
    text-transform: capitalize;
  }
  .g-interactive-timestamp-updated {
    color: #c00;
  }
</style>
