import { format, baseAssetsPath, baseImagesPath } from "./config.js";

const wayAppoxDist = 40; // distance between each way split point (lower means higher accuracy)
const lerpDivisor = 12; // interpolates current scroll percent to destination percent (higher takes longer)
const fpsInterval = 1000 / 30; // animate at 30 frames per second
const layerDelay = 3000; // update layers with info from the doc after x milliseconds

export const hasValue = (key) => {
  return typeof key !== "undefined" && key !== null;
};

export const wayfinder = (container, props, showInset, ScrollMagic) => {
  let isMobile =
    (window.matchMedia("(any-hover: none)").matches &&
      window.visualViewport.height > window.visualViewport.width) ||
    window.visualViewport.width < 600;

  // let us override baseImagesPath and baseAssetsPath. this is useful for the documentation
  const imagesPath = hasValue(props.baseImagesPath)
    ? props.baseImagesPath
    : baseImagesPath;
  const assetsPath = hasValue(props.baseAssetsPath)
    ? props.baseAssetsPath
    : baseAssetsPath;

  let version = isMobile ? "mobile" : "desktop";

  const waySVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const wayPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );

  // const labelsContainer = container.querySelector('.g-wayfinder-labels-container');
  // const labels = container.querySelector('.g-wayfinder-labels');

  const tilesContainer = container.querySelector(
    "div.g-wayfinder-sticky > div.g-wayfinder-tiles-container",
  );
  const debugContainer = container.querySelector(
    "div.g-wayfinder-scroll-annotations",
  );
  const annotations = container.querySelectorAll(
    "div.g-wayfinder-scroll-annotations > div.g-wayfinder-scroll-slides",
  );
  const insetContainer = container.querySelector(
    "div.g-wayfinder-sticky > div.g-wayfinder-inset-container",
  );
  const insetCover = container.querySelector(
    "div.g-wayfinder-sticky > div.g-wayfinder-inset-container div.g-wayfinder-inset-cover",
  );
  const insetArea = container.querySelector(
    "div.g-wayfinder-sticky > div.g-wayfinder-inset-container div.g-wayfinder-inset-area",
  );

  let containerHeight = isMobile
    ? parseInt(props.mobileScrollHeight)
    : parseInt(props.desktopScrollHeight);

  let containerScroll = new ScrollMagic.Scene({
    triggerElement: container,
    triggerHook: "onCenter",
    offset: window.innerHeight / -2,
  });

  let controller = new ScrollMagic.Controller({ container: window });
  let scrollPct = 0;
  let scrollPctAdj = 0;
  let tilesOrigWidth = 0;
  let tilesOrigHeight = 0;
  let then = Date.now();
  let now = null;
  let wayPathLength = 0;
  let zooms = [];
  let debugMode = hasValue(props.debug) && props.debug === true;

  container.querySelector(".g-wayfinder").style.height = containerHeight + "px";

  containerScroll
    .addTo(controller)
    .duration(container.clientHeight)
    .on("progress", (e) => {
      if (scrollPct !== e.progress) {
        scrollPct = e.progress;

        // if (scrollPct < scrollStart) scrollPctAdj = 0;
        // // else if (scrollPct > scrollEnd) scrollPctAdj = 1;
        // else scrollPctAdj = (scrollPct - scrollStart) * (1 / (1 - scrollLength));
      }
    });

  if (hasValue(props.slides)) {
    props.slides.forEach(function (slide, index) {
      let parsePct = parseFloat(slide.percent),
        valPct = isNaN(parsePct) ? 0 : parsePct,
        yPos = slide.percent !== undefined ? valPct * containerHeight : 0;

      annotations[index].style.height = "1px";
      annotations[index].style.position = "absolute";
      annotations[index].style.top = yPos + "px";
    });
  }

  const setupScene = (json) => {
    tilesOrigWidth = json.stage.width;
    tilesOrigHeight = json.stage.height;

    wayPath.setAttribute("d", json.ways[version]);
    waySVG.appendChild(wayPath);

    wayPathLength = wayPath.getTotalLength();
    zooms = fillZoomArray(isMobile, wayPath, json);

    addTiles(tilesContainer, version, json);

    if (showInset) {
      addInset(isMobile, insetContainer, version, json);
    }

    addSymbols(tilesContainer, json);
    addTexts(tilesContainer, json); // TODO: add mobile version

    setTimeout(function () {
      updateLayers(props);
    }, layerDelay);

    if (debugMode) addDebugElems(debugContainer, containerHeight);

    animate();
  };

  const animate = () => {
    now = Date.now();
    //console.log(checkVisible(container))

    // enough time has passed and it's in view and it's still tweening
    if (
      now - then > fpsInterval &&
      checkVisible(container) &&
      Math.abs(scrollPct - scrollPctAdj) > 0.0001
    ) {
      then = now - ((now - then) % fpsInterval);

      let pctBetween,
        adjWidth,
        adjHeight,
        viewportHeight = window.visualViewport.height,
        viewportWidth = window.visualViewport.width,
        zoomsIndexEnd = zooms.length - 1;

      // loop through zoom frames to determine tile container dimensions
      for (let i = zoomsIndexEnd; i > 0; i--) {
        // scroll percent is less than first zoom frame, or only one zoom frame exists
        if (!i && (scrollPctAdj <= zooms[i].pct || zooms.length === 1)) {
          adjWidth = zooms[0].width;
          adjHeight = zooms[0].height;
        }
        // scroll percent is between two zoom frames
        else if (i) {
          if (
            zooms[i - 1].pct <= scrollPctAdj &&
            zooms[i].pct >= scrollPctAdj
          ) {
            (pctBetween =
              (scrollPctAdj - zooms[i - 1].pct) /
              (zooms[i].pct - zooms[i - 1].pct)),
              (adjWidth =
                zooms[i - 1].width +
                (zooms[i].width - zooms[i - 1].width) * pctBetween),
              (adjHeight =
                zooms[i - 1].height +
                (zooms[i].height - zooms[i - 1].height) * pctBetween);
            break;
          }
          // scroll percent is greater than last frame
          if (scrollPctAdj >= zooms[zoomsIndexEnd]) {
            adjWidth = zooms[zoomsIndexEnd].width;
            adjHeight = zooms[zoomsIndexEnd].height;
          }
        }
      }

      let rescale = isMobile
          ? tilesOrigHeight / adjHeight
          : tilesOrigWidth / adjWidth,
        viewRatio = isMobile
          ? viewportHeight / tilesOrigHeight
          : viewportWidth / tilesOrigWidth,
        newWidth = tilesOrigWidth * rescale * viewRatio,
        newHeight = tilesOrigHeight * rescale * viewRatio,
        currWayPos = scrollPctAdj * wayPathLength,
        aimPoint = wayPath.getPointAtLength(currWayPos),
        aimScalex = newWidth / tilesOrigWidth,
        aimScaleY = newHeight / tilesOrigHeight,
        newLeft = -(aimPoint.x * aimScalex - viewportWidth / 2),
        newTop = -(aimPoint.y * aimScaleY - viewportHeight / 2),
        insetWidth = viewportWidth / newWidth,
        insetHeight = viewportHeight / newHeight,
        // insetHalfW = insetWidth / 2,
        // insetHalfH = insetHeight / 2,
        insetTop = -1 * (newTop / newHeight),
        insetLeft = -1 * (newLeft / newWidth);

      //console.log(adjWidth)

      tilesContainer.style.width = newWidth + "px";
      tilesContainer.style.height = newHeight + "px";
      tilesContainer.style.top = newTop + "px";
      tilesContainer.style.left = newLeft + "px";

      if (showInset) {
        insetArea.style.width = insetWidth * 100 + "%";
        insetArea.style.height = insetHeight * 100 + "%";
        insetArea.style.top = insetTop * 100 + "%";
        insetArea.style.left = insetLeft * 100 + "%";

        /* prettier-ignore */
        insetCover.style.clipPath = "polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, " + 
										(insetLeft * 100) + "% " + 
										(insetTop * 100) + "%, " + 
										((insetLeft + insetWidth) * 100) + "% " + 
										(insetTop * 100) + "%, " + 
										((insetLeft + insetWidth) * 100) + "% " + 
										((insetTop + insetHeight) * 100) + "%, " +
										(insetLeft * 100) + "% " + 
										((insetTop + insetHeight) * 100) + "%, " +
										(insetLeft * 100) + "% " + 
										(insetTop * 100) + "%)";
      }

      scrollPctAdj = scrollPctAdj + (scrollPct - scrollPctAdj) / lerpDivisor;

      if (hasValue(props.eventListener)) {
        const event = new CustomEvent("wayfinder", {
          detail: {
            id: props.id || container,
            element: container,
            scrollPct: scrollPct,
            scrollPctAdj: scrollPctAdj,
            version: version,
          },
        });
        window.dispatchEvent(event);
      }

      let childLen = tilesContainer.children.length;

      while (childLen--) {
        const image = tilesContainer.children[childLen];

        if (!image.highLoaded && checkVisible(image)) {
          const img = new Image();

          img.onload = function () {
            this.highLoaded = true;
            image.highLoaded = true;
            this.style.top = image.highAttrs.top + "%";
            this.style.left = image.highAttrs.left + "%";
            this.style.width = image.highAttrs.width + "%";
            this.style.height = image.highAttrs.height + "%";
            this.style.zIndex = 101;

            tilesContainer.appendChild(this);
          };
          img.src = image.highURL;
        }
      }
    }

    requestAnimationFrame(animate);
  };

  if (hasValue(props.params)) {
    fetch(props.params)
      .then((response) => response.json())
      .then((json) => {
        setupScene(json);
      });
  } else {
    console.log("WAYFINDER: [params] json file missing from the doc");
  }

  const addTiles = (container, version, json) => {
    if (!hasValue(props[version + "Image"])) {
      console.log(
        "WAYFINDER: missing [" + version + "Image] variable. skipping.",
      );
    }
    if (
      !hasValue(props[version + "Rows"]) &&
      !hasValue(props[version + "Columns"])
    ) {
      console.log(
        "WAYFINDER: missing [" +
          version +
          "Rows] or [" +
          version +
          "Columns] variable. skipping.",
      );
    }

    let rows = parseInt(props[version + "Rows"]),
      columns = parseInt(props[version + "Columns"]),
      twoPctWidth = 2 / json.stage.width,
      twoPctHeight = 2 / json.stage.height,
      rowSpanPct = 100 / rows,
      columnSpanPct = 100 / columns,
      folders = props[version + "Image"].split("/"),
      split =
        folders.length > 0
          ? folders[folders.length - 1].split(".")
          : props[version + "Image"].split("."),
      name = split[0];

    container.style.width = json.stage.width + "px";
    container.style.height = json.stage.height + "px";

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const img = new Image();

        img.style.width = columnSpanPct + twoPctWidth * 2 + "%";
        img.style.height = rowSpanPct + twoPctHeight * 2 + "%";
        img.style.top = y * rowSpanPct - twoPctHeight + "%";
        img.style.left = x * columnSpanPct - twoPctWidth + "%";
        img.style.zIndex = 100;

        img.onload = function () {
          img.highURL = `${imagesPath}/${name}-${version}-${x}-${y}.${format.extension}`;
          img.highAttrs = {
            top: y * rowSpanPct,
            left: x * columnSpanPct,
            width: columnSpanPct,
            height: rowSpanPct,
          };
          img.highLoaded = false;
          container.appendChild(img);
        };

        img.src = `${imagesPath}/${name}-low-${version}-${x}-${y}.${format.extension}`;
      }
    }
  };

  const addTexts = (container, json) => {
    if (!hasValue(json.texts) || !json.texts.length) return;

    json.texts.forEach(function (text) {
      const div = document.createElement("div");

      div.id = text.globals.id;
      div.style.width = text.globals.width;
      div.style.height = text.globals.height;
      div.style.top = text.globals.top;
      div.style.left = text.globals.left;
      div.style.alignItems = text.globals.alignItems;
      div.style.marginLeft = text.globals.marginLeft;
      div.style.marginTop = text.globals.marginTop;
      // div.style.borderStyle = "none";
      div.style.zIndex = 103;

      div.highLoaded = true;

      for (const [key, value] of Object.entries(text.attrs)) {
        div.style[key] = value;
      }

      const spanContainer = document.createElement("div");
      spanContainer.style.textAlign = text.globals.textAlign;

      text.blocks.forEach(function (block) {
        let span = document.createElement("span");

        for (const [key, value] of Object.entries(block.diffs)) {
          span.style[key] = value;
        }
        span.innerText = block.text;
        spanContainer.append(span);
      });

      div.append(spanContainer);
      container.appendChild(div);
    });
  };

  const addSymbols = (container, json) => {
    if (!hasValue(json.symbols) || !json.symbols.length) return;

    json.symbols.forEach(function (symbol) {
      const img = new Image(),
        pctLeft = (symbol.center[0] / json.stage.width) * 100,
        pctTop = (symbol.center[1] / json.stage.height) * 100;

      img.id = symbol.id;
      img.style.width = symbol.width + "px";
      img.style.height = symbol.height + "px";
      img.style.top = pctTop + "%";
      img.style.left = pctLeft + "%";
      img.style.marginLeft = symbol.width / -2 + "px";
      img.style.marginTop = symbol.height / -2 + "px";
      img.style.borderStyle = "none";
      img.style.zIndex = 102;

      img.onload = function () {
        this.highLoaded = true;
        container.appendChild(img);
      };

      img.src = `${assetsPath}/symbols/${symbol.name}`;
    });
  };

  const addDebugElems = (container, height) => {
    // const showTwoDigits = (number) => {
    // 	return ('00' + number).slice(-2);
    // };

    for (let i = 0; i < 1; i += 0.01) {
      let debugSlide = document.createElement("div");

      debugSlide.innerHTML = i.toFixed(2);
      debugSlide.className = "g-wayfinder-debug-pct";
      debugSlide.style.height = "1px";
      debugSlide.style.position = "absolute";
      debugSlide.style.top = height * i + "px";

      container.appendChild(debugSlide);
    }
  };

  const addInset = (isMobile, container, version, json) => {
    const maxSmallDim = isMobile ? 120 : 140;
    const folders = props[version + "Image"].split("/");
    const split =
      folders.length > 0
        ? folders[folders.length - 1].split(".")
        : props[version + "Image"].split(".");
    const name = split[0];
    const isWider = json.stage.width > json.stage.height;
    const sizeMult = isWider
      ? json.stage.width / json.stage.height
      : json.stage.height / json.stage.width;
    const width = isWider ? maxSmallDim * sizeMult : maxSmallDim;
    const height = isWider ? maxSmallDim : maxSmallDim * sizeMult;

    container.style.backgroundImage = `url('${imagesPath}/${name}-${version}-inset.${format.extension}')`;
    container.style.backgroundSize = "contain";
    container.style.width = width + "px";
    container.style.height = height + "px";
  };

  const updateLayers = (props) => {
    if (hasValue(props.layers)) {
      props.layers.forEach(function (layer) {
        if (hasValue(layer.layer)) {
          let textElem = document.querySelector("#" + layer.layer + " > div"),
            symbolElem = document.getElementById(layer.layer);

          if (hasValue(textElem)) {
            let style = hasValue(layer.style)
              ? ' class="' + layer.style + '"'
              : "";
            if (hasValue(layer.text))
              textElem.innerHTML =
                "<span" + style + ">" + layer.text + "</span>";
          } else if (hasValue(symbolElem) && hasValue(layer.style)) {
            symbolElem.classList.add(layer.style);
          }
        }
      });
    }
  };

  const distance = (point1, point2) => {
    return Math.sqrt(
      Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2),
    );
  };

  const fillZoomArray = (isMobile, way, json) => {
    const wayLength = way.getTotalLength(),
      steps = Math.round(wayLength / wayAppoxDist),
      wayPoints = [],
      framesPct = [],
      frames = isMobile ? json.zooms.mobile : json.zooms.desktop;

    for (let i = 0; i < steps; i++) {
      let length = (i / steps) * wayLength,
        point = way.getPointAtLength(length);

      wayPoints[i] = [point.x, point.y];
    }

    const wayPointsLen = wayPoints.length;

    frames.forEach(function (frame) {
      let closest = Number.MAX_SAFE_INTEGER,
        pct = 0;

      wayPoints.forEach(function (wayPoint, index) {
        let dist = distance(frame.center, wayPoint);

        if (dist < closest) {
          closest = dist;
          pct = index / wayPointsLen;
        }
      });

      framesPct.push({ pct: pct, width: frame.width, height: frame.height });
    });

    return framesPct.sort((f1, f2) =>
      f1.pct > f2.pct ? 1 : f1.pct < f2.pct ? -1 : 0,
    );
  };

  const checkVisible = (elem) => {
    const rect = elem.getBoundingClientRect(),
      bufferHeight = window.innerHeight / -2,
      bufferWidth = window.innerWidth / -2;

    return (
      rect.top <= window.innerHeight - bufferHeight &&
      rect.left <= window.innerWidth - bufferWidth &&
      rect.bottom >= bufferHeight &&
      rect.right >= bufferWidth
    );
  };
};
