<script>
  import { onMount, afterUpdate } from "svelte";

  export let jsonUrls = [];
  export let activeIndex = 0;

  let boardsBySlide = [];
  let selectedBoards = [];
  let visibleSlides = [];
  let oldIndex = -1;
  let boardRefs = [];

  let maxHeight = 0;

  onMount(() => {
    fetchBoards();
    window.addEventListener("resize", updateSelectedBoards);
    return () => window.removeEventListener("resize", updateSelectedBoards);
  });

  async function fetchBoards() {
    try {
      const results = await Promise.all(
        jsonUrls.map(async (url) => {
          const r = await fetch(url);
          const j = await r.json();
          if (j.serverside?.data?.data?.styles) {
            injectStyles(j.serverside.data.data.styles);
          }
          return j?.serverside?.data?.data?.boards || [];
        })
      );
      boardsBySlide = results;
      updateSelectedBoards();
      initVisibleSlides();
    } catch {}
  }

  function injectStyles(css) {
    if (!css) return;
    const cleaned = css.replace(/<\/?script[^>]*>/g, "").trim();
    const el = document.createElement("style");
    el.type = "text/css";
    el.textContent = cleaned;
    document.head.appendChild(el);
  }

  function updateSelectedBoards() {
    const w = window.innerWidth;
    selectedBoards = boardsBySlide.map((arr) => {
      return (
        arr.find(
          (b) =>
            w >= parseInt(b.rawAttributes["data-min-width"] || "0") &&
            (b.rawAttributes["data-max-width"]
              ? w <= parseInt(b.rawAttributes["data-max-width"])
              : true)
        ) || null
      );
    });
  }

  function initVisibleSlides() {
    visibleSlides = selectedBoards.map((_, i) => i === activeIndex);
    oldIndex = activeIndex;
  }

  $: if (selectedBoards.length && visibleSlides.length) {
    if (activeIndex !== oldIndex) {
      doOverlapTransition(oldIndex, activeIndex);
      oldIndex = activeIndex;
    }
  }

  function doOverlapTransition(prev, next) {
    if (next >= 0) {
      visibleSlides[next] = true;
    }
    if (prev >= 0 && prev !== next) {
      setTimeout(() => {
        visibleSlides[prev] = false;
      }, 600);
    }
  }

  function getZIndex(i) {
    if (i === oldIndex && oldIndex > activeIndex) {
      return 3;
    }
    return visibleSlides[i] ? 2 : 1;
  }

  function prepareHtmlBlock(h = "") {
    return h.replace(/data-src/g, "src");
  }

  afterUpdate(() => {
    maxHeight = Math.max(
      ...boardRefs.map((ref) => ref?.getBoundingClientRect().height || 0)
    );
  });

  function saveRefAt(index) {
    return (el) => {
      boardRefs[index] = el;
    };
  }
</script>

<div class="slides-wrapper" style="min-height: {maxHeight}px">
  <div class="slides-container">
    {#each selectedBoards as board, i}
      {#if board}
        <div
          bind:this={boardRefs[i]}
          class="board"
          class:overlap={visibleSlides[i]}
          style="z-index: {getZIndex(i)}"
        >
          {@html prepareHtmlBlock(board.htmlBlock)}
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .slides-wrapper {
    position: sticky;
    top: 20vh;
    width: 100%;
    overflow: hidden;
  }

  .slides-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .board {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.6s ease;
    display: flex;
    justify-content: center;
  }

  .board.overlap {
    opacity: 1;
    pointer-events: auto;
  }
</style>
