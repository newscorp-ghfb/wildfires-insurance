<script>
  import { onMount, onDestroy, afterUpdate } from "svelte";
  import ScriptTag from "$lib/shared/ScriptTag/index.svelte";

  const VHS_SCRIPT = "https://static01.nyt.com/video-static/vhs3/vhs.min.js";

  export let vhs_options = {};

  let VHS;
  let hasSources = false;
  let container;
  let isLive = true;

  export let player = undefined;

  // values that start with _ are cached values to check if it's been changed externally

  export let src = "";
  let _src = src;

  /**  @type {import('./index').VideoSource[] } */
  export let sources = [];

  export let currentTime = 0;
  let _currentTime = currentTime;

  export let volume = 1;
  let _volume = volume;

  export let autoplay = false;

  export let playing = false;
  let _playing = playing;

  export let muted = false;
  let _muted = muted;

  export let fullscreen = false;
  let _fullscreen = fullscreen;

  // these values can be set, but are not reactive to changes
  // these can be set via vhs_options but are here as a convenience

  export let mediaType = "video"; // or 'audio'
  export let fullbleed = false;
  export let loop = false;
  export let poster = ""; // if using vhs_options, can pass an array of images
  export let ratio = "16:9";
  export let ads = false; // turn on ads
  export let controls = true; // could also be an array
  export let headline = ""; // required for tracking!

  export let is_ended = false;
  export let is_active = false;
  export let is_ready = false;

  // change player properties in response to props

  afterUpdate(() => {
    if (!is_ready) {
      return;
    }

    // src, this might only work with scoop IDs
    if (_src !== src) {
      player.load(src, playing);
      _src = src;
    }

    // playing
    if (_playing !== playing) {
      if (playing) {
        player.play();
      } else {
        player.pause();
      }
      _playing = playing;
    }

    // volume
    if (_volume !== volume) {
      player.setVolume(volume);
      _volume = volume;
    }

    // muted
    if (_muted !== muted) {
      player.mute(muted);
      _muted = muted;
    }

    // currentTime
    if (_currentTime !== currentTime) {
      player.seek(currentTime);
      _currentTime = currentTime;
    }

    // fullscreen
    if (_fullscreen !== fullscreen) {
      player.fullscreen(fullscreen);
      _fullscreen = fullscreen;
    }
  });

  // sugar for a manual mp4, height is arbitrary since there's only one source
  $: if (src && !isScoopVideo(src) && !sources?.length) {
    sources = [{ height: 360, url: src }];
  }

  $: if (src && isAudioFile(src)) {
    mediaType = "audio";
  }

  $: hasSources = !!sources?.length;

  onMount(() => {
    isLive = window.location.host === "www.nytimes.com";

    VHS = window.VHS;

    if (!VHS) {
      console.error("VHS library not loaded before VHS video component.");
      return;
    }

    if (!headline) {
      console.warn(
        'VHS Component: property "headline" is required for tracking',
      );
      if (mediaType === "audio") {
        headline = "Graphics Audio " + src;
      } else {
        headline = "Graphics Video " + src;
      }
    }

    if (mediaType === "audio") {
      player = startAudioPlayer();
    } else {
      player = startVideoPlayer();
    }

    addEvents(player);
  });

  onDestroy(() => {
    player?.destroy?.();
  });

  function isScoopVideo(srcStr) {
    return srcStr && srcStr.match(/^[0-9]+$/) != null;
  }

  function isAudioFile(srcStr) {
    return srcStr && srcStr.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/) != null;
  }

  function startAudioPlayer() {
    //https://github.com/nytimes/vhs3/blob/main/doc/AUDIO.md
    const options = Object.assign(
      {
        id: 1234, // required (For analytics, right now we are not getting audio data from Scoop)
        container, // required
        src, // required
        headline, // required (For analytics)
        disableAudioDeeplinkInApps: true,
        ads: false,
        width: "100%",
        height: "100%",
        analytics: isLive,
        audioControls: {
          version: 2, // to use the latest version of the audio player instead of the legacy one
          suppressDurationPlaceholder: true, // This prevents "Play Audio" from being displayed,
        },
      },
      vhs_options,
    );

    return VHS.audio(options);
  }

  function startVideoPlayer() {
    // options can be overridden by vhs_options
    // see: https://github.com/nytimes/vhs3/blob/main/doc/OPTIONS.md
    const options = Object.assign(
      {
        id: hasSources ? "nonscoop_video" : src,
        nytd: hasSources ? "nonscoop_video" : src,
        headline: headline, // used for tracking
        container: container,
        api: !hasSources,
        controls: controls,
        autoplay: autoplay,
        preload: "auto",
        ratio: fullbleed ? "none" : ratio, // fullbleed by setting ratio to "none"
        width: "100%",
        height: "100%",
        embeddedOnly: true,
        posterUrl: poster,
        muted: autoplay || muted,
        ads: ads,
        env: "production",
        dataEnv: "production",
        captionsDefaultOn: true,
        type: "interactive", // required to write to DOM
        sources: hasSources ? sources : null,
        cover: false, // show the default cover image and delay video loading
        pauseOtherPlayers: true,
        loop: loop,
        copySlate: false,
        endSlate: false,
        sharetools: false,
        tagx: false,
        viewabilityTracker: false,
        viewportIntersectionObserver: true,
        comscore: isLive && !hasSources, // generally let's track if it's a scoop video
        analytics: isLive,
      },
      vhs_options,
    );

    return VHS(options);
  }

  function addEvents(player) {
    // Keep variables in sync
    // https://github.com/nytimes/vhs3/blob/main/doc/EVENTS.md
    player.on(player.events.READY, () => {
      is_ready = true;

      player.on(player.events.PLAY, () => {
        _playing = playing = true;
        is_ended = false;
      });

      player.on(player.events.PAUSE, () => {
        _playing = playing = false;
      });

      // mouseover
      player.on(player.events.ACTIVE, () => {
        is_active = true;
      });

      player.on(player.events.IDLE, () => {
        is_active = false;
      });

      player.on(player.events.ENDED, () => {
        is_ended = true;
      });

      player.on(player.events.MUTE, () => {
        _muted = muted = player.isMuted();
      });

      player.on(player.events.VOLUME_CHANGE, () => {
        _volume = volume = player.getVolume();
      });

      // seems to be throttled to about a half second or so
      player.on(player.events.TIME_UPDATE, () => {
        _currentTime = currentTime = player.getCurrentTime();
      });

      player.on(player.events.GO_FULLSCREEN, () => {
        _fullscreen = fullscreen = true;
      });
      player.on(player.events.EXIT_FULLSCREEN, () => {
        _fullscreen = fullscreen = false;
      });
    });
  }
</script>

<!-- VHS is included inline due to an outstanding css bug -->
<ScriptTag src={VHS_SCRIPT} inline={true} />

<div
  class:player-ready={is_ready}
  class:player-playing={playing}
  class:player-active={is_active}
  class="g-vhs-video"
  bind:this={container}
/>

<style>
</style>
