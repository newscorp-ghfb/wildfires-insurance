<script>
  import { onMount } from "svelte";

  export let jsonUrls = [];
  export let activeIndex = 0;

  let boardsBySlide = [];
  let currentBoard = null;
  let nextBoard = null;
  let nextBoardElement = null;
  let isInitialized = false;
  let isVisible = false;
  let isNextBoardLoaded = false;

  async function fetchBoards() {
    try {
      console.log("Fetching boards...");
      const results = await Promise.all(
        jsonUrls.map(async (url) => {
          const response = await fetch(url);
          const jsonData = await response.json();
          console.log(`Fetched data from ${url}:`, jsonData);

          if (jsonData.serverside?.data?.data?.styles) {
            injectStyles(jsonData.serverside.data.data.styles);
          }

          return jsonData?.serverside?.data?.data?.boards || [];
        })
      );

      boardsBySlide = results;
      console.log("Boards by slide:", boardsBySlide);
      initializeCurrentBoard();
    } catch (error) {
      console.error("Error loading JSON data:", error);
    }
  }

  function injectStyles(cssString) {
    if (!cssString || typeof cssString !== "string") return;

    const sanitizedStyles = cssString.replace(/<\/?script[^>]*>/g, "").trim();
    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.textContent = sanitizedStyles;
    document.head.appendChild(styleElement);
  }

  function initializeCurrentBoard() {
    const width = window.innerWidth;
    const boards = boardsBySlide[activeIndex] || [];

    currentBoard =
      boards.find(
        (board) =>
          width >= parseInt(board.rawAttributes["data-min-width"] || "0") &&
          (board.rawAttributes["data-max-width"]
            ? width <= parseInt(board.rawAttributes["data-max-width"])
            : true)
      ) || null;

    updateNextBoard();
    isInitialized = true;
    isVisible = true;
    console.log("Initialized current board:", currentBoard);
  }

  function updateNextBoard() {
    const width = window.innerWidth;
    const boards = boardsBySlide[activeIndex + 1] || [];

    nextBoard =
      boards.find(
        (board) =>
          width >= parseInt(board.rawAttributes["data-min-width"] || "0") &&
          (board.rawAttributes["data-max-width"]
            ? width <= parseInt(board.rawAttributes["data-max-width"])
            : true)
      ) || null;

    console.log("Next board updated:", nextBoard);
  }

  async function updateCurrentBoard() {
    if (!boardsBySlide.length || !isInitialized) return;

    const width = window.innerWidth;
    const boards = boardsBySlide[activeIndex] || [];
    const newBoard =
      boards.find(
        (board) =>
          width >= parseInt(board.rawAttributes["data-min-width"] || "0") &&
          (board.rawAttributes["data-max-width"]
            ? width <= parseInt(board.rawAttributes["data-max-width"])
            : true)
      ) || null;

    if (JSON.stringify(newBoard) === JSON.stringify(currentBoard)) return;

    isVisible = false;

    await new Promise((resolve) => setTimeout(resolve, 100));

    currentBoard = newBoard;
    isVisible = true;
    updateNextBoard();
  }

  $: {
    if (boardsBySlide.length > 0 && isInitialized) {
      console.log("Active index changed:", activeIndex);
      updateCurrentBoard();
    }
  }

  onMount(() => {
    console.log("Component mounted, starting fetchBoards...");
    fetchBoards();
    window.addEventListener("resize", updateCurrentBoard);
    return () => {
      console.log("Component unmounted, cleaning up...");
      window.removeEventListener("resize", updateCurrentBoard);
    };
  });

  function prepareHtmlBlock(htmlBlock) {
    return htmlBlock.replace(/data-src/g, "src");
  }

  function checkImagesLoaded() {
    const images = document.querySelectorAll(`#g-market_cap-box img`);
    let loaded = 0;

    images.forEach((img) => {
      if (img.complete) {
        loaded++;
      } else {
        img.onload = () => {
          loaded++;
          if (loaded === images.length) {
            isNextBoardLoaded = true;
            isVisible = true;
          }
        };
      }
    });

    if (images.length === 0) {
      isNextBoardLoaded = true;
      isVisible = true;
    }
  }
</script>

<div class="background-container">
  {#if isInitialized && currentBoard}
    <div
      id="g-market_cap-box"
      class:is-visible={isVisible}
      class:is-hidden={!isVisible}
    >
      {@html prepareHtmlBlock(currentBoard?.htmlBlock || "")}
    </div>

    {#if nextBoard}
      <div
        id="next-board"
        class="next-board"
        style="display: none;"
        bind:this={nextBoardElement}
        on:load={checkImagesLoaded}
      >
        {@html prepareHtmlBlock(nextBoard?.htmlBlock || "")}
      </div>
    {/if}
  {/if}
</div>

<style>
  .background-container {
    position: sticky;
    top: 0%;
    width: 100%;
    min-height: 100vh;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #g-market_cap-box {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.1s ease-out;
    z-index: 1;
  }

  #g-market_cap-box.is-visible {
    opacity: 1;
    pointer-events: auto;
    z-index: 2;
  }

  #g-market_cap-box.is-hidden {
    opacity: 0;
    pointer-events: none;
    z-index: 1;
  }

  /* Estilo para el siguiente board */
  .next-board {
    display: none;
  }
</style>
