# VHS Component

## Introduction

The `VHS` component is a video/audio player built with Svelte and utilizing the [VHS library from The New York Times](https://github.com/nytimes/vhs3).

## Props

### Fully Reactive Props

These props are reactive and can be changed during the component's lifecycle.
Some of them might only be used during the initialization of the VHS library and can't be changed afterwards.

- `src` (String): Represents the source URL of the video or audio. Default is an empty string.
- `currentTime` (Number): Current playback time of the video. Default is 0.
- `volume` (Number): Volume level of the video player. Default is 1.
- `playing` (Boolean): Controls the play/pause state of the video.
- `muted` (Boolean): Controls the muted state of the video. Default is `false`
- `fullbleed` (Boolean): Controls whether the video should cover its container, ignoring aspect ratio. Default is `false`.

### Initialization-only props

- `mediaType` (String): Represents the type of media, either 'video' or 'audio'. Default is 'video'.
- `autoplay` (Boolean): Determines whether the video should autoplay. Default is `false`.
- `fullscreen` (Boolean): Whether fullscreen is available. Default is `false`.
- `ratio` (String): Represents the aspect ratio of the video. Default is '16:9'.
- `ads` (Boolean): Controls whether ads should be displayed. Default is `false`.
- `controls` (Boolean/Array): Determines the controls displayed on the video player. Default is `true`.
- `headline` (String): Required for tracking. If missing and needed, a headline will be generated from the src. Will be visible only if using the VHS cover option.
- `loop` (Boolean): Determines whether the video should loop. Default is `false`.
- `poster` (String): URL for the poster image. There are more options (responsive, video) if using vhs_options
- `vhs_options` (Object): Options for the VHS library. See [VHS documentation](https://github.com/nytimes/vhs3/blob/main/doc/OPTIONS.md) for more details. These override other options.

### Read-Only Props

These props are read-only and mainly used for reflecting the internal state of the component. You can bind to them.

- `is_ended` (Boolean): Indicates whether the video has ended.
- `is_active` (Boolean): Indicates whether the video player is active.
- `is_ready` (Boolean): Indicates whether the video player is ready.

## Usage

When used via ArchieML, not all the props are available. Specify the component name as `vhs` and use the props as shown below.

### ArchieML Usage (Video)

```ArchieML
{.video}
    component: vhs
    {.vhs_options}
        # override options
        analytics: false
    {}
    media: video.mp4
    # media: 100000008640667
    controls: true
    muted: true
    loop: true
    autoplay: false
    hed:
    leadin:
    caption:
    altText:
    label:
    source:
    note:
    credit: Tk Credit
    maxWidth: body
    marginInline: true
{}
```

### ArchieML Usage (Audio)

```ArchieML
{.audio}
    {.vhs_options}
        # override options
    {}
    media: audio.mp3
    hed:
    leadin:
    caption:
    altText:
    label:
    source:
    note:
    credit: Tk Credit
    maxWidth: body
    marginInline: true
{}
```

### Svelte Usage (Video)

```svelte
<script>
  import VHS from "$lib/shared/VHS/index.svelte";

  let src = "_assets/video.mp4"; // or a scoop video id
  let autoplay = true;
  let muted = true;
  let controls = false;
  let ratio = "16:9";
</script>

<VHS {src} {autoplay} {muted} {controls} {ratio} />
```

### Svelte Usage (Audio)

```svelte
<script>
  import VHS from "$lib/shared/VHS/index.svelte";

  let src = "_assets/audio.mp3"; // scoop audio IDs do not work
  let mediaType = "audio";
</script>

<VHS {src} {mediaType} />
```
