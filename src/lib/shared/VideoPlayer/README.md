# VideoPlayer

The Svelte Video Player is an alternative to the native VHS player, used when a story requires custom control over design and/or development aspects such as: caption styling, media orchestration, custom playback events, integration with other Svelte components and UI styling.

## Usage

### Via ArchieML:

```archieml
{.video}
	media: https://int.nyt.com/data/videotape/finished/2022/10/mideast-heat/mideast_030-1254w.mp4
	# Scoop ID, Videotape url or path to a local file

	mediaComponent: VideoPlayer
	autoplay: true
	loop: true
	muted: true
{}

```

or with additional parameters

```archieml
{.video}
	media: https://int.nyt.com/data/videotape/finished/2021/07/1626309009/route-setting_master_colorsound-1254w.mp4

	mediaComponent: VideoPlayer
	autoplay: true
	loop: true
	muted: true

	{.videoPlayerOptions}
		customControls: true
		playOnlyWhenInView: true
		treatAsImageIfCantAutoplay: false
		subtitles: _assets/ondra-route-setting.srt
	{}
{}


```

A Scoop ID, Videotape link or path to a local file can be passed in the `media` prop. For Scoop and Videotape sources, renditions and metadata are loaded automatically by the `media` middleware — see documentation on the [Media](https://github.com/newsdev/birdkit/tree/main/packages/template-freebird/src/lib/shared/Media#readme) component.

### Via custom component:

You will need to load renditions via utility functions if you are using the player inside another component:

#### Videotape video

```svelte
<script>
	import VideoPlayer from '$lib/shared/VideoPlayer/index.svelte';
	import { getVideotapeRenditions, getVideotapePosters } from '$lib/shared/Media/utils.js';

	export let props = {};
	$: ({ media } = archiemlPropsForBreakpoint(props, $windowWidth));
</script>

<VideoPlayer
	renditions={getVideotapeRenditions(props.media)}
	posters={getVideotapePosters(media)}
	autoplay={true}
	muted={true}
	loop={true}
	videoPlayerOptions={{ customControls: true, playOnlyWhenInView: true }}
>
```

#### Scoop video

```svelte
<script>
	import VideoPlayer from '$lib/shared/VideoPlayer/index.svelte';
	import { getScoopVideoRenditions, getScoopVideoPosters } from '$lib/shared/Media/utils.js';

	export let props = {};
	$: ({ media } = archiemlPropsForBreakpoint(props, $windowWidth));
</script>

<VideoPlayer
	renditions={getScoopVideoRenditions(props.media)}
	posters={getScoopVideoPosters(media)}
	autoplay={true}
	muted={true}
	loop={true}
	videoPlayerOptions={{ playOnlyWhenInView: true }}
>
```

#### Local video

When using a local video file, you can pass an `src` instead. Notice that no metadata is read from your local file, so you need to pass `ratio` and `poster` manually as well.

```svelte
<script>
  import VideoPlayer from "$lib/shared/VideoPlayer/index.svelte";
  export let props = {};

  $: ({ media } = archiemlPropsForBreakpoint(props, $windowWidth));
</script>

<VideoPlayer
  src={"_assets/local-video.mp4"}
  poster={"_assets/local-image.jpg"}
  ratio={"16:9"}
  autoplay={true}
  muted={true}
  loop={false}
/>
```

On the examples above, the line `$: ({ media } = archiemlPropsForBreakpoint(props, $windowWidth));` is only needed if you are passing a `media` and a `media-desktop` from the doc. That code will determine which one to use based on the current breakpoint.

## Google Doc Props

| prop                                                                              | type    | default | description                                                                                                                                                                                                                                                                                                                                                                                |
| :-------------------------------------------------------------------------------- | :------ | :------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| media                                                                             | string  | none    | Scoop id, Videotape url or path to a local video file.                                                                                                                                                                                                                                                                                                                                     |
| autoplay                                                                          | boolean | false   | Emulates native video attribute behavior. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/autoplay) for details. Note that videos with [videoPlayerOptions.playOnlyWhenInView](#play-only-when-in-view) set to `true` will play without user interaction even if they have `autoplay` set to `false` — as long as [these other conditions](#autoplay) are met. |
| loop                                                                              | boolean | false   | Emulates native video attribute behavior. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loop) for details..                                                                                                                                                                                                                                                  |
| muted                                                                             | boolean | false   | Emulates native video attribute behavior. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/muted) for details.                                                                                                                                                                                                                                                  |
| playsinline                                                                       | boolean | true    | Emulates native video attribute behavior. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video) for details.                                                                                                                                                                                                                                                          |
| preload                                                                           | string  | auto    | Emulates native video attribute behavior. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video) for details.                                                                                                                                                                                                                                                          |
| controls                                                                          | boolean | false   | Emulates native video attribute behavior. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/controls) for details.                                                                                                                                                                                                                                               |
| [videoPlayerOptions.customControls](#custom-controls)                             | boolean | true    | Boolean indicating whether to display the player’s custom UI.                                                                                                                                                                                                                                                                                                                              |
| [videoPlayerOptions.playOnlyWhenInView](#play-only-when-in-view)                  | boolean | true    | Boolean indicating whether the video should only start playing when in view — and stop when leaving the viewport.                                                                                                                                                                                                                                                                          |
| [videoPlayerOptions.treatAsImageIfCantAutoplay](#treat-as-image-if-cant-autoplay) | boolean | false   | If set to `true`, the poster image will be displayed without the option to play the video when playback fails.                                                                                                                                                                                                                                                                             |
| [videoPlayerOptions.subtitles](#subtitles)                                        | string  | none    | Path to a local `.srt` file to be used as subtitles. Note that the file will be read and parsed by a preprocessor, which will then convert this prop to an array of objects like: `{ text: string; start: number; end: number; }` .                                                                                                                                                        |
| id                                                                                | string  | ''      | A string to set the `id` on the videoplayer’s container.                                                                                                                                                                                                                                                                                                                                   |
| altText                                                                           | string  | ''      | A string to be used as `aria-label` on the `<video>` element.                                                                                                                                                                                                                                                                                                                              |
| poster\*                                                                          | url     | ''      | Url to poster image. Overrides passed in `posters`, which are automatically generated for VideoTape and Scoop videos.                                                                                                                                                                                                                                                                      |
| ratio\*                                                                           | string  | ''      | String representation of aspect ratio in w:h form, like 16:9. This value will be used to set the container’s aspect ratio, helping the browser allocate the right space for the video before it loads. This is automatically generated for VideoTape and Scoop videos.                                                                                                                     |

\* Needed when using a local file.

## Component Props

In addition to the props listed above, these can be passed when using the `VideoPlayer` inside another component.

| prop                                     | type            | default                 | description                                                                                                                                                                                                                                                                   |
| :--------------------------------------- | :-------------- | :---------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| renditions                               | MediaRenditions | []                      | MediaRenditions array of possible source video urls which will be automatically selected by player.                                                                                                                                                                           |
| posters                                  | MediaRenditions | []                      | MediaRenditions array of possible poster urls which will be automatically selected by player.                                                                                                                                                                                 |
| src                                      | string          | ''                      | Url to valid video file. Overrides passed in `renditions`.                                                                                                                                                                                                                    |
| active                                   | boolean         | Derived from `autoplay` | Boolean used to control playback via a parent component. Setting its value to `true` or `false` will play or pause the video, respectively.                                                                                                                                   |
| volume                                   | number          | 1                       | Number used to control the volume of the video.                                                                                                                                                                                                                               |
| videoPlayerOptions.subtitles             | subtitle[]      | none                    | An array of objects like: `{ text: string; start: number; end: number; }` . Note that if you are passing this prop from the doc, you just need the path to the srt file (see **Google Doc Props** above). For instructions on how to pass subtitles via component, see below. |
| videoPlayerOptions.customControlsOptions | {}              | none                    | Object with options to customize UI display (see below for more details).                                                                                                                                                                                                     |

## Advanced Use: videoPlayerOptions

### <a name="custom-controls"></a>customControls

The player’s custom UI. To toggle display on individual elements, a `customControlsOptions` prop can be passed via component:

```svelte
<VideoPlayer
  renditions={getVideotapeRenditions(props.media)}
  autoplay={true}
  muted={true}
  loop={true}
  customControlsOptions={{
    showPlayPauseButton: false,
    showTime: false,
    showToggleMuteButton: true,
    showPlayAgainButton: false,
    showProgressBar: false,
  }}
/>
```

This is the full list of `customControlOptions` and their defaults:

| prop                 | default                                               |
| :------------------- | :---------------------------------------------------- |
| showPlayPauseButton  | true                                                  |
| showTime             | true                                                  |
| showToggleMuteButton | true                                                  |
| showPlayAgainButton  | false                                                 |
| showProgressBar      | false                                                 |
| showCC               | Derived from `subtitles` (true when they are present) |
| showCCButton         | Derived from `subtitles` (true when they are present) |

### <a name="play-only-when-in-view"></a>playOnlyWhenInView

This implements a scroll-triggered playback. In autoplaying videos this options defaults to `true`.
Use this feature when:

- You want videos to autoplay (not click-to-play), but it’s important that users watch the videos from the beginning (they are not cinemagraphs).
- You have videos with audio and you want to make sure they stop playing when they leave the viewport.
- You have too many autoplaying videos on the page at once and may be concerned about the impact on performance.

### <a name="treat-as-image-if-cant-autoplay"></a>treatAsImageIfCantAutoplay

Sometimes when the video playback fails ([see below for more about autoplaying videos](#autoplay)) we don’t want to display a play button, but simply use a static image instead. That is a common use case when using a cinemagraph as topper art, for instance.
Note that the default value for this property is false, meaning that a play button will be displayed.

### <a name="subtitles"></a>subtitles

When passing this prop from the doc you only need to provide a path to a local `.srt` file. The preprocessor file in `src/lib/freebird/Video` will convert the file into an array of objects like `{ text: string; start: number; end: number; }`.

If you are using the player inside a custom component, the easiest way yo get subtitles to work is to create a preprocessor for your component and include part of the script from the `Video` preprocessor.

## Events dispatched

When interfacing with the `VideoPlayer` via another component, you have access to the following variables dispatched via events: `currentTime`, `paused`, `ended`.

Example:

```svelte
<VideoPlayer
  on:video_current_time={(evt) => console.log("currentTime:", evt.detail)}
  on:video_paused={() => console.log("The video has paused.")}
  on:video_ended={() => console.log("The video has ended.")}
/>
```

## <a name="autoplay"></a>On autoplaying videos

Videos will autoplay on page load only if:

- they are muted
- low power mode is off (on mobile devices)
- the user has not set the accessibility preferences to reduce motion

If the conditions above are met, videos with `playOnlyWhenInView: true` will play without interaction from the user even if set to `autoplay: false`.
