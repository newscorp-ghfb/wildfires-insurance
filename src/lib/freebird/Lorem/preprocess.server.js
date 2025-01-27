export default function preprocess(block) {
  let params = {};

  /** @type {string[]} */
  let grafs = [];

  // can take a comma separated list of values like "3-5 words, 2-3 sentences, 1-2 paragraphs"
  if (typeof block.value === "string") {
    const parts = block.value.split(/ *, */).map((value) => value.trim());

    // remap to obj
    params = {};
    parts.forEach((part) => {
      const [val, unit] = part.split(/ +/);
      params[unit] = val;
    });
  } else {
    params = block.value;
  }

  // can set to a number or a range. e.g. 3 or 1-3
  let { words = "", sentences = "", paragraphs = "", lede = "" } = params;

  const LOREM_BANK =
    `lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut
    labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut
    aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
    eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit
    anim id est laborum`
      .replace(/\s+/g, " ")
      .split(" ");

  const COMMA_BANK = `,|,|,|,|,|,|,|;|:| —`.split("|");
  const PERIOD_BANK = `.|.|.|.|.|.|.|.|.|.|.|.|.|?`.split("|");

  let wordsPerSentence = { min: 5, max: 15 };
  let sentencesPerParagraph = { min: 2, max: 7 };
  let paragraphsPerPrompt = { min: 1, max: 1 };

  function random() {
    return Math.random();
  }

  function setMinMax(obj, str) {
    if (!str) return; // in case it's not set manually

    let [min, max] = str.split(/[ -]+/);
    obj.min = parseInt(min);
    obj.max = parseInt(max) || obj.min;
  }

  function getRandomInt(min, max) {
    return Math.floor(random() * (max - min + 1)) + min;
  }

  function getRandomWord() {
    return LOREM_BANK[getRandomInt(0, LOREM_BANK.length - 1)];
  }

  function getRandomSentence() {
    let sentence = "";
    let numWords = getRandomInt(wordsPerSentence.min, wordsPerSentence.max);
    for (let i = 0; i < numWords; i++) {
      sentence += getRandomWord();
      // chance of comma
      if (random() < 0.075 && i < numWords - 1) {
        sentence += COMMA_BANK[getRandomInt(0, COMMA_BANK.length - 1)];
      }
      sentence += " ";
    }

    // capitalize first letter
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);

    return (
      sentence.trim() + PERIOD_BANK[getRandomInt(0, PERIOD_BANK.length - 1)]
    );
  }

  function getRandomParagraph() {
    let paragraph = "";
    let numSentences = getRandomInt(
      sentencesPerParagraph.min,
      sentencesPerParagraph.max,
    );
    for (let i = 0; i < numSentences; i++) {
      paragraph += getRandomSentence() + " ";
    }
    return paragraph.trim();
  }

  // in case of manual word setting only
  if (words && !sentences && !paragraphs) {
    sentences = "1";
  }

  setMinMax(wordsPerSentence, words);
  setMinMax(sentencesPerParagraph, sentences);
  setMinMax(paragraphsPerPrompt, paragraphs);

  // actually roll the dice
  const numParagraphs = getRandomInt(
    paragraphsPerPrompt.min,
    paragraphsPerPrompt.max,
  );

  for (let i = 0; i < numParagraphs; i++) {
    let paragraph = getRandomParagraph();
    grafs.push(paragraph);
  }

  return {
    type: block.type,
    value: {
      paragraphs: grafs,
      lede,
    },
  };
}
