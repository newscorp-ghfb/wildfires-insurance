# scrollingparty

To use scrollingparty in your project, first please uncomment the scrollingparty component on `src/routes/index/+page.svelte`, both the import at the top and the component inside the body loop. Then, run `npm run scrollingparty` to create the folders in your project. In the doc, use the snippets (Snippets > Story Templates > ScrollingParty) to add a basic component in your page.

You can place your After Effects files in the `./ae` folder, your tracking files in `public/_assets` and your videos in `public/_big_assets`. The `ae2html.jsx` script is located in `src/lib/freebird/ScrollingParty/ae2html.jsx`.

See a live demo in the documentation page: https://freebird--docs.cloud.runway.nyt.net/documentation/edit/freebird/ScrollingParty.

## Doc options

Here's a sample scrollingparty component. Additional attributes such as hed, sources and credit can be added like other birdkit assets. Read about all the common properties in the [Wrapper docs](https://github.com/newsdev/birdkit/tree/main/packages/template-freebird/src/lib/shared/Wrapper).

```
{.scrollingparty}
  id: top-video-v1
  keyframeLength: 3
  frameRate: 30
  frameLength: 360
  scrollStart: 0.1
  scrollEnd: 0.95
  height-desktop: 0.4
  height-mobile: 0.3
  sizes-desktop: 960,1280,1600
  sizes-mobile: 640,800
  maxWidth: full
  hed:
  sources:
  credit:
  videoAsset: https://int.nyt.com/newsgraphics/2020/amazon-river-covid/top/top-8-1600.mp4
  videoRenditions: https://int.nyt.com/newsgraphics/2020/amazon-river-covid/top/top-8
  singleFrames:https://int.nyt.com/newsgraphics/2020/amazon-river-covid/top/stills/top-8
  tracking-desktop: top-tracking-desktop.json
  tracking-mobile: top-tracking-mobile.json
  scrollDisable: false
  debug: false

  [.slides]
    percent: 0
    {.header}
      sharetools.show: true
    {}

    percent: 0.11
    text: Brazil has been battered by the pandemic, with the second-highest death toll in the world.
    media: _assets/bird.png
  []
{}
```

