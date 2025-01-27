# Freebird Image

The Image component allows us to display Scoop Images; local, responsive images; and local, non-responsive images in our projects.

## TL:DR

```
{.image}
  media: _images/bird.png
  caption: A bird
  credit: Josh Haner/The New York Times
{}

```

## To Use

The Image component is a thin wrapper around our [Media component and middleware](../../shared/Media/README.md), and our [Wrapper component](../../shared/Wrapper/README.md). As such, it inherits all their functionality, allowing for a variety of uses.

### Local, Responsive Image

_This functionality is only intend for non-transparent JPG, PNG and WebP formats. All other formats should use the `Local, Non-responsive Image` option below._

To help reader experience, Freebird includes functionality to generate and serve "responsive" images. This means that, given a single, high quality source image, Freebird will generate a number of smaller, optimized images automatically. The generated markup includes references to all these images, allowing a reader's browser to select the best size for the reader's viewport.

To use, put your source image in `public/_images` and refer to it like so in your ArchieML:

```
{.image}
  media: _images/canyon.jpg
  altText: Rafters inspecting rocks along the Colorado River.
  credit: Raymond Zhong/The New York Times
{}
```

The sizes and quality of generated standard and retina image renditions is configurable per-project in `freebird.config.js`.

#### Image Generation, Cache and Git

Users of responsive images in Preview may remember `make images`, the manual step used to generate images for display in our development environment, committed to `git` and then published with the rest of our project. It worked, but repo sizes often ballooned.

Our new system is very different.

- On server start or project build (`npm run dev`/`npm run build`), all source images are optimized into web-ready renditions based on settings in `vite.config.js`.
- While the developement server is running, newly added files are optimized dynamically the first time your browser requests a specific rendition size, without needed to restart the server. Subsequent requests serve the already created image. If your viewport changes size, the browser may request a different rendition, which will be generated on the fly, too.
- Generated renditions have a special naming pattern and live on the local filesystem beside the source. For example, a request for a 900px retina version of `_images/canyon.jpg` would generate `_images/canyon-@@-900@x2.jpg`.
- We commit source images to our `git` repo but not generated versions.
- As part of the publish process, all possible image renditions are generated automatically and pushed to the `static1` server.
- There is no need to run a CLI program to generate for your project for use with built-in image templates. There is, however, a `npm run images` task for custom image creation and optimization. Custom tasks are configured in `images.config.js`;

For additional details, or to use a customized version of this functionality in your scripts, see: [\_images/README.md](../../../../public/_images/README.md)

### Local, Non-responsive Image

GIF, SVG and transparent PNG images can't be auto-sized by Freebird for responsive applications. For these formats, you need to manually optimize and generate needed versions and place them into `public/_big_assets/`.

The generated markup includes a direct reference to the file.

```
{.image}
  media: _big_assets/overlay.svg
{}
```

Like all Freebird templates, Image supports "responsive props", so you could crudely optimize and/or art direct non-responsive images like so:

```
{.image}
  media: _big_assets/mobile-overlay.svg
  media-desktop: _big_assets/desktop-overlay.svg
{}
```

### Scoop Image

Given a valid Scoop Image id, the Image component automatically grabs all needed metadata from the Scoop asset. The generated markup will include any available caption and credit information, in addition to responsive markup for all available renditions.

```
{.image}
  media: 100000008911601
{}
```

