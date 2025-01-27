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

<div class="g-tapstory_buttons">
  <button
    aria-label="previous slide"
    on:click={() => {
      changeIndex(index - 1);
    }}
    disabled={!showPrevious}
    class:active={showPrevious}
    class="g-tapstory_button g-previous"
    ><p>Previous</p>
  </button>
  <button
    aria-label="next slide"
    on:click={() => changeIndex(index + 1)}
    disabled={!showNext}
    class:active={showNext}
    class="g-tapstory_button g-next"
    ><p>Next</p>
  </button>
</div>

<style>
  .g-tapstory_buttons {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: space-between;
  }

  .g-tapstory_button {
    height: 100%;
    background-color: transparent;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .g-tapstory_button.active {
    opacity: 1;
  }

  .g-tapstory_button.g-previous {
    width: 30%;
    padding-left: 20px;
    text-align: left;
  }

  .g-tapstory_button.g-next {
    width: 40%;
    padding-right: 20px;
    text-align: right;
  }

  p {
    display: inline-block;
    padding: 3px;
    background-color: red;
    color: #fff;
  }
</style>
