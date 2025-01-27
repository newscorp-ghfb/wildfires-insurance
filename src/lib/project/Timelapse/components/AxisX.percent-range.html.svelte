<script>
  import { getContext } from "svelte";

  const { xScale, yScale, percentRange } = getContext("LayerCake");

  // Existing props
  export let tickMarks = false;
  export let gridlines = true;
  export let tickMarkLength = 6;
  export let baseline = true; // Ensure baseline is enabled
  export let snapLabels = false;
  export let format = (d) => d;
  export let ticks = undefined;
  export let tickGutter = 0;
  export let dx = 0;
  export let dy = 0;
  export let units = $percentRange === true ? "%" : "px";

  // Determine if the xScale is using bandwidth
  $: isBandwidth = typeof $xScale.bandwidth === "function";

  // Get the tick values
  $: tickVals = Array.isArray(ticks)
    ? ticks
    : isBandwidth
      ? $xScale.domain()
      : typeof ticks === "function"
        ? ticks($xScale.ticks())
        : $xScale.ticks(ticks);

  // Calculate half the bandwidth for centered ticks
  $: halfBand = isBandwidth ? $xScale.bandwidth() / 2 : 0;

  // Calculate the position of the baseline (y = 0)
  $: baselinePos = $yScale(0);

  // Ensure that baselinePos is a valid number
  $: baselinePos = isNaN(baselinePos) ? 0 : baselinePos;
</script>

<div class="axis x-axis" class:snapLabels>
  {#if baseline === true}
    <div class="baseline" style="top:{baselinePos}{units}; width:100%;"></div>
  {/if}

  {#each tickVals as tick, i (tick)}
    {@const tickValUnits = $xScale(tick)}

    {#if gridlines === true}
      <div
        class="gridline"
        style:left="{tickValUnits}{units}"
        style="top:0; bottom:0;"
      ></div>
    {/if}
    {#if tickMarks === true}
      <div
        class="tick-mark"
        style:left="{tickValUnits + halfBand}{units}"
        style:height="{tickMarkLength}px"
        style:bottom="{-tickMarkLength - tickGutter}px"
      ></div>
    {/if}
    <div
      class="tick tick-{i}"
      style:left="{tickValUnits + halfBand}{units}"
      style="top:calc(100% + {tickGutter}px);"
    >
      <div
        class="text"
        style:top="{tickMarkLength}px"
        style:transform="translate(calc(-50% + {dx}px), {dy}px)"
      >
        {format(tick)}
      </div>
    </div>
  {/each}
</div>

<style>
  .axis,
  .tick,
  .tick-mark,
  .gridline,
  .baseline {
    position: absolute;
  }
  .axis {
    width: 100%;
    height: 100%;
  }
  .tick {
    font-size: 11px;
  }

  .gridline {
    border-left: 1px dashed #aaa;
  }

  .tick-mark {
    border-left: 1px solid #aaa;
  }
  .baseline {
    border-top: 1px solid #aaa;
    position: absolute;
  }

  .tick .text {
    color: #666;
    position: relative;
    white-space: nowrap;
    transform: translateX(-50%);
  }
  /* This looks a little better at 40 percent than 50 */
  .axis.snapLabels .tick:last-child {
    transform: translateX(-40%);
  }
  .axis.snapLabels .tick.tick-0 {
    transform: translateX(40%);
  }
</style>