| Property             | Type                                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                   | Default | Example                                                                                   |
| -------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| **id**               | _[Required] String_                          | A unique name that will be prepended both to the scrollingparty container and all DOM elements written to the page (video, images, etc.).                                                                                                                                                                                                                                                                                     | `none`  | `top-video-v1`                                                                            |
| **keyframeLength**   | _[Optional] Number_                          | The gap between key frames of the scrolling video. The video must be encoded with a small keyframe length, which cannot be achieved using Videotape or Scoop. Use Adobe Media Encoder or ffmpeg to set the key frame distance.                                                                                                                                                                                                | `3`     | `5`                                                                                       |
| **frameRate**        | _[Required] Decimal_                         | Scrolling video frame rate, usually 24 or 30.                                                                                                                                                                                                                                                                                                                                                                                 | `30`    | `24`                                                                                      |
| **frameLength**      | *[Required] Decimal*                         | Total length of scrolling video. There is no upper limit, but a good target is somewhere between 900 and 1,350.                                                                                                                                                                                                                                                                                                               | `900`   | `360`                                                                                     |
| **scrollStart**      | _[Required] Decimal_                         | The percentage at which to start the interactive within the scrollingparty container. Typically, there should be a small percentage at the start so that everything is visible on the screen before any movement begins. Range is 0 to 1.                                                                                                                                                                                     | `0.0`   | `0.05`                                                                                    |
| **scrollEnd**        | _[Optional] Decimal_                         | The percentage at which to end the interactive within the scrollingparty container. Typically, there should be a small percentage at the end so that the last frame is visible before scrolling past the container. Range is 0 to 1.                                                                                                                                                                                          | `1.0`   | `0.95`                                                                                    |
| **height-desktop**   | _[Optional] Decimal_                         | A multiplier for the scrollingparty desktop container. Smaller values will result in a shorter container and a faster scrolling experience. Range is 0 to 2.                                                                                                                                                                                                                                                                  | `1.0`   | `0.6`                                                                                     |
| **height-mobile**    | _[Optional] Decimal_                         | A multiplier for the scrollingparty mobile container. Smaller values will result in a shorter container and a faster scrolling experience. Range is 0 to 2.                                                                                                                                                                                                                                                                   | `1.0`   | `0.4`                                                                                     |
| **sizes-desktop**    | _[Required] Comma separated list of numbers_ | All rendition widths for desktop from smallest to largest. Multiple renditions will keep the file sizes manageable.                                                                                                                                                                                                                                                                                                           | `none`  | `960,1280,1600`                                                                           |
| **sizes-mobile**     | _[Required] Comma separated list of numbers_ | All rendition widths for mobile from smallest to largest. Multiple renditions will keep the file sizes manageable.                                                                                                                                                                                                                                                                                                            | `none`  | `640,800`                                                                                 |
| **videoAsset**       | _[Optional] String_                          | The path to a single scrolling video asset to use across all renditions. This option is ignored if a video-rendition path is provided (renditions should be provided for all projects). Video that has gone through Scoop or Videotape will not work. Videos must live on `int.nyt.com`, or another server that will return a 206 response code for video files, which the Preview server will not return.                    | `none`  | `https://int.nyt.com/newsgraphics/2020/after-effects-to-html/walking/walking-v1-1600.mp4` |
| **videoRenditions**  | _[Required] String_                          | The base path of the scrolling video renditions. The appropriate width (from the sizes-desktop or sizes-mobile fields) and file extension are appended at when the asset is loaded.                                                                                                                                                                                                                                           | `none`  | `https://int.nyt.com/newsgraphics/2020/after-effects-to-html/walking/walking-v1`          |
| **singleFrames**     | _[Optional] String_                          | The base path, and partial file name, of a set of still images to load when the reader stops scrolling. This only applies to assets with a scrolling video. The file name must include the aspect (mobile or desktop) and a five digit frame number separated by a dash. For example, the file name on the server may look something like this: top-video-v1-desktop-00023.jpg. Only jpegs are currently supported.           | `none`  | `https://int.nyt.com/newsgraphics/2020/amazon-river-covid/top/stills/top-video-v1`        |
| **tracking-desktop** | _[Optional] String_                          | The file name of the json file in the `public/_assets/[this asset id]` folder for the desktop output of the ae2html script.                                                                                                                                                                                                                                                                                                   | `none`  | `_assets/top-video-desktop-v1.json`                                                       |
| **tracking-mobile**  | _[Optional] String_                          | The file name of the json file in the `public/_assets/[this asset id]` folder for the mobile output of the ae2html script.                                                                                                                                                                                                                                                                                                    | `none`  | `_assets/top-video-column-v1.json`                                                        |
| **maxWidth**         | _[Optional] String or Number_                | Maximum width for the scrollingparty container. Typically, this is set to `full`.                                                                                                                                                                                                                                                                                                                                             | `none`  | `full`                                                                                    |
| **slideMaxWidth**    | _[Optional] String or Number_                | Maximum width for a slide. This is usually set it in pixels.                                                                                                                                                                                                                                                                                                                                                                  | `420px` | `500px`                                                                                   |
| **alignSlides**      | _[Optional] String_                          | Controls in which part of the screen slides will appear on desktop. It can be set to `left`, `center` or `right`. On mobile slides will automatically be centered.                                                                                                                                                                                                                                                            | `left`  | `center`                                                                                  |
| **scrollDisabled**   | _[Optional] Boolean_                         | For disabling scrolling within the scrollingparty container. Useful for stepping through an animation or video by clicking or tapping. The height must be adjusted (using height-desktop and height-mobile) so that the viewable area is restricted.                                                                                                                                                                          | `false` | `true`                                                                                    |
| **debug**            | _[Optional] Boolean_                         | A boolean for switching on/off the debug features. If debug is true, percentage lines will appear within the scrollingparty container, making it easier to place the slides at exact locations. While scrolling, console logs will be generated to show additional information.                                                                                                                                               | `false` | `true`                                                                                    |
| **eventListener**    | _[Optional] Boolean_                         | A boolean for switching on a global event listener to control scrollingparty from anywhere in your project. To use it, set it to `true` in the doc and then add this on an `onMount` function in your code: `window.addEventListener('scrollingparty', (e) => console.log(e.detail))`. The event contains the scrollingparty container, the id of the component, the scroll percent progress and the adjusted scroll percent. | `false` | `true`                                                                                    |

