<script>
  export let index = 0;
  export let items;
  const changeIndex = (/** @type {number} */ newIndex) => {
    if (newIndex >= 0 && newIndex <= items.length - 1) {
      index = newIndex;
    }
  };

  $: showPrevious = index > 0;
  $: showNext = index < items.length - 1;
</script>

<div class="g-slideshow_buttons">
  <button
    aria-label="previous slide"
    on:click={() => {
      changeIndex(index - 1);
    }}
    disabled={!showPrevious}
    class:active={showPrevious}
    class="g-slideshow_button g-previous"
  >
    <svg width="10" height="12" viewBox="0 0 10 12"
      ><path d="M6.60156 11.2002L1.40156 6.0002L6.60156 0.800197" /></svg
    >
  </button>
  <button
    aria-label="next slide"
    on:click={() => changeIndex(index + 1)}
    disabled={!showNext}
    class:active={showNext}
    class="g-slideshow_button g-next"
  >
    <svg width="10" height="12" viewBox="0 0 10 12" style="transform:scaleX(-1)"
      ><path d="M6.60156 11.2002L1.40156 6.0002L6.60156 0.800197" /></svg
    >
  </button>
</div>

<style>
  .g-slideshow_buttons {
    position: absolute;
    top: auto;
    left: auto;
    right: 0;
    bottom: 0;
    background-color: #fff;

    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  button {
    display: flex;
    align-items: center;
    background-color: transparent;

    width: 26px;
    height: 26px;
    border: 1px solid var(--color-stroke-quaternary, #dfdfdf);
    border-radius: 50%;
    transition: background-color 0.15s;
    cursor: pointer;
  }

  button.g-previous {
    margin-right: 10px;
  }

  button.g-next {
  }

  button svg {
    stroke: var(--color-stroke-quaternary, #dfdfdf);
    pointer-events: none;
    stroke-width: 1.5px;
    fill: none;
    margin: 0 auto;
  }

  button.active svg {
    stroke: var(--color-content-primary, #121212);
  }
</style>
