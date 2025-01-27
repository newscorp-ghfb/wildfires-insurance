import type { WrapperProps } from "../Wrapper/index.ts";
import type { MediaProps } from "../Media/index.ts";

type RowsCols = {
  rows: number;
  cols: number;
};

/**
 * Grid items act as pass through objects for nested Media and Wrappers,
 * so their interface needs to look a lot like top-level Freebird components,
 * supporting the same left of metadata.
 * */
export type GridItem = WrapperProps &
  MediaProps &
  RowsCols & {
    // grid component manually produces these from values
    // plucked from GridItem root
    mediaProps: MediaProps;
    rowsCols: RowsCols;
    wrapperProps: WrapperProps;
  };

export type GridProps = WrapperProps & {
  items: GridItem[];
  cols: number;
};
