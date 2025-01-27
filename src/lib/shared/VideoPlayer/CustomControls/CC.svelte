<script>
  import Error from "$lib/shared/Error/index.svelte";

  export let subtitles;
  export let currentTime;
</script>

{#if Array.isArray(subtitles)}
  <div class="g-video_subtitles">
    {#each subtitles as { text, start, end }}
      <p
        class="g-subtitle"
        class:active={start < currentTime && currentTime < end}
      >
        <span>{@html text}</span>
      </p>
    {/each}
  </div>
{:else}
  <Error>
    There was an error processing your subtitles file <code
      >_public/{subtitles}</code
    >. Check if the file exists and it’s not corrupted.
  </Error>
{/if}

<style>
  .g-video_subtitles {
    box-sizing: border-box;
    position: relative;
    width: 100%;
    text-align: center;
    display: flex;
    justify-content: center;
  }

  .g-subtitle {
    box-sizing: border-box;
    position: absolute;
    width: 100%;
    max-width: 18em;
    padding: 0 20px;
    bottom: 0;
    opacity: 0;
    font-family: var(--g-franklin);
    font-size: 1rem;
    line-height: 1.35;
    font-weight: 600;
    color: #fff;
    margin: 0 auto;
    text-align: center;
  }

  .g-subtitle.active {
    opacity: 1;
  }

  .g-subtitle span {
    display: inline;
    background-color: var(--g-custom-controls-background-color);
    padding-block: 0.075em;
    box-shadow:
      0.3em 0 0 var(--g-custom-controls-background-color),
      -0.3em 0 0 var(--g-custom-controls-background-color);
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  @media (min-width: 740px) {
    .g-subtitle {
      font-size: 1.3125rem;
    }
  }
</style>
