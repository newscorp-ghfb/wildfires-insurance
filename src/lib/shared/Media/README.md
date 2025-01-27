# Media

The `Media` component -- along with the `media` prop in our ArchieML documents -- bundles common, opinionated visual templates and configurations, like: images (single or responsive, local or Scoop), video (VHS, VideoTape, Scoop, Svelte VideoPlayer), Scoop Slide Shows, Scoop Embeds, HTML / ai2html fragments, and Audio.

The component is meant to be used in other Freebird templates and custom projects. It is not a stand-alone template for inclusion in our Google Docs, and it doesn't exclude developers from developing alternative media templates.

## TL;DR

Your ArchieML:

```archieml
{.myCustomComponent}
	media: _images/localimage.jpg
	lazy: false

	// wrapper
	credit: Doug Mills/The New York Times
{}
```

or

```archieml
{.myCustomComponent}
	media:  https://int.nyt.com/data/videotape/finished/2022/10/mideast-heat/mideast_006-1254w.mp4
	autoplay: true
	loop: true
	controls: false
	muted: true

	// wrapper
	credit: Emily Rhyne/The New York Times
	label: 115°
{}
```

Your component:

```svelte
<script>
  import Wrapper from '$lib/shared/Wrapper/index.svelte';
  import Media from '$lib/shared/Media/index.svelte';
  export let props = {};
</script>

<Wrapper {props} outerWrapper={true}>
  <div class="myProject">
    <h2>My custom graphic supports images and video (and other things, too!)</h2>
    <Media {props}>
  </div>
</Wrapper>

<style>
  .myProject{

  }
</style>
```

## Overview

Under the hood, there are a few important concepts to note:

