<script>
  import { scriptDependencies } from "$lib/shared/ScriptTag/stores.js";
  import { onDestroy } from "svelte";

  export let src;

  // whether to include the script in the head or body
  export let inline = false;

  // includes each script only once
  const isFirst = !$scriptDependencies.includes(src);

  $scriptDependencies.push(src);

  onDestroy(() => {
    // so that the store will clear on localdev reload
    $scriptDependencies.splice($scriptDependencies.indexOf(src), 1);
  });
</script>

<svelte:head>
  {#if isFirst && !inline}
    <script {src}></script>
  {/if}
</svelte:head>

{#if isFirst && inline}
  <script {src}></script>
{/if}
