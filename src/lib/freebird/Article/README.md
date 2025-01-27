# Article

Renders content from Scoop and Oak in Birdkit:

```
{.article}
  asset: 100000007123344
{}
```

This supports many features from Oak: text (and formatting), videos, images, audio, captions, subheds, slideshows, related articles, embedded interactives and custom AML.

You can use the experimental AML block in Oak to pass props the same way we do in Google Docs (ask in [#newsroom-help](https://nytnews.slack.com/archives/C04BEHUDE/p1697749396717029) for access). This uses the same body loop from birdkit so you can pass a custom component, import it in `+page.svelte` and render it. You can also render `ai2html`, or embed another interactive in your story and adjust some Wrapper props, etc.

The header it's not supported by default, you have to add it in your Google Doc.

You might see some [FOUC](https://gsap.com/resources/fouc/) after adding an embedded interactive. This will be more visible on development and won't really impact the published article.

## Custom body loop

This component will render any elements recursively using the body loop on `+page.svelte`.

```svelte
{:else if type === 'article'}
  <div id={props.slug}>
    <svelte:self data={{ ...data, body: props.body }} />
  </div>
```

But if you want more control over this you could pass a custom body loop on `+page.svelte`:

```svelte
<script>
  import CustomBodyLoop from '$lib/freebird/Article/example.svelte';
  ...etc
</script>

...etc
{:else if type === 'article'}
  <div id={props.slug}>
    <CustomBodyLoop  props={props.body}>
  </div>
```

We have added an example in `example.svelte`. You might need to adjust your GraphQL queries in `queries.js`.
