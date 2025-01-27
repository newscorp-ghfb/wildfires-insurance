<script>
  export let currentTime;
  export let duration;

  let progressElBox; // getBoundingClientRect()

  function startScrubbing(e, clientX) {
    progressElBox = e.target.getBoundingClientRect();
    scrub(clientX);
  }

  function scrub(clientX) {
    if (!duration) return; // video not loaded yet
    const { left, right } = progressElBox;
    currentTime = (duration * (clientX - left)) / (right - left);
  }

  function handleMouseDown(e) {
    e.preventDefault();
    startScrubbing(e, e.clientX);

    function handleMouseMove(e) {
      scrub(e.clientX);
    }

    function handleMouseUp() {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  function handleTouchStart(e) {
    e.preventDefault();

    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const finger = touch.identifier;
    startScrubbing(e, touch.clientX);

    function handleTouchMove(e) {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      if (touch.identifier !== finger) return;
      scrub(touch.clientX);
    }

    function handleTouchEnd() {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    }

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  }
</script>

<div class="g-progress-bar">
  {#if currentTime && duration}
    <progress value={(currentTime / duration) * 100 || 0} max="100" />
    <button on:mousedown={handleMouseDown} on:touchstart={handleTouchStart} />
  {/if}
</div>

<style>
  .g-progress-bar {
    --progress-bar-height: 5px;
    box-sizing: border-box;
    width: 100%;
    height: var(--progress-bar-height);
    background-color: rgba(255, 255, 255, 0.24);
    pointer-events: all;
    cursor: pointer;
    border-radius: var(--progress-bar-height);
    overflow: hidden;
    position: relative;
  }

  button,
  progress {
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    -webkit-appearance: none;
    appearance: none;
    border: none;
    background: none;
  }

  progress::-webkit-progress-bar {
    background-color: transparent;
  }

  progress::-webkit-progress-value {
    background-color: var(--g-custom-controls-color);
    opacity: var(--g-custom-controls-opacity);
  }

  progress:hover::-webkit-progress-value {
    background-color: var(--g-custom-controls-color);
    opacity: 1;
  }

  progress::-moz-progress-bar {
    background-color: var(--g-custom-controls-color);
    opacity: var(--g-custom-controls-opacity);
  }

  progress:hover::-moz-progress-bar {
    background-color: var(--g-custom-controls-color);
    opacity: 1;
  }
</style>
