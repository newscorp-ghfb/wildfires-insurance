import type {
  ExpectedType,
  SupportedAssetType,
  SupportedMediaComponent,
} from "./index";

export const AssetTypeToExpectedType: Record<SupportedAssetType, ExpectedType> =
  {
    localImage: "image",
    remoteImage: "image",
    localResponsiveImage: "image",
    scoopImage: "image",
    scoopSlideshow: "slideshow",
    scoopVideo: "video",
    videotape: "video",
    localVideo: "video",
    scoopAudio: "audio",
    remoteAudio: "audio",
    graphic: "graphic",
    scoopEmbeddedInteractive: "embed",
  };

export const AssetTypeToComponentMapping: Record<
  SupportedAssetType,
  SupportedMediaComponent[]
> = {
  localImage: ["Image"],
  remoteImage: ["Image"],
  localResponsiveImage: ["ImageLoader"],
  scoopImage: ["ImageLoader"],
  scoopSlideshow: ["Slideshow"],
  localVideo: ["VideoPlayer", "Video"],
  scoopVideo: ["VHS", "VideoPlayer", "Video"],
  videotape: ["VHS", "VideoPlayer", "Video"],
  graphic: ["Graphic"],
  scoopAudio: ["VHS"],
  remoteAudio: ["VHS"],
  scoopEmbeddedInteractive: ["Graphic"],
};

/**
 * List of all available supported assets
 */
export const AvailableAssetTypesSet = new Set(
  Object.keys(AssetTypeToExpectedType) as SupportedAssetType[],
);

/**
 * List of all available media components
 */
export const AvailableMediaComponentsSet = Array.from(
  AvailableAssetTypesSet,
).reduce((accumulator, currentAssetTypeSlug) => {
  const componentsForAssetType =
    AssetTypeToComponentMapping[currentAssetTypeSlug as SupportedAssetType];
  componentsForAssetType.forEach((componentName) =>
    accumulator.add(componentName),
  );
  return accumulator;
}, new Set() as Set<string>);

/**
 * List of all available expected types, like 'video', 'audio', 'image', etc.
 */
export const ExpectedTypesSet = new Set(Object.values(AssetTypeToExpectedType));

/**
 * Mapping in object literal of all supported media components for an expectedType
 * eg: { image:
 * ['Image', 'ImageLoader'],
 * slideshow: ['Slideshow],
 * etc...}
 */
export const ExpectedTypeToComponentMapping = Array.from(
  ExpectedTypesSet,
).reduce(
  (accumulator, currentExpectedType) => {
    // assetTypes associated with expectedType
    // for example: video: Set(['scoopVideo', 'videotape']);
    const assetTypesForExpectedType = new Set<SupportedAssetType>();
    Object.entries(AssetTypeToExpectedType).forEach(
      ([assetType, expectedType]) => {
        if (expectedType === currentExpectedType) {
          assetTypesForExpectedType.add(assetType as SupportedAssetType);
        }
      },
    );

    // Using mapping in assetTypesForExpectedType, grab
    // all the components that could handle the expectedType
    const componentsForExpectedType = new Set<SupportedMediaComponent>();
    Object.entries(AssetTypeToComponentMapping).forEach(
      ([assetType, components]) => {
        if (assetTypesForExpectedType.has(assetType as SupportedAssetType)) {
          components.forEach((component) =>
            componentsForExpectedType.add(component),
          );
        }
      },
    );
    accumulator[currentExpectedType as ExpectedType] = Array.from(componentsForExpectedType);

    return accumulator;
  },
  {} as Record<ExpectedType, SupportedMediaComponent[]>,
);
