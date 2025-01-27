<script>
  import ScrollStory from "$lib/shared/ScrollStory/index.svelte";
  import AItoHtml from "$lib/shared/AitoHtml/index.svelte";
  import "./app.css";

  let activeIndex = 0;
  let items = [
    {
      id: "slide-1",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin accumsan.",
    },
    {
      id: "slide-2",
      text: "Vivamus luctus urna sed urna ultricies ac tempor dui sagittis.",
    },
    {
      id: "slide-3",
      text: "In condimentum facilisis porta. Sed nec diam eu diam mattis viverra.",
    },
    {
      id: "slide-4",
      text: "In condimentum facilisis porta. Sed nec diam eu diam mattis viverra.",
    },
    {
      id: "slide-5",
      text: "In condimentum facilisis porta. Sed nec diam eu diam mattis viverra.",
    },
    {
      id: "slide-6",
      text: "In condimentum facilisis porta. Sed nec diam eu diam mattis viverra.",
    },
  ];

  const jsonUrls = [
    "https://www.wsj.com/ai2html/fb2465a6-3c32-40ec-b5d4-4bc2f7488d00/inset.json",
    "https://www.wsj.com/ai2html/d308ed39-2859-41b6-a544-070a4ddd3afb/inset.json",
    "https://www.wsj.com/ai2html/b24d6a7e-8905-43b0-809b-3dfc8bd8c47d/inset.json",
    "https://www.wsj.com/ai2html/57366dbb-21e7-427c-8318-73cc732b962a/inset.json",
    "https://www.wsj.com/ai2html/3a4bd1f0-7b0f-40b3-ac7b-afc390cbc186/inset.json",
    "https://www.wsj.com/ai2html/59ba318e-6d9e-4d60-a484-34556d83ff87/inset.json",
  ];

  function handleIndexChange(event) {
    activeIndex = event.detail.index;
  }
</script>

<div class="container">
  <AItoHtml {jsonUrls} {activeIndex} />

  <!-- ScrollStory -->
  <div class="scroll-content">
    <ScrollStory
      {items}
      on:indexchange={handleIndexChange}
      threshold={0.75}
      itemSpacing="70vh"
    />
  </div>
</div>

<style>
  .scroll-content {
    position: relative;
    z-index: 1;
  }
</style>