### [.slides] _Optional_

```
{.scrollingparty}
  ...
  [.slides]
    percent: 0
    {.header}
      sharetools.show: true
    {}

    percent: 0.11
    text: Brazil has been battered by the pandemic, with the second-highest death toll in the world.
    alignSlide: right
    media: _assets/bird.png
  []
{}
```

| Property              | Type                          | Description                                                                                                                                                                                                                                                                            | Default | Example                                         |
| --------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------- |
| **percent**           | _[Required] Decimal_          | Vertical placement of the slide within the scrollingparty container. Setting `debug: true` will provide horizontal percentage lines within the container for easier slide placement. This marks a new slide so it should always be the first element.                                  | `0.0`   | `0.35`                                          |
| **text**              | _[Required] String_           | The copy for each slide that will be created on top of all other content in the scrollingparty asset.                                                                                                                                                                                  | `none`  | `This is the text for the slide.`               |
| **subhed**            | _[Optional] String_           | Adds a subhed that will appear before the text. It uses the [Subhed component](https://github.com/newsdev/birdkit/tree/main/packages/template-freebird/src/lib/freebird/Subhed).                                                                                                       | `none`  | `My subhed`                                     |
| **header**            | _[Optional] Object_           | Adds the main story headline inside the slide. This uses the same props than the normal [Header component](https://github.com/newsdev/birdkit/tree/main/packages/template-freebird/src/lib/freebird/Header) so you can easily add sharetools or custom bylines.                        | `none`  | `{.header}{}`                                   |
| **media**             | _[Optional] String_           | Adds an image, video, audio or ai2html in the slide. They can be references to local assets, urls or scoop assets. It uses the [Media component](https://github.com/newsdev/birdkit/tree/main/packages/template-freebird/src/lib/shared/Media) under the hood.                         | `none`  | `_images/bird.png`                              |
| **lorem**             | _[Optional] String or object_ | Adds lorem text inside the slide. Use it to quickly add text in your project. This can be an empty string or an object with more options. See all of them in the [Lorem component docs](https://github.com/newsdev/birdkit/tree/main/packages/template-freebird/src/lib/shared/Lorem). | `none`  | `lorem:`                                        |
| **alignSlide**        | _[Optional] String_           | Overrides the default slide alignment on a specific slide. This can be `left`, `center` or `right`.                                                                                                                                                                                    | `none`  | `right`                                         |
| **style**             | _[Optional] String_           | Name of css style to apply to the slide.                                                                                                                                                                                                                                               | `none`  | `g-custom-slide-dark`                           |
| **fallback-desktop**  | _[Optional] String_           | Path to a still image in the \_assets folder to use as a desktop fallback image in case the scrolling video hasn’t buffered enough to show the video at the slide percent. Ideally, the fallback images have the smallest file size possible so that they load quickly.                | `none`  | `fallback/fallback-top-video-v1-desktop-01.jpg` |
| **fallback-mobile**   | _[Optional] String_           | Path to a still image in the \_assets folder to use as a mobile fallback image in case the scrolling video hasn’t buffered enough to show the video at the slide percent. Ideally, the fallback images have the smallest file size possible so that they load quickly.                 | `none`  | `fallback/fallback-top-video-v1-mobile-01.jpg`  |

### [.layers] _Optional_

```
{.scrollingparty}
  ...
  [.layers]
    layer: text_amazon-river
    text: Amazon River
    style: g-custom-label-river
  []
{}
```

| Property  | Type                | Description                                                                                                                                                                                                                                            |  Default | Example                            |
| --------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------------- |
| **layer** | _[Required] String_ | The name of the composition layer in After Effects that gets updated when the asset loads. The layers option only works if a json file has been generated using the ae2html script and gets defined by the tracking-desktop or tracking-mobile option. | `none`   | `text_string-to-replace-later`     |
| **text**  | _[Optional] String_ | The copy that replaces the existing string in the After Effects text layer. All existing text will get replaced.                                                                                                                                       |  `none`  |  `This is the text for the label.` |
| **style** | _[Optional] String_ |  Name of css style to apply to the layer.                                                                                                                                                                                                              |  `none`  | `g-custom-layer-text`              |

## Encoding the scrolling video

Scrolling video needs very specific encoding parameters to ensure smooth scrolling. The most important encoding option is the key frame distance, which should be set to 3. The key frame distance cannot be set using Scoop or Videotape, so either the Adobe Media encoder (preferred) or ffmpeg should be used for encoding. It’s also important to limit and adjust the bitrate for different renditions. Videos that are smaller in dimension should have a smaller file size. Videos should not exceed 18Mb.

Here are some target widths for desktop (16:9) and mobile (9:16) scrolling videos:

```
desktop: 960,1280,1600
mobile: 640, 800
```

Here are [some presets](https://drive.google.com/file/d/1Q-Ys9w-5gJc7nv6A15dyt1xKPVjLRlrF/view?usp=sharing) for the Adobe Media Encoder that can be imported into the Adobe Media Encoder.

![](https://github.com/newsdev/birdkit/assets/1236790/0047cf96-838b-40e9-8846-35a8cb88324a)

Some guidelines for exporting scrolling videos:

- Don’t export audio
- A variable bitrate can sometimes provide a better compression with such a short key frame distance
- Key frame distance should be set to 3

![](https://github.com/newsdev/birdkit/assets/1236790/b7a07d49-ec54-464b-83cb-1cc68bdb30cb)

To make sure that the key frame distance is set properly, you can run this in the terminal and see the distances as fractions of seconds, written to a text file.

```
ffprobe -select_streams v -show_frames \
-show_entries frame=pict_type \
-of csv your-file-name.mp4 \
| grep -n I | cut -d ':' -f 1 > your-file-name.txt

```

## Uploading content

Ideally you should place your videos inside `public/_big_assets` and reference them directly in the doc. Because we're using [git lfs](https://git-lfs.com/), the repo will stay lean and won't take too much to download. Placing your assets in `_public/_big_assets/` makes sure that they will only be synced when they change, not every time so `npm run sync` and `npm run pub` will stay fast.

But if you need to upload the videos, the best method for uploading content is to use the `gcs-upload` tool. The tool allows you to upload content directly to our live servers. You can replace existing files and it will handle cache busting. It will upload everything in the local folder except subfolders. If you don’t already have it installed, connect to the VPN and paste this in the terminal (sometimes it will hang for a few minutes when it’s installing):

```
npm i -g newsdev/gcs-upload
```

And use it by defining a remote path and a local path. Everything in the local path, except subfolders, will be uploaded to the remote path on the server. If no remote path on the server exists, one will be created automatically. Please keep in mind that whatever you upload is live on the internet, although no links exist to the files until you publish the project. Use it like this:

```
gcs-upload --path remote-path local-path
```

So a working example might be:

```
gcs-upload --path newsgraphics/2021/story-name-here/main/ /Users/jeremy/projects/story-name-here/main/
```

The scrollingparty framework will attach the appropriate width to the scrolling video filename from the sizes-desktop or sizes-mobile option in the doc. For example, if the reader’s desktop browser width is 1,750 pixels wide and the desktop sizes are set to 960,1280,1600, the file top-video-v1-1600.mp4 would be used.

## Using ae2html

Adding labels and moving elements around within a scrollingparty project can be done using After Effects and the ae2html script. Start by setting your Time Display Style to timecode. Use Layer -> Transform -> Center Anchor Point in Layer Content after creating a layer to ensure the coordinate system for the layer lines up with the coordinate system for the composition. Each layer needs its own transformations and parenting will be ignored when the layers are exported.

If you are running the ae2html script in After Effects for the first time, go to Preferences -> General -> Scripting & Expressions. Make sure Allow Scripts to Write Files and Access Network is checked. With the desired comp selected, run the ae2html script by going to File -> Scripts -> Run Script File … and select the `ae2html.jsx` file in `src/lib/freebird/ScrollingParty` folder. The script will ask you for a location for the output json file. By default, the scrollingparty framework will look for the json file in the `public/_assets/asset-id/` folder. Be sure and give your desktop and mobile versions different file names.

Layer names must start with one of the prefixes below in order for the script to write the layer information to a json file that is read by the scrollingparty framework. Layers without one of the following prefixes will be ignored and will not show up in the browser. All transforms are relative unless the layer name ends with a pipe symbol (|) followed by the absolute attributes. Currently, size and anchor point are the only two supported absolute attributes. For example, image_top-video-frame-01.jpg|size,anchor

| Prefix           | AE type         | Description                                                                                                                                                                                                                                                                                                                                                           |
| ---------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| text\_           | Text            |  Area or point type. Font size, type-face, font-style, tracking, leading and font-color are all exported. NYT Franklin, Cheltenham and Imperial are the only other font families supported besides Arial                                                                                                                                                              |
| shape\_          | Ellipse or Path | A single static or animated path per shape layer is supported. Individual vertices can be animated. Transforms at the shape level are ignored and, instead, layer transforms are used for moving, scaling, etc.                                                                                                                                                       |
| image\_          | Image           | Jpegs, gifs or pngs that are located in the `_assets/asset-id/` folder. The layer name must include the image file name with the extension. A single static or animated mask is supported. For example, `image_top-video-frame-01.jpg`.                                                                                                                               |
| canvas\_         | Solid           | Creates a canvas element in the DOM from the dimensions of a solid layer, and will be created and resized according to the browser’s devicePixelRatio value. A single static or animated mask is supported. All transformations and animated attributes are applied to the canvas.                                                                                    |
| video\_          | Video           | A video that is meant to be auto-played when it appears on the timeline. The audio is muted by default, but an unmute button will appear in the bottom right corner of the asset in the browser. The layer name must contain the url on a live server. For example, `video_https://int.nyt.com/newsgraphics/2021/running-sketches/sketches/test-1-interview-600.mp4`  |
| scrollingvideo\_ | Video           | A scrolling video, with no audio, encoded with a key frame distance of 3. The layer name must contain the url on a live server. For example, `scrollingvideo_https://int.nyt.com/newsgraphics/2021/tulsa-massacre-centennial-videos/topper/topper-video-v2-1600.mp4`                                                                                                  |
| null\_           | Solid           | Creates an empty div that can be populated later. All transformers and animated attributes will be applied to the empty div.                                                                                                                                                                                                                                          |

The following animated transformations and attributes are currently supported:

### Transforms

- Anchor Point
- Position
- Scale
- Rotation
- Opacity

### Shapes

- Animated path vertices are supported
- Non-scaling strokes are used by default
- Contents -> Shape 1 -> Fill 1 -> Color
- Contents -> Shape 1 -> Fill 1 -> Opacity
- Contents -> Shape 1 -> Stroke 1 -> Color
- Contents -> Shape 1 -> Stroke 1 -> Opacity
- Contents -> Shape 1 -> Stroke 1 -> Stoke Width
- Contents -> Shape 1 -> Stroke 1 -> Dashes -> Dash
- Contents -> Shape 1 -> Stroke 1 -> Dashes -> Offset

### Text

- Text -> Animator 1 -> Fill Color
- Text -> Animator 1 -> Tracking Amount
- Text -> Animator 1 -> Line spacing

### Effects

- Gaussian Blur -> Blurriness
- Color Balance (HLS) -> Hue
- Color Balance (HLS) -> Lightness
- Color Balance (HLS) -> Saturation

### Masks

- Animated masks for images (single path)
- Animated masks for canvases (single path)

## FAQ

### Has something changed between the preview and birdkit versions?

Yes. The main difference is that all props have been changed to use camelCase rather than dashes (`frameRate` rather than `frame-rate`). This applies to everything but `-desktop` and `-mobile` modifiers. Props like `tracking-desktop` and `tracking-mobile` stay the same (this is a birdkit convention).

Also, we would like to encourage placing videos in `public/_big_assets` rather than uploaded to a server. This will simplify the workflow and make sure the project is self-contained. Assets that live in `public/_big_assets` don't get reuploaded to Runway and Scoop unless they are modified so syncing and pubbing will stay fast. Videos are also on git lfs so the repo should't grow too much.
