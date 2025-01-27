<script>
  export let currentTime;
  export let duration;

  function format(seconds) {
    if (isNaN(seconds)) return "...";

    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    if (seconds < 10) seconds = "0" + seconds;

    return `${minutes}:${seconds}`;
  }
</script>

<span class="time">{format(currentTime)} / {format(duration)}</span>

<style>
  .time {
    display: inline-block;
    position: relative;
    top: 0.1em;
    font: var(--g-custom-controls-font-shorthand);
    color: var(--g-custom-controls-color);
    opacity: var(--g-custom-controls-opacity);
  }

  .time:last-child {
    text-align: right;
  }
</style>
