<script>
  import { LayerCake, Svg } from "layercake";
  import { scaleBand, scaleOrdinal } from "d3-scale";
  import { tweened } from "svelte/motion";
  import { cubicInOut } from "svelte/easing";

  import ClevelandDotPlot from "./_components/ClevelandDotPlot.svelte";
  import AxisX from "./_components/AxisX.svelte";
  import AxisY from "./_components/AxisY.svelte";
  import ScrollStory from "$lib/shared/ScrollStory/index.svelte";

  // This example loads csv data as json using @rollup/plugin-dsv
  import data_gen from "./_data/generation_data.csv";
  import data_avg from "./_data/average.csv";

  let activeIndex = 0;

  let items = [
    {
      text: "If looking at the median, millennials are doing better than boomers at their age ...",
      data: data_avg,
    },
    { text: "... but the wealth gap is much larger.", data: data_gen },
  ];

  // Reactive declaration to update `data` when `activeIndex` changes
  $: data = items[activeIndex].data;

  const yKey = "generation";
  $: xKey = Object.keys(data[0]).filter((d) => d !== yKey);

  const seriesColors = ["#f0c", "#00bbff", "#00e047", "#ff7a33"];

  const tweenOptions = tweened(0, {
    duration: 400,
    easing: cubicInOut,
  });

  $: data.forEach((d) => {
    xKey.forEach((name) => {
      d[name] = +d[name];
    });
  });
</script>

<div class="container">
  <ScrollStory bind:activeIndex {items}>
    <div class="chart-container">
      <LayerCake
        padding={{ right: 10, bottom: 20, left: 30 }}
        x={xKey}
        y={yKey}
        yScale={scaleBand().paddingInner(0.05).round(true)}
        xDomain={[-100000, 2544611]}
        xPadding={[10, 0]}
        zScale={scaleOrdinal()}
        zDomain={xKey}
        zRange={seriesColors}
        {data}
      >
        <Svg>
          <AxisX />
          <AxisY gridlines={false} />
          <ClevelandDotPlot />
        </Svg>
      </LayerCake>
    </div>
  </ScrollStory>
</div>

<style>
  .chart-container {
    width: 100%;
    height: 150px;
  }
</style>
