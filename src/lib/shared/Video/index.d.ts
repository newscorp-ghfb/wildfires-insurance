export type VideoProps = {
  src: string;
  lazy?: boolean;
  autoplay?: boolean;
  width?: string | number;
  height?: string | number;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsinline?: boolean;
  poster?: string;
  preload?: string;
};
