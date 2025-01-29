<script>
  import ScrollStory from "$lib/shared/ScrollStory/index.svelte";
  import AItoHtml from "$lib/shared/AitoHtml/index.svelte";
  import "./app.css";
  import { onMount } from "svelte";

  const url =
    "https://asset.wsj.net/wsjnewsgraphics/projects/archibald/1jhZ8PxcygA3YCPJYv1r1oJE-2i_z_Y-XnWEQgebAWZg-dev.json";

  let mounted = false;
  let loading = false;
  export let data;
  let items = [];

  onMount(async () => {
    const response = await fetch(url);
    data = await response.json();
    mounted = true;
    items = data.slides;

    setTimeout(() => {
      loading = true;
    }, 500); // Adjust the delay as necessary
  });

  // $: console.log(data);

  let activeIndex = 0;

  const jsonUrls = [
    "https://www.wsj.com/ai2html/fb2465a6-3c32-40ec-b5d4-4bc2f7488d00/inset.json",
    "https://www.wsj.com/ai2html/d308ed39-2859-41b6-a544-070a4ddd3afb/inset.json",
    "https://www.wsj.com/ai2html/57366dbb-21e7-427c-8318-73cc732b962a/inset.json",
    "https://www.wsj.com/ai2html/3a4bd1f0-7b0f-40b3-ac7b-afc390cbc186/inset.json",
    "https://www.wsj.com/ai2html/59ba318e-6d9e-4d60-a484-34556d83ff87/inset.json",
  ];

  function handleIndexChange(event) {
    activeIndex = event.detail.index;
  }
</script>

{#if mounted}
  <div class="container">
    <AItoHtml {jsonUrls} {activeIndex} />

    <!-- ScrollStory -->
    <div class="scroll-content">
      <ScrollStory
        {items}
        on:indexchange={handleIndexChange}
        threshold={0.85}
        textStartPosition="15rem"
        itemSpacing="100vh"
      />
    </div>
  </div>
{/if}

<style>
  .scroll-content {
    position: relative;
    z-index: 1;
  }
</style>
