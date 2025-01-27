<script>
  import { tweened } from "svelte/motion";
  import { cubicInOut } from "svelte/easing";
  import { LayerCake, ScaledSvg, Html } from "layercake";
  import { scaleBand } from "d3-scale";
  import { onMount } from "svelte";
  import { min, max } from "d3-array";

  import Column from "$lib/project/Timelapse/components/Column.svelte";
  import AxisX from "$lib/project/Timelapse/components/AxisX.percent-range.html.svelte";
  import AxisY from "$lib/project/Timelapse/components/AxisY.percent-range.html.svelte";

  export let data = [];
  export let seriesNames;

  let baselinePos = 80;

  let mounted;

  onMount(async () => {
    mounted = true;
  });

  const xKey = "type";
  const yKey = "value";

  function sanitizeValue(value) {
    return isNaN(value) ? 0 : value;
  }

  function createTweenedData(data) {
    return data.map((d) => ({
      ...d,
      tweenedValue: tweened(sanitizeValue(d[yKey]), {
        duration: 400,
        easing: cubicInOut,
      }),
    }));
  }

  let tweenedData = createTweenedData(data);

  function updateTweenedData(newData) {
    newData.forEach((newDatum, i) => {
      if (tweenedData[i]) {
        tweenedData[i].tweenedValue.set(sanitizeValue(newDatum[yKey]));
      } else {
        tweenedData[i] = {
          ...newDatum,
          tweenedValue: tweened(sanitizeValue(newDatum[yKey]), {
            duration: 400,
            easing: cubicInOut,
          }),
        };
      }
    });
  }

  $: if (data.length) {
    updateTweenedData(data);
  }

  let renderedData = [];

  $: {
    renderedData = [];
    tweenedData.forEach((tween, i) => {
      tween.tweenedValue.subscribe((value) => {
        renderedData[i] = {
          ...tween,
          [yKey]: value,
        };
      });
    });
  }

  // Update yDomain to include negative values
  $: yDomain = [
    Math.min(
      0,
      min(renderedData, (d) => d[yKey])
    ), // Minimum value or 0
    null, // Maximum value
  ];
</script>

<div class="chart-container">
  {#if mounted}
    <LayerCake
      ssr
      percentRange
      position="absolute"
      padding={{ top: 0, right: 0, bottom: 20, left: 20 }}
      x={xKey}
      y={yKey}
      xScale={scaleBand().paddingInner(0.028).round(true)}
      xDomain={seriesNames}
      {yDomain}
      data={renderedData}
    >
      <Html>
        <AxisX gridlines baseline snapLabels />
        <AxisY gridlines={false} tickMarks {baselinePos} />
      </Html>
      <ScaledSvg>
        <Column {baselinePos} />
      </ScaledSvg>
    </LayerCake>
  {/if}
</div>
