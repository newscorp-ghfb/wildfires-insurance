<script>
  import { getContext } from "svelte";

  const { data, xScale, yScale } = getContext("LayerCake");

  export let fill = "#00e047";
  export let negativeFill = "#ff0000";
  export let stroke = "#000";
  export let strokeWidth = 0;
  export let showLabels = false;

  const xKey = "type";
  const yKey = "value";

  // Fixed baseline position
  $: baselinePos = $yScale(0);

  // Calculate column width and height
  $: columnWidth = (d) => {
    const vals = $xScale(d[xKey]);
    return Math.abs(vals[1] - vals[0]);
  };

  $: columnHeight = (d) => {
    const yValue = $yScale(d[yKey]);
    return Math.abs(yValue - baselinePos); // Ensure columns grow above/below baseline
  };

  $: yPos = (d) => {
    const yValue = $yScale(d[yKey]);
    return yValue > baselinePos ? baselinePos : yValue; // Adjust y position relative to baseline
  };

  $: getFill = (d) => ($yScale(d[yKey]) > baselinePos ? negativeFill : fill);
</script>

<g class="column-group">
  {#each $data as d, i (d[xKey])}
    {@const colHeight = columnHeight(d)}
    {@const xGot = $xScale(d[xKey])}
    {@const xPos = Array.isArray(xGot) ? xGot[0] : xGot}
    {@const colWidth = $xScale.bandwidth ? $xScale.bandwidth() : columnWidth(d)}
    {@const yPosition = yPos(d)}
    <rect
      class="group-rect"
      data-id={i}
      data-range={xPos}
      data-count={d[yKey]}
      x={xPos}
      y={yPosition}
      width={colWidth}
      height={colHeight}
      fill={getFill(d)}
      {stroke}
      stroke-width={strokeWidth}
    />
    {#if showLabels && d[yKey]}
      <text x={xPos + colWidth / 2} y={yPosition - 5} text-anchor="middle">
        {d[yKey]}
      </text>
    {/if}
  {/each}
</g>

<style>
  text {
    font-size: 12px;
  }
</style>
