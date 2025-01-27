import { readFileSync } from "node:fs";
import { subtitlesParser } from "./subtitles-parser";

export default function preprocess(block) {
  if (block.value.videoPlayerOptions?.subtitles === "") {
    delete block.value.videoPlayerOptions?.subtitles;
  }

  if (block.value.videoPlayerOptions?.subtitles) {
    const processedSubtitles = processSubtitles(
      block.value.videoPlayerOptions.subtitles,
    );
    if (Array.isArray(processedSubtitles)) {
      block.value.videoPlayerOptions.subtitles = processedSubtitles;
    }
  }

  return {
    ...block,
  };
}

function processSubtitles(filename) {
  try {
    const file = readFileSync(`public/${filename}`, "utf8");
    const parsed = subtitlesParser.fromSrt(file, true).map((x) => ({
      text: x.text.split("\n").join(" "),
      start: x.startTime / 1000, //converting to seconds from ms
      end: x.endTime / 1000, //converting to seconds from ms
    }));
    return parsed;
  } catch (error) {
    return null;
  }
}
