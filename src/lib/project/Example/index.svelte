<script>
  export let data, sentence, props;
</script>

<div class="chart-container">
  <p>Sentence: {sentence}</p>
  <p>Data: {data}</p>
  <p>Props: {props}</p>
</div>

<style>
  .chart-container {
    font-family: var(--g-franklin);
    height: 350px;
    border: 1px solid magenta;
  }
</style>
