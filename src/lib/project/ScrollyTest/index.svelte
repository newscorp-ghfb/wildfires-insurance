<script>
  import ScrollStory from "$lib/shared/ScrollStory/index.svelte";
  import Timelapse from "$lib/project/Timelapse/index.svelte";
  import { onMount } from "svelte";

  export let props;

  const { items } = props;

  let activeIndex = 0;
  let data = [];
  let longData = [];
  let seriesNames = [];
  let relevantYears = [];
  let url =
    "https://asset.wsj.net/wsjnewsgraphics/projects/archibald/1rn8r9wmBU0AB5MbgNEGb9gv-lRI2DVMSyKe34YKz3Ss-dev.json";

  let mounted;
  onMount(async () => {
    mounted = true;
    const response = await fetch(url);
    data = await response.json();
    data = data.simulations_new;

    // Extract series names (excluding "Year" and "Age")
    seriesNames = Object.keys(data[5]).filter(
      (d) => d !== "Year" && d !== "Age"
    );

    // Extract relevant years from items
    relevantYears = items
      .filter((item) => item.year !== "intro" && item.year !== "breakdown")
      .map((item) => parseInt(item.year));

    // Initialize longData with data for relevant years
    updateLongData();
  });

  function updateLongData() {
    // Ensure longData is updated based on relevantYears
    longData = seriesNames.flatMap((type) => {
      return relevantYears.flatMap((year) => {
        const item = data.find((d) => d.Year === year);
        return item
          ? [
              {
                Year: year,
                type,
                value:
                  item[type] !== null && item[type] !== "" ? item[type] : 0,
              },
            ]
          : [];
      });
    });
  }

  $: if (data.length > 0 && activeIndex !== null) {
    // Update longData based on activeIndex
    const activeData = data.find((d) => d.Year === relevantYears[activeIndex]);
    if (activeData) {
      longData = seriesNames.map((type) => ({
        Year: activeData.Year,
        Age: activeData.Age,
        type,
        value:
          activeData[type] !== null && activeData[type] !== ""
            ? activeData[type]
            : 0,
      }));
    }
  }

  // Log for debugging
  $: console.log("Filtered data:", data);
  $: console.log("Long data:", longData);
  $: console.log("Active Index:", activeIndex);
</script>

{#if mounted}
  <div class="container">
    <ScrollStory bind:activeIndex {items}>
      <div style="height: 400px;">
        <h2>{longData[0]?.Year}</h2>
        <p>Age: {longData[0]?.Age}</p>
      </div>
      <Timelapse
        data={longData}
        {seriesNames}
        activeSeries={seriesNames}
        {activeIndex}
      />
    </ScrollStory>
  </div>
{/if}

<style>
  h2 {
    font-size: 2em;
  }

  p {
    font-size: 1.5em;
  }
</style>
