<script>
  import Asset from "$lib/freebird/Asset/index.svelte";
  import Embed from "$lib/freebird/Embed/index.svelte";
  import Graphic from "$lib/freebird/Graphic/index.svelte";
  import Image from "$lib/freebird/Image/index.svelte";
  import Missing from "$lib/freebird/Missing/index.svelte";
  import Paid from "$lib/freebird/Paid/index.svelte";
  import Subhed from "$lib/freebird/Subhed/index.svelte";
  import Text from "$lib/freebird/Text/index.svelte";
  import Video from "$lib/freebird/Video/index.svelte";
  import Media from "$lib/shared/Media/index.svelte";
  // import Header from '$lib/freebird/Header/index.svelte';
  export let props;
</script>

<div id={props.slug} class="g-article" data-slug={props.slug}>
  {#each props.body || [] as block}
    {#if block.type === "embeddedheader"}
      <div class="g-article-cover {block.style}">
        <!-- <Header props={block.value} /> -->
        <h1>{block.value.headline}</h1>
        <p>{block.value.leadin}</p>
        {#if block.value.media}
          <Media props={block.value} />
        {/if}
      </div>
    {:else if block.type === "text"}
      <Text props={block.value} />
    {:else if block.type === "subhed"}
      <Subhed props={block.value} />
    {:else if block.type === "image"}
      <Image props={block.value} />
    {:else if block.type === "video"}
      <Video props={block.value} />
    {:else if block.type === "embed"}
      <Embed props={block.value} />
    {:else if block.type === "ad"}
      <Paid props={block.value} />
    {:else if block.type === "asset"}
      <Asset props={block.value} />
    {:else if block.type === "graphic"}
      <Graphic props={block.value} />
    {:else}
      <Missing type={block.type} />
    {/if}
  {/each}
</div>

<style>
  .g-article {
    margin: 0 auto 40px;
    padding: 20px 0;
  }
  h1,
  p {
    display: block;
    margin: 20px auto;
    max-width: var(--g-width-body);
  }
</style>
