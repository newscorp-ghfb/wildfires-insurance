import { MediaRendition } from "../Media/index";

export type ImageRendition = MediaRendition;
export type ImageRenditions = ImageRendition[];

export type ProcessedImageRendition = ImageRendition & {
  mediaQuery: string;
  isMobileRendition: boolean;
  srcSetUrl: string;
  aspectRatio: string;
  ratio: float;
};

export type ProcessedImageRenditions = ProcessedImageRendition[];