![image](https://github.com/newsdev/birdkit/assets/294614/6002c220-ab7c-40e8-8d18-482c9994e955)

##### Metadata can be augmented or overwritten by passing in alternate values:

```
{.image}
  media: 100000008911601
  credit: TK/The New York Times #Overwrites
  caption: Flooding along Crissy Field in San Francisco. #Augments
{}
```

![image](https://github.com/newsdev/birdkit/assets/294614/a896f76d-6f50-4cb3-be5f-49a9fc34f773)

##### To remove Scoop metadata from display, pass in an empty value. For example, to remove the Scoop caption:

```
{.image}
  media: 100000008911601
  credit: # A blank values suppress the Scoop value
{}
```

![image](https://github.com/newsdev/birdkit/assets/294614/05765b33-4b49-4037-b133-5e1b9785bc6c)

#### Scoop Crops: Mobile and Alternatives

Scoop allows for art direction through the use of "crops." The various crops help editors render optimally cropped versions of the source image in different contexts, like different aspect ratio promos, or promos intended for thumbnail view.

The primary "crop" is called `MASTER`, and it's the default version of the image shown throughout the site. There's also a heavily used `MOBILE_MASTER`, which is often cropped vertically for use on mobile devices.

The Image component, by default, queries a Scoop Image for both `MASTER` and `MOBILE_ MASTER`. If `MOBILE_MASTER` exists, it's served to mobile devices only. `MASTER` is used elsewhere.

![image](https://github.com/newsdev/birdkit/assets/294614/71af2f16-af09-4ae4-b7f3-0cb7e3a464f9)

Usually in Freebird templates, a media component is art directed through responsive props, like so:

```
{.image}
  media: _images/cat.jpg
  media-desktop: images/dog.jpg
{}
```

With Scoop images, the `media-desktop` behavior still works, but the default behavior is to let `media` serve both mobile and desktop versions, as defined by Scoop. But this behavior can be changed via the Scoop-only image option `cropName`, which takes any number of space-delimited crop names.

The use of `cropName` can be combined with responsive props to art direct to a very high degrees.

##### Use only MASTER

Ignore the mobile crop entirely.

```
{.image}
  media: 100000008911601
  cropName: master # case insensitive
{}
```

##### Use an alternative crop

The Facebook crop is very wide.

```
{.image}
  media: 100000008911601
  cropName: facebook
{}
```

##### Use different Scoop assets

Leveraging Freebird responsive props, you can request both different Scoop IDs and crop names by platform, as defined by your Freebird project, not scoop!

```
{.image}
  media: 10000000XXXXXXX
  cropName: mobile_master

  media-desktop: 10000000YYYYYYY
  cropName-desktop: master
{}
```

## Art Direction

The Image component, like all Freebird templates, implements "responsive props," which allows for art direction of media or any other prop by platform, with mobile being the default.

Examples:

```
{.image}
  media: _images/cat.jpg
  caption: A cat living large on the streets of Brooklyn.
  credit: Jane McCat

  media-desktop: _images/dog.jpg
  caption-desktop: Rusty, a senior dachshund on the Upper West Side, is a very good boy.
  credit-desktop: Joe McDog.
{}
```

## Template Options

Most Image options come from the [Wrapper component](../../shared/Wrapper/README.md), which provides for consistent sizing, margin and metadata (headline, caption, sources, etc) across different Freebird templates.

| Property           | Type            | Default                | Inherited From                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Description                                                                                                                                               |
| ------------------ | --------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| media              | string          | ""                     | Media                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Local image path or Scoop ID.                                                                                                                             |
| lazy               | boolean         | true                   | Media                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Enable image lazy loading.                                                                                                                                |
| altText            | string          | ""                     | Media                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Alternative text for assistive devices.                                                                                                                   |
| cropName           | string          | "master mobile_master" | Media                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Scoop Images Only: Space delimited crops to use.                                                                                                          |
| id                 | string          | ""                     | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Optional unique DOM id for containing `g-wrapper`.                                                                                                        |
| className          | string          | ""                     | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Optional class name for containing `g-wrapper`.                                                                                                           |
| hed                | string          | ""                     | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Optional headline above media.                                                                                                                            |
| caption            | string          | ""                     | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Optional caption below media.                                                                                                                             |
| source             | string          | ""                     | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Optional source line below media.                                                                                                                         |
| credit             | string          | ""                     | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Optional credit line below media.                                                                                                                         |
| note               | string          | ""                     | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Optional credit line below media.                                                                                                                         |
| leadin             | string          | ""                     | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Optional leadin text between `hed` and media.                                                                                                             |
| note               | string          | ""                     | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Optional note line below media.                                                                                                                           |
| label              | string          | ""                     | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Optional label over media.                                                                                                                                |
| textAlign          | string          | "left"                 | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Align all media header and footer copy: "left", "center" or "right".                                                                                      |
| headerTextAlign    | string          | value of `textAlign`   | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Align media header copy independently. Same options as `textAlign`.                                                                                       |
| footerTextAlign    | string          | value of `textAlign`   | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Align media footer copy independently. Same options as `textAlign`.                                                                                       |
| maxWidth           | string          | 'body'                 | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | maxWidth of media. 'body' (600px), 'wide' (1050px)and 'full' (100%) are the named, preferred presets. Also `maxWidth-720px` style pixel values will work. |
| headerMaxWidth     | string          | 'body'                 | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | maxWidth of header copy. Same options as `maxWidth`                                                                                                       |
| footerMaxWidth     | string          | 'body'                 | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | maxWidth of footer copy. Same options as `maxWidth`                                                                                                       |
| marginInline       | boolean         | false                  | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent, small left and right margin around content.                                                                                                   |
| headerMarginInline | boolean         | true                   | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent, small left and right margin around header text.                                                                                               |
| footerMarginInline | boolean         | true                   | Wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent, small left and right margin around footer text.                                                                                               |
| marginInline       | boolean, string | false                  | Control left and right _content_ margins. If false, no left or right margins. If truthy (`true` or a valid CSS width), apply a left and/or right margin around main _visual content_ (`media`, or your custom component code). `true` results in the standard article gutter width, but you can also be specify values in px or other units. Like the CSS [margin-inline](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline) rule, you can specify a single value for both left and right, or individual values. Examples: `20px 10px`, or `5vw`.                                   |
| headerMarginInline | boolean, string | true                   | Control left and right _header_ margins. If false, no left or right margins. If truthy (`true` or a valid CSS width), apply a left and/or right margin around main _header_ (headline, leadin, etc). `true` results in the standard article gutter width, but you can also be specify values in px or other units. Like the CSS [margin-inline](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline) rule, you can specify a single value for both left and right, or individual values. Examples: `20px 10px`, or `5vw`.                                                             |
| footerMarginInline | boolean, string | true                   | Control left and right _footer_ margins. If false, no left or right margins. If truthy (`true` or a valid CSS width), apply a left and/or right margin around main _header_ (headline, leadin, etc). `true` results in the standard article gutter width, but you can also be specify values in px or other units. Like the CSS [margin-inline](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline) rule, you can specify a single value for both left and right, or individual values. Examples: `20px 10px`, or `5vw`.                                                             |
| marginBlock        | boolean, string | same as `outerWrapper` | Control top and bottom margins around entire Wrapper. If false, no top or bottom margins. If truthy (`true` or a valid CSS height) apply a top and/or bottom margin around the Wrapper. `true` results in the standard in-article margins above and below Wrapper (see `--g-asset-margin-top/bottom` in variables.css), but you can also be specify values in px or other units. Like the CSS [margin-block](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-block) rule, you can specify a single value for both top and bottom, or individual values. Examples: `20px 10px`, or `5vh`. |
|                    |

## Media and Custom Components

All pieces of the middleware and various functionality in the `{.image}`/ Freebird Image component are available for use in custom components and scripts.

For example:

```
{.candidate-statements}
  hed: Candidate Statements on Ukraine
  media: _images/groupshot.jpg
  [.candidates]
    name: Candidate 1
    statement: tk tktkt

    name: Candidate 2
    ...
  []
{}
```

See:

- [$lib/shared/Media](../../shared/Media/README.md): High level media helper. Generates images and markup, and queries Scoop as needed.
- [$lib/shared/Wrapper](../../shared/Wrapper/README.md): Consistent sizing and metadata styles.
- [$lib/shared/ImageLoader](../../shared/ImageLoader/): Low level component that takes array of image renditions and renders markup.
- [$lib/shared/ImageLoader](../../shared/Image/): Low level component that takes an image path and renders a single image element.
- [$lib/shared/Media/utils](../../shared/Media/utils.js): Low level helpers for media assets.
- [\_pubic/\_images](../../../../public/_images/README.md): `npm run images` and custom image task description.
