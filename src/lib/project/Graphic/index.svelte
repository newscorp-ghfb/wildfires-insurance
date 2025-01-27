<script>
  import { onMount } from "svelte";
  import Bars from "$lib/media/ai2html/millennials_bar.svelte";
  let component;
  let module;
  export let props;

  async function loadComponent() {
    const module = await import(
      `$lib/media/ai2html/${props.componentName}.svelte`
    );
    component = module.default;
  }

  onMount(() => {
    // console.log(props.componentName);
    loadComponent();
  });
</script>

<div class="g-ai2html-file">
  {#if component}
    <svelte:component this={component} />
  {/if}
</div>
