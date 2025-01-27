import type Base from "./Base.svelte";

/**
 * Standard single-url media rendition, which includes
 * a full url and height/width values for client-side use.
 */
export type MediaRendition = {
  url: string;
  height: number;
  width: number;
  retinaUrl?: string;
  cropName?: string;
};

export type MediaRenditions = MediaRendition[];

/**
 * Media types used to confirm Base.svelte expectedType prop. These don't
 * all map to one-to-one with the SupportedAssetType. This prop combines
 * related assets (eg: local images and scoop images) into their core idea
 * for template reuse;
 */
export type ExpectedType =
  | ""
  | "video"
  | "audio"
  | "image"
  | "graphic"
  | "embed"
  | "slideshow";

// ensure these list match the asset types in ./constants.ts
export type SupportedAssetType =
  | "localImage"
  | "localVideo"
  | "remoteImage"
  | "localResponsiveImage"
  | "scoopImage"
  | "scoopSlideshow"
  | "scoopVideo"
  | "scoopAudio"
  | "remoteAudio"
  | "videotape"
  | "graphic"
  | "scoopEmbeddedInteractive";

export type SupportedMediaComponent =
  | "Graphic"
  | "Image"
  | "ImageLoader"
  | "Slideshow"
  | "Video"
  | "VideoPlayer"
  | "VHS";

/**
 * The base props for the media middleware
 * passed into all Media objects and templates.
 * */
type BaseMediaObject = {
  assetType: SupportedAssetType;
  mediaComponent: SupportedMediaComponent;
  assetSlug: string;
  breakpointName?: string;
  assetErrors: string[];
};

/**
 * Generic media object with possible props.
 * */
export type MediaObject = BaseMediaObject & {
  // common properties
  slug?: string;
  outputPath?: string;
  widths?: number[];
  extensions?: string[];
  hasRetina?: boolean;
  ratio?: number;
  url?: string;
  css?: string;
  js?: string;
  html?: string;
};

export type LocalImageObject = BaseMediaObject & {
  url: string;
};

export type LocalResponsiveImageObject = BaseMediaObject & {
  slug: string;
  outputPath: string;
  widths: number[];
  extensions: string[];
  hasRetina: boolean;
  ratio: number;
};

export type LocalVideoObject = BaseMediaObject & {
  url: string;
};

export type VideoTapeObject = BaseMediaObject;

export type ScoopImageObject = BaseMediaObject & {
  crops: any[];
  caption: {
    text: string;
  };
  altText?: string;
  credit?: string;
  summary?: string;
  original?: {
    width: number;
    height: number;
  };
};

export type ScoopSlide = {
  url: string;
  slug: string;
  caption: {
    text: string;
  };
  imageType: string;
  image: ScoopImageObject;
  promotionalImage?: {
    image: ScoopImageObject;
  };
};

export type ScoopSlideShowObject = BaseMediaObject & {
  slides: ScoopSlide[];
  summary?: string;
};

export type ScoopVideoObject = BaseMediaObject & {
  renditions: any[];
  promotionalImage?: {
    image: ScoopImageObject;
  };
};

export type ScoopAudioObject = BaseMediaObject & {
  fileUrl: string;
};

export type MediaProps = {
  media: MediaObject;
  altText?: string;
  lazy?: boolean;
  cropName?: string | string[];
};
