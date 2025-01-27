export type subtitle = {
  text: string;
  start: number;
  end: number;
};

export type videoPlayerOptions = {
  customControls?: boolean;
  playOnlyWhenInView?: boolean;
  treatAsImageIfCantAutoplay?: boolean;
  subtitles?: subtitle[] | undefined;
};

export type customControlsOptions = {
  showPlayPauseButton?: boolean;
  showTime?: boolean;
  showToggleMuteButton?: boolean;
  showPlayAgainButton?: boolean;
  showCC?: boolean;
  showCCButton?: boolean;
  showProgressBar?: boolean;
};
