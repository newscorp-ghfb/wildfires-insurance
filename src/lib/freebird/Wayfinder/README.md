# Wayfinder

Wayfinder is a component to build scroll-driven interactives that zoom over a large image with text, symbols and slides overlaid on top. A good example of Wayfinder in use is this [piece](https://www.nytimes.com/interactive/2023/03/20/science/chinese-space-balloon-incident.html) that looks at the track of the Chinese balloon.

You can check the example project to get a feel of how it works: https://runway.nyt.net/preview/2023-08-11-wayfinder-examples/main/index?screen=desktop

### Generate tiles

```
$ npm run wayfinder
```

### Illustrator script

```
File > Other scripts > src/lib/freebird/Wayfinder/wayfinder.jsx
```

## Getting started

Wayfinder works in a two-step process. First, you need to have a large background image and create the tiles that will get rendered on page. Second, you have to create a Illustrator file and run a Illustrator script that creates the path data.

1. First, you need to have a large image and an Illustrator file following the Wayfinder layer structure. Please [download and inspect the example files](https://github.com/nytnews-projects/2023-08-11-wayfinder-examples/tree/main/ai) and create a file replicating the same layout. There's a set of red rectangles in the `zooms` group: those are the zoom bounding boxes. They are named `mobile` and `desktop` as you can have a different set for each resolution. The `ways` group contains the paths for mobile and desktop. The `symbols` contains callouts and small icons and `text` contains label and annotation text. Please note a few important settings for your Illustrator file:

- the order of your layer groups in Illustrator must be as follows: `zooms`, `ways`, `symbols`, `text`
- elements in the `symbols` group must reference local files in the `public/_assets/wayfinder/symbols` folder, and the layer must be named to match its corresponding filename, such as `circle.png`
- the top-left corner of your artboard must be positioned at `(0,0)`:

<img width="400" src="https://github.com/newsdev/birdkit/assets/1236790/014fcf71-59a6-4caa-b6dd-f547a2572236">

2. Once that is done, use the Google Doc snippets to add a Wayfinder component in your doc. Adjust the paths of accordingly to match your jpg file and your Illustrator file. There are mobile and desktop versions.

3. Second, uncomment the Wayfinder component in `src/routes/index/+page.svelte` at the top of the imports and inside the body loop.

4. Now do `npm run wayfinder`. The first time it will install the dependencies, create the folders and create a set of tiles inside `public/_big_assets`.

5. Now, open your Illustrator file and go to `Scripts > Other Script` and open the `wayfinder.jsx` Illustrator script located in `src/lib/freebird/Wayfinder/wayfinder.jsx`. This will run a script and generate a JSON file with the paths. Place it in `public/_assets/wayfinder/${WAYFINDER_NAME}.json`, in the case of a file called `short-track.ai` it will be `public/_assets/wayfinder/short-track.json`.

6. You're done! Your Wayfinder should be running on the page. To iterate in the paths you can rerun the Illustrator script. To adjust the tiles you can rerun `npm run wayfinder`. If the script didn't work you probably have to adjust the number of rows and columns. Please continue reading to understand how the tiling works.

## Adding labels

If you want labels to render as HTML text, you should place them all in a layer named `text`, which should be below `zooms`, `ways`, `symbols` in the layer order.

If you need to target labels with specific CSS rules, you can rename each element within the `text` layer and target that layer name as a CSS id. For example, a layer named `label_shadow` would be targeted as `#label_shadow` in CSS. Adding a suffix to each sublayer name, such as `_desktop`, allows you to target a group of labels in CSS:

```
@media (max-width:740px){
	div[id*='_desktop']{
		display:none!important;
	}
}
```

## Tile generation

Because a large image would take too long to load, Wayfinder divides that image in a set of tiles, similar to how Google Maps loads chunks of the world depending on your location and zoom. You have to think about your image as a grid, divided in rows and columns.

To set that number of rows and columns you can adjust the `mobileRows`, `mobileColumns`, `desktopRows` and `desktopColumns` properties in the Google Doc.

### Calculate rows and columns

Please make sure the number of rows and columns are evenly divisible by the dimensions of your image, and evenly divisible with the 10% of the image dimensions (for a set of low quality tiles loaded first).

For example this number of rows and columns won't work for a 8160 × 5100 image:

```
❌ 5100 / 7 rows = 728.574px
❌ 8160 / 7 columns = 1165.714px

❌ 510 / 7 rows = 72.857px
❌ 816 / 7 columns = 116.571px
-------
49 tiles (7 * 7) of 728.574x1165.714.
49 tiles (7 * 7) of 72.857x116.571.
```

But if we use these rows and columns the script will work:

```
✅ 8160 / 8 columns = 1020px
✅ 5100 / 5 rows = 1020px

✅ 816 / 8 columns = 102px
✅ 510 / 5 rows = 102px
-------
40 tiles (8 * 5) of 1020x1020.
40 tiles (8 * 5) of 102x102.
```

The tile generation code lives in the `src/lib/freebird/Wayfinder/wayfinder.js` script.

## Configuration

You can adjust the default image and symbol paths, tile quality and image format in the `src/lib/freebird/Wayfinder/config.js`. By default we're generating webp files at quality 60 for desktop and 50 for mobile.

## Main props

This component uses the standard [Wrapper](../shared/Wrapper/), so you can pass standard props to adjust width and margins. The ones you will likely want to use are `maxWidth: full`, `marginInline: false` and `marginBlock: false`.

| Property                | Type                 | Description                                                                                                                                                                                                                                                                                                                                                                              | Default | Example                                                                                     |
| ----------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| **id**                  | _[Required] String_  | A unique name that will be prepended both to the wayfinder container and all DOM elements written to the page (video, images, etc.).                                                                                                                                                                                                                                                     | `none`  | `g-wayfinder`                                                                               |
| **desktopScrollHeight** | _[Required] String_  | The height, in unitless pixels, of the whole wayfinder container. It will adjust how long, vertically, the whole scroller will be.                                                                                                                                                                                                                                                       | `none`  | `20000`                                                                                     |
| **desktopImage**        | _[Required] String_  | Path of the image that but cut into tiles and appear as the main background on the scrolly.                                                                                                                                                                                                                                                                                              | `none`  | `ai/central-park.jpg`                                                                       |
| **desktopRows**         | _[Required] String_  | Number of evenly divisible rows you want to cut the main image with. If you change this, please run `npm run wayfinder` again. Math explained above.                                                                                                                                                                                                                                     | `none`  | `5`                                                                                         |
| **desktopColumns**      | _[Required] String_  | Number of evenly divisible columns you want to cut the main image with. If you change this, please run `npm run wayfinder` again. Math explained above.                                                                                                                                                                                                                                  | `none`  | `8`                                                                                         |
| **mobileScrollHeight**  | _[Optional] String_  | Mobile version of the same prop above. It will kick in below 600px.                                                                                                                                                                                                                                                                                                                      | `none`  |  `10000`                                                                                    |
| **mobileImage**         | _[Optional] String_  | Mobile version of the same prop above. It will kick in below 600px.                                                                                                                                                                                                                                                                                                                      | `none`  | `ai/central-park-mobile.jpg`                                                                |
| **mobileRows**          | _[Optional] String_  | Mobile version of the same prop above. It will kick in below 600px.                                                                                                                                                                                                                                                                                                                      | `none`  | `5`                                                                                         |
| **mobileColumns**       | _[Optional] String_  | Mobile version of the same prop above. It will kick in below 600px.                                                                                                                                                                                                                                                                                                                      | `none`  |  `8`                                                                                        |
| **params**              | _[Required] String_  | Path of the JSON generated by the wayfinder AI script that contains the scroll data.                                                                                                                                                                                                                                                                                                     | `none`  | `_assets/wayfinder/json/central-park.json`                                                  |
| **debug**               | _[Optional] Boolean_ | Enables debug mode, which will render rules every few pixels with the percent of the scroll.                                                                                                                                                                                                                                                                                             | `false` | `true`                                                                                      |
| **inset**               | _[Optional] Boolean_ | Shows an inset image on the bottom-right corner with a minimap highlighting the current zoom position over the scroll.                                                                                                                                                                                                                                                                   | `true`  | `false`                                                                                     |
| **altText**             | _[Optional] String_  | Alt text of the main scrolly image.                                                                                                                                                                                                                                                                                                                                                      | `none`  | `Photograph showing a close race in the third turn of the women’s short track competition.` |
| **eventListener**       | _[Optional] Boolean_ | Enables an event listener that emits the `id`, `element`, `scrollPct`, `scrollPctAdj` and whether this is the mobile or desktop `version` of the component anytime there's a scroll event. Useful for custom behaviour based on scroll (e.g. chart animations). Subscribe like this `window.addEventListener('wayfinder', e => console.log(e))` on, for example, an `onMount` statement. | `false` | `true`                                                                                      |

## [.slides] props

You can pass any of these props to the slides section on the wayfinder object. Keep in mind that the `text` prop marks a new slide and it is required even if empty.

| Property    | Type                    | Description                                                                                                                                   | Default | Example                                                       |
| ----------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------- |
| **text**    | _[Required] String_     | Text that will appear on the slide. A new `text` entry marks a new slide. It can be empty if you're using another component.                  | `none`  | `Here's the first slide, with plenty of extra room for copy.` |
| **percent** | _[Required] Float_      | Percent from 0 to 1 that marks the position of the slide over the scrolly.                                                                    | `none`  | `0.2`                                                         |
| **lorem**   | _Optional LoremObject_  | Adds random lorem text on the slide. It can be customized with the [Lorem component props](../Lorem/).                                        | `none`  |  `lorem:`                                                     |
| **header**  | _Optional HeaderObject_ | Adds the header on the slide. It can be customized with the [Header component props](../Header/).                                             | `none`  |  `{.header}{}`                                                |
| **media**   | _Optional MediaObject_  | Adds any multimedia element that is accepted by the [Media component](../shared/Media/), including ai2html graphics, images, video and audio. | `none`  |  `media: graphic.html`                                        |
| **subhed**  | _Optional SubHedObject_ | Adds a subhed in the slide. It uses the [Subhed component](../Subhed/).                                                                       | `none`  | `subhed: Uncharted waters`                                    |
