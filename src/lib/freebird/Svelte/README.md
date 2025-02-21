We’ve added a new {.svelte} component that makes it simpler to add custom svelte components to Freebird projects. (The previous way of adding components in page.svelte is still supported.) To use it, add this to your Google doc (or via the Freebird Helper):

```
{.svelte}
  component: Example
  marginInline: true
  hed: My graphic
{}
```

Freebird will then look for a svelte component called Example in the project folder (src/lib/project/) and add it to your project. To make your own component, just duplicate the Example folder, rename it, and update the component name above.

This {.svelte} component comes with all the usual wrapper properties, like hed, caption, source, etc. For those who need full control over how the component looks and behaves, you can optionally remove the wrapper like this:

```
{.svelte}
  component: Example
  # removes the wrapper
  wrapper: false
{}
```

We’ve also simplified how to access properties passed in from the Google doc. (e.g. you can refer in your component to sentence instead of props.sentence)

```
{.svelte}
  component: Example
  sentence: Hello world
{}
```

In your component:

```html
<script>
  export let sentence;
  console.log(sentence);
</script>
```