- On page load, our [build process recursively looks](https://github.com/newsdev/birdkit/blob/8144e82ccbf28305a232fac147cd0b1f061955eb/packages/template-freebird/src/lib/freebird/resolve.server.js#L475-L487) for _any_ `media` prop in our ArchieML/Google Docs. If that prop is a string (like `_images/bird.png` or a Scoop ID), the `resolveMediaProp()` utility will attempt to "resolve" that string value into a "processedMedia" object, which is the generated or Scoop-retrieved metadata needed to render the correct media template.
- The `$lib/shared/` directory contains our lowest-level components, ones that don't export a Freebird-style `export let props` object. These components are designed for heavy reuse, including media-specific templates. For example, the `$lib/shared/ImageLoader` component can be used with any source of images that have multiple renditions, like Scoop Images or our [local, responsive renditions](../../../../public/_images/) automatically generated from files in `_images`. It can be used stand-alone, with or without the `media` prop or `Media` component.
- The `Media` component is an intermediary between the output objects of `resolveMediaProp`/ArchieML and the best `$lib/shared/` template to render it.

The [Wrapper](../Wrapper/) and our "media middleware" -- the combination of the `Media` component and the `media` prop -- are the basis for all the `$lib/freebird/` media templates (like `Image`/`{.image}` and `Video`/`{.video}`, etc), and serve up nested media in more complicated Freebird components like [ScrollingSlides](../../freebird/ScrollingSlides/) and the [Grid](../../freebird/Grid/).

## Basic Use

In its most common form, the media middleware looks for specifically formulated media prop values in ArchieML.

It works for any of these media types.

### Local Images:

#### Responsive Local Image

Images in the `_images` folder have have multiple renditions automatically generated and optimized on your behalf for responsive image rendering, meaning the smallest image appropriate is downloaded by the reader's browser.

The sizes generated can be tweaked in your project's `birdkit.config.js`.

See: [Freebird Image Sizer](../../../../public/_images/)

```
{.myCustomImageComponent}
  media: _images/localimage.jpg
{}
```

#### Non-responsive Local Image

Images in the `_assets`, `_big_assets` folders, or any nested folder within them, will be served as-is, without any image sizing or processing.

```
{.myCustomImageComponent}
  media: _assets/transparent-foreground.png
{}
```

### Scoop Image, Video, Audio or Embed

The middleware will query Scoop for the given ID and will automatically use the correct template based on media type.

```
{.myCustomScoopComponent}
  media: myscoopvideoid
{}
```

### VideoTape URL

Use any of the standard encode rendition urls. The middleware will automatically generate the urls to other, standard encodes and use the best version for the given viewport.

(If your project uses non-default rendition widths, you'll need -- for now -- to manually update the sizes in `getVideotapeRenditions()`)

```
{.myCustomVideoTapeComponent}
  media: https://videotapeurl...
{}
```

### ai2html or HTML Fragments

HTML fragments in `$lib/graphics/`, which is the default output location for ai2html, are referenced by just `slug.html`, with no other folders needed.

```
{.myCustomGraphicComponent}
  media: myai2htmlSlug.html
{}
```

### Your Custom Component

All of the above examples can render with the `Media` component like so:

```svelte
<script>
  import Media from "$lib/shared/Media/index.svelte";
  export let props = {};
</script>

<Media {props} />
```

#### Using a Specific Media template

The media middleware and component use the characteristics of the various slugs, paths and IDs to determine which of the underlying `$lib/shared/` components can render it.

There are times when you may want to specify an exact media template to use. For example, we have several video players: [VHS](../VHS/), our "Svelte video player" ([PR in process](#677)) and an almost vanilla [Video element component](../Video/). If you want to specify the VHS player, you'd pass in the optional `mediaComponent` prop, like so:

```
{.myCustomVideo}
  media: myscoopvideoid
  mediaComponent: vhs
{}
```

See the full listing of supported asset types and corresponding `$lib/shared/*` component handlers in [AssetTypeToComponentMapping](https://github.com/newsdev/birdkit/blob/main/packages/template-freebird/src/lib/shared/Media/constants.ts#L17-L29). Whenever you see multiple components in the array value, any of those case insensitive slugs can be passed to `component` in your ArchieML doc.

## Including Captions and Credits

We often include consistently styled metadata like headlines, credits or on-art labels with our visual assets. The `Media` component and underlying `$lib/shared/` media components, by design, have no awareness of these, or even the `maxWidth` or `marginInline` in which they reside.

Media size and margin, and the surrounding text are controlled by the [Wrapper component](../Wrapper/).

Wrapper in red. Media in blue.

![image](https://github.com/newsdev/birdkit/assets/294614/0361c51f-8300-4c23-9cee-82d7ae830a75)

## Component Props

When implementing in a custom project, `$lib/shared/Media/index.svelte` accepts two props:

```svelte
<Media {props} expectedType={"image"} />
```

| prop         | type   | default | description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------ | ------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| props        | object | {}      | Container for all possible Google Doc options.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| expectedType | string | ''      | Optional, and rarely need in custom components. By default, the media element will render any supported media type. If this value is set, an error will be thrown if the given media is not of the `expectedType`. A list of expected types is in [AssetTypeToExpectedType](https://github.com/newsdev/birdkit/blob/1cc8435438ada09f06db88b060aa0b4c04337eb9/packages/template-freebird/src/lib/shared/Media/constants.ts#L3-L15). Additionally, the expectedType informs the inclusion and use of certain ARIA attributes. |

## Google Doc Props (props.\*)

The following are automatically extracted from the props object and available to any component using the `Media` component.

| prop           | type        | default | used with                           | description                                                                                                                                                                 |
| -------------- | ----------- | ------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| media          | MediaObject | none    | all                                 | The required MediaObject representation of a resolved `media` prop string.                                                                                                  |
| mediaComponent | string      | ''      | All                                 | Render media with non-default component. Most commonly for `{.video}` to chose between our (svelte) `videoplayer`, `vhs` and (vanilla) `video`                              |
| lazy           | boolean     | true    | Image/ImageLoader/Svelte Video (tk) | Lazy load media if possible.                                                                                                                                                |
| role           | string      | 'img'   | all                                 | Informs various ARIA settings and attributes in generated markup, based on media type and given `altText`. The default is usually correct. See Jamie for advanced guidance. |
| altText        | string      | ''      | all                                 | Alternative text for screen readers.                                                                                                                                        |
| poster         | string      | ''      | Video/VHS/SvelteVideo               | Manually specify, or override the default, video poster URL.                                                                                                                |
| autoplay       | boolean     | false   | Video/VHS/SvelteVideo               |                                                                                                                                                                             |
| controls       | boolean     | true    | Video/VHS/SvelteVideo               |                                                                                                                                                                             |
| loop           | boolean     | false   | Video/VHS/SvelteVideo               |                                                                                                                                                                             |
| muted          | boolean     | false   | Video/VHS/SvelteVideo               |                                                                                                                                                                             |
| playsinline    | boolean     | false   | Video                               |                                                                                                                                                                             |
| preload        | string      | 'auto'  | Video                               | "auto", "metadata"" or "none". See [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#attributes).                                         |
| ratio          | string      | '16:9'  | VHS                                 |                                                                                                                                                                             |
| ads            | boolean     | false   | VHS                                 |                                                                                                                                                                             |
| vhsOptions     | object      | {}      | VHS                                 | Additional VHS-specific options. See [VHS Docs](https://github.com/nytimes/vhs3/blob/main/doc/OPTIONS.md).                                                                  |

## Advanced Use

### Don't Use the Media Component or Prop

If you don't need any of the automatic `media` prop functionality and don't want to grok the complexities of the `Media` component, you don't need to!

Your component can, for example, contain a native media element that uses a single, local rendition that will be served off our CDN in production.

```archieml
{.myComponent}
  image: _assets/turkey.jpg
  alt: Map of Turkey
{}
```

```svelte
<script>
  export let props;
</script>

<img src={props.image} alt={props.alt} />
```

And if you want (and you should!), you can use our [low-level components](../) directly. For example, the `$lib/shared/Image` component is a light wrapper around the native image element, exporting common configuration, and includes a progressive fade-in enhancement only if JavaScript is enabled. The `$lib/shared/Label` component is the exact same one used automatically by the `Wrapper`, with various position and themes available.

```svelte
<script>
  import Image from "$lib/shared/Image/index.svelte";
  import Label from "$lib/shared/Label/index.svelte";
  export let props;

  let loaded;

  $: console.log(`Image loaded: ${loaded}`);
</script>

<div class="g-myMap">
  <Label
    label={"Key Locations"}
    theme={"black-on-white"}
    position={"bottom-left"}
  />
  <Image src={props.image} altText={props.alt} lazy={true} bind:loaded />
</div>

<style>
  .g-myMap {
    position: relative;
  }
</style>
```

Available components include video players, a Graphic (html) component, image loader, and non-media functionality like the Grid and ScrollStory. [See all `$lib/shared` components](../)

### Use the `media` Prop Without the `Media` Component

Don't want to use `Media` in your custom component? Skip it while taking advantage of the structured data coming from the media middleware.

```archieml
{.myImageZoomer}
  media: _images/congress.jpg
{}
```

```svelte
<script>
  import { getLocalResponsiveImageRenditions } from "$lib/shared/Media/utils.js";

  export let props = {};

  let { media } = props;

  // manually work with the various pieces of responsive image metadata
  const { slug, ratio, extensions, widths, hasRetina } = media;

  // or, take advantage of the existing helpers instead
  const renditions = getLocalResponsiveImageRenditions(media);

  console.log("My smallest image URL is:", renditions[0].url);
</script>
```

### Nested `media` Props

The examples above all use a top-level media prop in ArchieML.

```archieml
{.myComponent}
  media: myMap.html
{}
```

But the Freebird template automatically recurses through all of your ArchieML, so you can use nested `media`, like this:

```archieml
{.congress}
  hed: Members of Congress
  [.members]
    id: member001
    media: _assets/001.jpg
    label: Jane Doe
    caption: Representative Doe (I) is serving her third term.

    id: member002
    media: _assets/002.jpg
    label: Bob Smith
    caption: ...
  []
{}
```

Your component:

```svelte
{#each props.members as member}
 <!-- Wrapper for label, caption and dom ID -->
  <Wrapper props={member}>
    <!-- Media for the non-responsive, local thumbnail -->
    <Media props={member}>
  </Wrapper>
{/each}
```

### Understanding Media Component Architecture

The passing of the `props` object straight through to `$lib/shared/Media/index.svelte`, like in the examples above, allows component developers to quickly reuse common media functionality and default configurations without needing to know all the available `Media` props. This is facilitated by splitting the component into two pieces:

- `$lib/shared/Media/index.svelte`: This is an ArchieML-aware component that extracts all supported properties from the Google Doc derived `props` object and checks to see if they have viewport responsive variants (ie: `media:scoopId` and `media-desktop:anotherScoopId`; or `autoplay:false` and `autoplay-desktop: true`). If any responsive variants exist, it determines which value to use based on viewport width. Finally, it passes just the expected props and resolved props to the `$lib/shared/Media/Base.svelte` component.

- `$lib/shared/Media/Base.svelte`, This is the lower level component that does the heavy lifting. It has no awareness of Google Doc ArchieML or ability to resolve viewport responsive props. It simply exports all the props listed above without any `props.*` nesting.

We use this split pattern for similar reasons in the oft-paired `$lib/shared/Wrapper` component.

### Configurable `media` prop and Base component example

There are times when a single `media` prop isn't ideal.

For example, a custom video diptych component might be best expressed like this in ArchieML:

```archieML
{.wizardPortraits}
  hed: Gryffindor Twins
  videoLeft: https://int.nyt.com/data/videotape/finished/2023/hogwarts/fred-320.mp4
  videoRight: https://int.nyt.com/data/videotape/finished/2023/hogwarts/george-320.mp4
{}
```

You can call the `resolveMediaProp()` manually to specify which additional prop or props you want to resolve. To do so, you'll need colocate a `prepocess.server.js` file with your component, like:
`$lib/project/WizardPortraits/preprocess.server.js`

```javascript
import { resolveMediaProp } from "$lib/freebird/resolve.server.js";

// This file needs to also be referenced in lib/freebird/preprocess.server.js
export default async function preprocess(block) {
  // Grab the ArchieML props from block.value that are in this form:
  // {videoLeft: 'url', videoRight: 'url', ...}
  // and filter out any whose name doesn't begin with `imageTk`. And then replace the
  // it's value with the resolved media object
  await Promise.all(
    Object.keys(block?.value)
      // This is a very basic query for any prop that includes `video` in the name.
      // Your needs may require a smarter filter, like a very specific regex pattern.
      .filter((propName) => propName.includes("video"))
      .map(async (propName) => {
        // overwrite the string slug with the object value
        const resolvedMedia = await resolveMediaProp(block.value, {
          targetProp: propName,
          recursive: false,
        });
        block.value[propName] = resolvedMedia[0];
      }),
  );

  return block;
}
```

To use the custom props in your `$lib/project/WizardPortraits/index.svelte` component, you can grab the video metadata by prop name from the standard `props` object.

_Note: This example uses the `Base` version of the component as detailed above for more direct control over some of the configuration, without needed to duplicate all the options in the Google Doc._

```svelte
<script>
  import Wrapper from "$lib/components/shared/Wrapper/index.svelte";
  import BaseMedia from "$lib/components/shared/Media/Base.svelte";
  export let props;
  const { videoLeft, videoRight } = props;
</script>

<Wrapper {props}>
  <div class="g-cols">
    <div class="g-col">
      <BaseMedia
        media={videoLeft}
        autoplay={true}
        controls={false}
        muted={true}
        loop={true}
      />
    </div>
    <div class="g-col">
      <BaseMedia
        media={videoRight}
        autoplay={true}
        controls={false}
        muted={true}
        loop={true}
      />
    </div>
  </div>
</Wrapper>

<style>
  .g-cols {
    display: flex;
    justify-content: space-between;
  }

  .g-col {
    width: calc(50% - 10px);
  }
</style>
```
