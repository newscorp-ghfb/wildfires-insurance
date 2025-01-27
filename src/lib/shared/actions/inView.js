export default function inView(node, params) {
  let observer;

  const handleIntersect = (e) => {
    const {
      intersectionRatio,
      boundingClientRect,
      intersectionRect,
      isIntersecting,
      rootBounds,
      target,
      time,
    } = e[0];

    const message = isIntersecting ? "enter" : "exit";

    node.dispatchEvent(
      new CustomEvent(message, {
        detail: {
          intersectionRatio,
          boundingClientRect,
          intersectionRect,
          isIntersecting,
          rootBounds,
          target,
          time,
        },
      }),
    );
  };

  const setObserver = (params) => {
    let options = {};

    if (params) {
      const marginTop = params.top ? validateMargin(params.top) : "0px";
      const marginBottom = params.bottom
        ? validateMargin(params.bottom)
        : "0px";
      options.rootMargin = params.rootMargin
        ? params.rootMargin
        : `${marginTop} 0px ${marginBottom} 0px`;

      if (params.threshold)
        options.threshold = validateThreshold(params.threshold);
      if (params.root) options.root = params.root;
    }

    if (observer) observer.disconnect();
    observer = new IntersectionObserver(handleIntersect, options);
    observer.observe(node);
  };

  function validateMargin(margin) {
    const pattern = /(-?\d+)(px|%)/g;
    const matches = margin.match(pattern);

    let number, unit;

    if (matches) {
      for (const match of matches) {
        const [numberPart, unitPart] = match.match(/(-?\d+)(px|%)/).slice(1);
        number = numberPart;
        unit = unitPart;
      }
    } else {
      number = margin;
      unit = "px";
    }
    return `${number * -1}${unit}`;
  }

  function validateThreshold(array) {
    return array.map((n) =>
      typeof n === "string" && n.includes("%")
        ? parseInt(n.slice(0, -1)) / 100
        : n,
    );
  }

  setObserver(params);

  return {
    update(params) {
      setObserver(params);
    },

    destroy() {
      if (observer) observer.disconnect();
    },
  };
}
