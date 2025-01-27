import { isIos } from "$lib/shared/utils/agent.js";

export default (container, props, ScrollMagic) => {
  const hasValue = (key) => {
    return (
      typeof key !== "undefined" && typeof key !== "undefined" && key !== null
    );
  };

  const isMobile =
    window.matchMedia("(any-hover: none)").matches &&
    window.visualViewport &&
    (window.visualViewport.height > window.visualViewport.width ||
      window.visualViewport.width < 600);

  // https://stackoverflow.com/questions/7944460/detect-safari-browser
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  /**
   * Split a string on commas and/or spaces.
   * From: "josh, natasha, bob jr"
   * To: ["josh", "natasha", "bob", "jr"]
   */
  const strToArray = (str) => {
    return str
      .split(/[\s,]/)
      .filter((s) => s)
      .map((s) => s.trim());
  };

  const isValidUrl = (urlString) => {
    try {
      return Boolean(new URL(urlString));
    } catch (e) {
      return false;
    }
  };

  const isInView = (elem) => {
    let rect = elem.getBoundingClientRect(),
      height = window.innerHeight || document.documentElement.clientHeight;

    return rect.top < height - height * 0.25 && rect.bottom > height * 0.25;
  };

  const windowSize = () => {
    /* prettier-ignore */
    let body    = window.document.body,width  = window.document.documentElement.clientWidth,
          height  = window.document.documentElement.clientHeight,
          returnW = window.document.compatMode === "CSS1Compat" && width || body && body.clientWidth || width,
          returnH = window.document.compatMode === "CSS1Compat" && height || body && body.clientHeight || height;

    return { width: returnW, height: returnH };
  };

  /* prettier-ignore */
  let isInAppAndroid = !!((window.location.search.indexOf('nytapp') > -1 ||
                         window.navigator.userAgent.match(/nyt[-_]?(?:ios|android)/i) ||
                        /* @ts-ignore */
                        (window.navigator.userAgent.match(/android/i) && window.__HYBRID__)) &&
                         window.navigator.userAgent.indexOf('Android') > -1);

  const animatedCaptions = (elem, text, timeLength) => {
    console.log(text);
    let words = text.split(" ");
    let wordCount = words.length;
    elem.innerHTML = "";

    for (let i = 0; i < wordCount; i++) {
      let span = document.createElement("span");
      let eachTime = timeLength / (wordCount + 1);
      span.innerHTML = words[i] + " ";

      span.style.opacity = "0.5";
      elem.appendChild(span);
      span.style.animation =
        "captionAnimation 0.25s forwards " + eachTime * i + "s";
    }
  };

  /* prettier-ignore */
  let winWidth = windowSize().width,
		winHeight = windowSize().height,
		aspect = isMobile ? 'mobile' : 'desktop',
		downgradeDesktopSafari = false, // if desktop safari chokes on a big video, we can force it to choose a smaller rendition
		isDesktopSafari = aspect === 'desktop' && isSafari,
		// eslint-disable-next-line no-unused-vars
		devicePxRatio = window.devicePixelRatio,
		vidsLoaded = 0,
		vidsMuted = true,
		scrollingparties = null,
		forceFallbackMode = false,
		debugMode = false,
		throttled = false,
		offline = false,
		resizeMethods = [],
		vidsWithAudio = [],
		segmentMethods = {},
		// eslint-disable-next-line no-unused-vars
		intersectionObjs = [],
		pxArr = [
			'stroke-width',
			'rx',
			'ry',
			'width',
			'height',
			'line-height',
			'letter-spacing',
			'font-size',
			'margin-top',
			'margin-left'
		],
		pctArr = ['rx', 'ry', 'width', 'height'],
		filterArr = ['blur', 'hue-rotate', 'brightness', 'saturate', 'invert'],
		pxFilterArr = ['blur'],
		pctFilterArr = ['brightness', 'saturate', 'invert'],
		degFilterArr = ['hue-rotate'];

  const create = (obj) => {
    const findFrameRate = () => {
      /* prettier-ignore */
      let hasFrameRate = hasValue (obj["frameRate"]),
						hasTracking  = hasValue (obj.tracking),
						returnVal    = hasFrameRate ? Number.parseInt (obj["frameRate"], 10) :
													hasTracking ? obj.tracking.stage.frameRate : 30;
      return returnVal;
    };

    const findFrameLength = () => {
      /* prettier-ignore */
      let hasFrameLength = hasValue (obj["frameLength"]),
						hasTracking    = hasValue (obj.tracking),
						hasVideo       = obj.videoElem !== null,
						returnVal      = hasFrameLength ? Number.parseInt (obj["frameLength"], 10) :
														hasTracking ? obj.tracking.stage.frameLength :
														hasVideo ? obj.videoElem.duration * frameRate : 900;
      return returnVal;
    };

    /* prettier-ignore */
    const scrollContainer = container.querySelector('.g-asset_inner'), 
						frameRate       = findFrameRate (),
						frameLength     = findFrameLength (),
						keyFrameLength  = hasValue (obj["keyframeLength"]) ? Number.parseInt (obj["keyframeLength"], 10) : 3,
						startScroll     = hasValue (obj["scrollStart"])    ? Number.parseFloat (obj["scrollStart"]) : 0,
						endScroll       = hasValue (obj["scrollEnd"])      ? Number.parseFloat (obj["scrollEnd"]) : 1,
						heightMultDesk  = hasValue (obj["height-desktop"])  ? Number.parseFloat (obj["height-desktop"]) : 1,
						heightMultMob   = hasValue (obj["height-mobile"])   ? Number.parseFloat (obj["height-mobile"]) : 1,
						scrollDisabled  = hasValue (obj["scrollDisabled"]) ? obj["scrollDisabled"] === true : false,
						hasAnimSlides   = hasValue (obj["animatedSlides"]) ? obj["animatedSlides"] === true : false,
						controller      = !scrollDisabled ? new ScrollMagic.Controller ({ container: isMobile ? window : window }) : null,
						scene           = !scrollDisabled ? new ScrollMagic.Scene ({ triggerElement: scrollContainer, triggerHook: "onCenter", offset: -winHeight / 2 }) : null;

    /* prettier-ignore */
    let scrollPct = 0,
					scrollPctAdj = 0,
					videoLastFrame    = 0,
					stepDivisor       = 12,
					videoShouldUpdate = false,
					custTimeout       = null,
					custInterval      = null,
					playThroughTimer  = null,
					segmentInterval   = null,
					finalLayoutTimer  = null,
					// stillImage        = null,
					readyState        = false,
					fallbackImages    = [],
					// nonScrollVideos   = [],
					// slidesHeight      = 0,
					dim               = {},
					firstTimeThrough  = true;

    const checkLayout = () => {
      clearTimeout(finalLayoutTimer);

      let fallbackImg = scrollContainer.querySelector(
          ".g-scrollingparty-fallback img",
        ),
        isNatural = fallbackImages[0].natural;

      if (!scrollDisabled) {
        scene.offset(-windowSize().height / 2);
        scene.duration(scrollContainer.clientHeight + windowSize().height);
      }

      dim.curWidth = fallbackImg.clientWidth;
      dim.curHeight = fallbackImg.clientHeight;
      dim.srcWidth = isNatural
        ? fallbackImg.naturalWidth
        : fallbackImages[0].width;
      dim.srcHeight = isNatural
        ? fallbackImg.naturalHeight
        : fallbackImages[0].height;
      dim.curRatioWH = dim.curWidth / dim.curHeight;
      dim.srcRatioWH = dim.srcWidth / dim.srcHeight;
      dim.curRatioHW = dim.curHeight / dim.curWidth;
      dim.srcRatioHW = dim.srcHeight / dim.srcWidth;
      dim.overflowX =
        dim.srcHeight * (dim.srcWidth / dim.srcHeight) -
        dim.srcHeight * (dim.curWidth / dim.curHeight);
      dim.overflowY =
        (dim.srcWidth * dim.srcHeight) / dim.srcWidth -
        (dim.srcWidth * dim.curHeight) / dim.curWidth;

      if (hasValue(obj.tracking)) {
        Object.keys(obj.tracking.layers).forEach(function (key) {
          let elem = obj.tracking.layers[key];
          if (elem.type === "path") elem.needsUpdate = true;
        });
      }
    };

    const playSegment = (start, end) => {
      clearInterval(segmentInterval);

      let currentFrame = start;

      segmentInterval = setInterval(function () {
        scrollPct = currentFrame / frameLength;

        if (start <= end && currentFrame <= end) {
          if (!videoShouldUpdate) adjustScrollPct(15);
          currentFrame++;
        } else if (start > end && currentFrame >= end) {
          if (!videoShouldUpdate) adjustScrollPct(15);
          currentFrame--;
        } else clearInterval(segmentInterval);
      }, 30);
    };

    const setupPage = () => {
      let multi = aspect === "desktop" ? heightMultDesk : heightMultMob,
        height = frameRate * frameLength * multi,
        slides = scrollContainer.querySelectorAll(
          "div.g-scrollingparty-annotations > div",
        ),
        // eslint-disable-next-line no-unused-vars
        count = 0,
        // eslint-disable-next-line no-unused-vars
        lastVal = 0;

      scrollContainer.style.height = height + "px";

      if (scrollDisabled) {
        scrollContainer.style.height = "100%";
        scrollContainer.querySelector(
          ".g-scrollingparty-fallback",
        ).style.height = "100%";
        scrollContainer.querySelector(
          ".g-scrollingparty-annotations",
        ).style.display = "none";
        container.style.minHeight = height + "px";
        segmentMethods[obj.id] = playSegment;
      }

      if (debugMode || (hasValue(obj.debug) && obj.debug === true))
        addDebugElems();
      obj.addDebugElems = addDebugElems;

      if (hasValue(obj.slides)) {
        obj.slides.forEach(function (slide, index) {
          /* prettier-ignore */
          let parsePct = Number.parseFloat (slide.percent),
								valPct   = isNaN (parsePct) ? 0 : parsePct,
								yPos     = hasValue (slide.percent) ? valPct * height : 0,
								// eslint-disable-next-line no-unused-vars
								videoPct = valPct <= startScroll ? 0 : valPct >= endScroll ? 0.995 : (valPct - startScroll) /  (endScroll - startScroll);

          slides[index].style.height = "1px";
          slides[index].style.position = "absolute";
          slides[index].style.top = yPos + "px";

          slide.domElem = slides[index];
          slide.inView = false;
        });
      }
    };

    // adds the red lines and percentages to the scroll container
    const addDebugElems = () => {
      let multi = aspect === "desktop" ? heightMultDesk : heightMultMob,
        height = frameRate * frameLength * multi;

      for (let i = 0; i < 1; i += 0.01) {
        let slideContainer = scrollContainer.querySelector(
            "div.g-scrollingparty-annotations",
          ),
          debugSlide = document.createElement("div");

        debugSlide.innerHTML = i.toFixed(2);
        debugSlide.className = "g-scrollingparty-debug";
        debugSlide.style.height = "1px";
        debugSlide.style.position = "absolute";
        debugSlide.style.top = height * i + "px";

        slideContainer.appendChild(debugSlide);
      }
    };

    const checkSlidePosition = () => {
      if (hasValue(obj.slides)) {
        obj.slides.forEach(function (slide) {
          const innerDiv = slide.domElem.querySelector("div"),
            rect = innerDiv.getBoundingClientRect(),
            bufferHeight = window.innerHeight * 0.7,
            inView = rect.top >= window.innerHeight - bufferHeight;

          if (inView && !slide.inView) {
            innerDiv.classList.remove("g-scrollingparty-inset-open");
            void innerDiv.offsetWidth;
            innerDiv.classList.add("g-scrollingparty-inset-close");
            slide.inView = true;
          } else if (!inView && slide.inView) {
            innerDiv.classList.remove("g-scrollingparty-inset-close");
            void innerDiv.offsetWidth;
            innerDiv.classList.add("g-scrollingparty-inset-open");
            slide.inView = false;
          }
        });
      }
    };

    const startScrollAnimation = () => {
      scene
        .addTo(controller)
        .duration(scrollContainer.clientHeight + winHeight)
        .on("progress", (e) => {
          if (e.state === "BEFORE" || e.state === "AFTER") {
            videoShouldUpdate = false;
            obj.nonScrollVideos.forEach(function (video, index) {
              setTimeout(function () {
                video.pause();
              }, index * 250);
            });
          } else {
            if (scrollPct !== e.progress) {
              scrollPct = e.progress;

              if (!videoShouldUpdate) adjustScrollPct(15);
              if (isMobile && hasAnimSlides) checkSlidePosition();

              if (hasValue(props.eventListener)) {
                const event = new CustomEvent("scrollingparty", {
                  detail: {
                    id: props.id,
                    element: container,
                    scrollPct,
                    scrollPctAdj,
                  },
                });
                window.dispatchEvent(event);
              }
            }
          }
        });
    };

    const updateStill = (pct) => {
      obj.stillImage.style.transition = "opacity 0s linear";
      obj.stillImage.style.opacity = 0;

      let frameToUse = Math.floor(pct),
        frameStr = "00000" + frameToUse,
        frameCut = frameStr.substring(frameStr.length - 5, frameStr.length),
        frameUrl = obj["singleFrames"] + "-" + aspect + "-" + frameCut + ".jpg"; // -1600-00429.jpg // obj.size

      obj.stillImage.onload = function () {
        obj.stillImage.style.transition = "opacity 0s linear";
        obj.stillImage.style.opacity = 0;

        obj.stillImage.style.transition = "opacity 0.25s ease-in";
        obj.stillImage.style.opacity = hasValue(obj.videoElem.style)
          ? obj.videoElem.style.opacity
          : 1;
      };

      obj.stillImage.src = frameUrl;
    };

    const jumpToTime = (pct) => {
      let videoNextFrame = frameLength * pct,
        videoCurrFrame = scrollDisabled
          ? videoNextFrame
          : videoLastFrame + (videoNextFrame - videoLastFrame) / stepDivisor,
        frameToUse =
          videoCurrFrame < 0
            ? 0
            : videoCurrFrame > frameLength - 1
              ? frameLength - 1
              : videoCurrFrame,
        isBuffered = checkBuffered(frameToUse);

      if (
        hasValue(obj.tracking) &&
        Object.keys(obj.tracking).length > 0 &&
        obj.videoElem === null
      ) {
        if (fallbackImages.length > 0) {
          moveTrackingElements(frameToUse);
        }

        if (Math.abs(videoNextFrame - frameToUse) < keyFrameLength + 1) {
          videoShouldUpdate = false;
          clearTimeout(custTimeout);
        } else {
          if (obj.stillImage !== null) {
            obj.stillImage.style.transition = "opacity 0s linear";
            obj.stillImage.style.opacity = 0;
          }
          if (videoLastFrame !== frameToUse) adjustScrollPct(15);
        }
      }

      if (isBuffered) {
        if (obj.hasVideoBackdrop) hideFallback();

        let frameAdj = obj.hasVideoBackdrop
            ? frameToUse
            : frameToUse - obj.videoStartEnd.start,
          timeFromKeyrame = getTimeFromKeyframe(frameAdj);

        obj.videoElem.currentTime =
          timeFromKeyrame < 0
            ? 0
            : timeFromKeyrame > frameLength
              ? frameLength
              : timeFromKeyrame;

        if (
          hasValue(obj.tracking) &&
          Object.keys(obj.tracking).length > 0 &&
          fallbackImages.length > 0
        ) {
          moveTrackingElements(frameToUse);
        }

        if (Math.abs(videoNextFrame - frameToUse) < keyFrameLength + 1) {
          videoShouldUpdate = false;

          if (obj.videoElem !== null && obj.stillImage !== null) {
            updateStill(frameAdj);
          }
        } else {
          if (obj.videoElem !== null && obj.stillImage !== null) {
            obj.stillImage.style.transition = "opacity 0s linear";
            obj.stillImage.style.opacity = 0;
          }

          videoShouldUpdate = true;
        }

        clearInterval(custInterval);

        let videoBackdrop = document.querySelector(
          ".g-scrollingparty-container > video",
        );
        if (videoBackdrop && +videoBackdrop["style"].opacity === 0) {
          videoBackdrop["style"].opacity = 1;
        }
        firstTimeThrough = false;
      } else {
        if (obj.hasVideoBackdrop) {
          showFallback();
        }
      }

      videoLastFrame = frameToUse;
    };

    const getTimeFromKeyframe = (keyframe) => {
      return keyframe / frameRate;
    };

    const adjustScrollPct = (delay) => {
      clearTimeout(custTimeout);
      clearInterval(custInterval);

      custTimeout = null;
      custInterval = null;

      if (
        (scrollPct > startScroll && scrollPct < endScroll) ||
        firstTimeThrough
      ) {
        scrollPctAdj = (scrollPct - startScroll) / (endScroll - startScroll);
        scrollPctAdj =
          scrollPctAdj > 1 ? 1 : scrollPctAdj < 0 ? 0 : scrollPctAdj;
        custInterval = setInterval(function () {
          jumpToTime(scrollPctAdj);
        }, delay);

        //window.requestAnimationFrame (function () { jumpToTime (adjustedPct); });
      } else if (scrollPct <= startScroll) {
        custTimeout = setTimeout(function () {
          jumpToTime(0);
        }, delay);
      } else if (scrollPct >= endScroll) {
        custTimeout = setTimeout(function () {
          jumpToTime(1);
        }, delay);
      }
    };

    const checkBuffered = (frameToUse) => {
      if (forceFallbackMode) return false;
      if (!readyState || obj.videoElem === null) return false;

      let fallbackLen = hasValue(obj.slides) ? obj.slides.length : 0,
        fallbackRange = { start: 0, end: 0 },
        currPct = frameToUse / frameLength,
        bufferedLen = obj.videoElem.buffered.length,
        isBuffered = false;

      currPct = currPct < 0 ? 0 : currPct > 1 ? 1 : currPct;

      while (fallbackLen--) {
        if (!hasValue(fallbackImages[fallbackLen])) break;
        if (currPct > fallbackImages[fallbackLen].start) {
          let start = fallbackImages[fallbackLen].start,
            end =
              fallbackLen === obj.slides.length - 1
                ? 1
                : parseFloat(fallbackImages[fallbackLen + 1].start);

          fallbackRange.start = start;
          fallbackRange.end = end;
          break;
        }
      }

      while (bufferedLen--) {
        let buffStart = obj.videoElem.buffered.start(bufferedLen),
          buffEnd = obj.videoElem.buffered.end(bufferedLen);
        if (currPct >= buffStart && currPct <= buffEnd) {
          if (
            fallbackRange.start >= buffStart &&
            fallbackRange.end <= buffEnd
          ) {
            isBuffered = true;
            break;
          }
        }
      }

      return isBuffered;
    };

    const moveTrackingElements = (frame) => {
      let closest = Math.floor(frame),
        hasScrollVid = false;

      Object.keys(obj.tracking.layers).forEach(function (key) {
        let elem = obj.tracking.layers[key];

        if (elem.domElem) {
          // let hasScrollVid = false;

          if (closest >= elem.start && closest <= elem.end) {
            let frameOffset = closest - elem.start,
              absAnchor = elem.absolute.includes("anchor"),
              absSize = elem.absolute.includes("size"),
              anchor =
                elem.animatedTransforms.indexOf("anchor") !== -1
                  ? {
                      x: elem.anchor[frameOffset][0],
                      y: elem.anchor[frameOffset][1],
                    }
                  : { x: elem.anchor[0], y: elem.anchor[1] },
              pos =
                elem.animatedTransforms.indexOf("pos") !== -1
                  ? { x: elem.pos[frameOffset][0], y: elem.pos[frameOffset][1] }
                  : { x: elem.pos[0], y: elem.pos[1] },
              scale =
                elem.animatedTransforms.indexOf("scale") !== -1
                  ? {
                      x: elem.scale[frameOffset][0],
                      y: elem.scale[frameOffset][1],
                    }
                  : { x: elem.scale[0], y: elem.scale[1] },
              opacity =
                elem.animatedTransforms.indexOf("opacity") !== -1
                  ? elem.opacity[frameOffset]
                  : elem.opacity,
              rot =
                elem.animatedTransforms.indexOf("rot") !== -1
                  ? elem.rot[frameOffset] * 100
                  : elem.rot * 100,
              sizePixPct = findSize(
                elem.attributes.width,
                elem.attributes.height,
                1,
                1,
                false,
              ),
              anchorMultY = elem.type === "text" ? -1 : 1;

            if (
              elem.type === "image" ||
              elem.type === "video" ||
              elem.type === "scrollingvideo"
            ) {
              pos.x -= elem.attributes.width * (anchor.x / 100);
              pos.y -= elem.attributes.height * (anchor.y / 100);

              if (elem.type === "text") {
                // TODO fix for relative vs. abs
                // if (elem.attributes["text-align"] === "right") pos.x -= sizePixPct.pctWidth;
                // else if (elem.attributes["text-align"] === "center") pos.x -= sizePixPct.pctWidth / 2;
                // pos.y -= (elem.attributes["font-size"] / dim.srcHeight);
              }
            } else if (elem.type === "text") {
              // test to ignore anchor point
            } else {
              pos.x -= anchor.x;
              pos.y -= anchor.y;
            }

            // TODO: next scale from point, scale anchor and add to pos
            let posPixPct = findXY(pos.x, pos.y);
            // constW = elem.attributes.width * dim.srcWidth,
            // constH = elem.attributes.height * dim.srcHeight;

            if (elem.type === "video")
              elem.domElem.parentNode.style.opacity = opacity;
            else elem.domElem.style.opacity = opacity;

            if (elem.type === "path") {
              elem.domElem.setAttribute("class", "g-scrollingparty-shape");

              /* prettier-ignore */
              let frameOffset  = closest - elem.start,
										coords       = elem.animatedPath ? elem.path[frameOffset] : elem.path,
										coordsLen    = coords.length,
										pathStr      = "",
										addClosed    = elem.closed ? 1 : 0,
										anchorPixPct = findSize (anchor.x, anchor.y, 1, 1, absAnchor)

              if (elem.animatedPath || elem.needsUpdate) {
                let lastVertex;

                for (let i = 0; i < coordsLen + addClosed; i++) {
                  /* prettier-ignore */
                  let index     = i === coordsLen ? 0 : i,
												inTan     = i && coords[index][0].length ? { x: coords[index][0][0], y: coords[index][0][1] } : { x: null, y: null },
												inAdj     = inTan.x !== null ? findSize (inTan.x, inTan.y, 1, 1, absSize) : null,
												inStr     = inAdj !== null ? inAdj.width + " " + inAdj.height : "",
												outTan    = i && coords[i - 1][1].length ? { x: coords[i - 1][1][0], y: coords[i - 1][1][1] } : { x: null, y: null },
												outAdj    = outTan.x !== null ? findSize (outTan.x, outTan.y, 1, 1, absSize) : null,
												outStr    = outAdj !== null ? outAdj.width + " " + outAdj.height : "",
												vertex    = { x: coords[index][2][0], y: coords[index][2][1] },
												vertexAdj = findSize (vertex.x, vertex.y, 1, 1, absSize),
												vertexStr = vertexAdj.width + " " + vertexAdj.height + " ";

                  if (i) {
                    if (outAdj !== null || inAdj !== null) {
                      // @ts-ignore
                      if (outAdj === null)
                        outStr = lastVertex.x + " " + lastVertex.y;
                      if (inAdj === null)
                        inStr = vertexAdj.width + " " + vertexAdj.height;

                      pathStr +=
                        "C " + outStr + ", " + inStr + ", " + vertexStr + " ";
                    } else pathStr += "L " + vertexStr + " ";
                  } else pathStr += "M " + vertexStr + " ";

                  lastVertex = { x: vertexAdj.width, y: vertexAdj.height };
                }

                if (elem.closed) pathStr += "Z";

                elem.domElem.setAttribute("d", pathStr);
                elem.needsUpdate = false;
              }
              if (elem.animatedAttributes.length > 0)
                updateAttrs(elem, frameOffset, false);
              /* prettier-ignore */
              elem.domElem.style.transformOrigin = anchorPixPct.width + 'px ' + anchorPixPct.height + 'px';
              elem.domElem.style.transform = `translate(${posPixPct.x}px, ${posPixPct.y}px) scale(${scale.x}, ${scale.y}) rotate(${rot}deg) translateZ(0)`;
            } else if (elem.type === "ellipse") {
              elem.domElem.setAttribute("class", "g-scrollingparty-shape");

              let radiusPixPct = findSize(
                  elem.attributes.rx,
                  elem.attributes.ry,
                  1,
                  1,
                  absSize,
                ),
                anchorPixPct = findSize(anchor.x, anchor.y, 1, 1, absAnchor);
              // scalePixPct  = findSize (scale.x, scale.y, 1, 1, false);

              elem.domElem.setAttribute("rx", radiusPixPct.width + "px");
              elem.domElem.setAttribute("ry", radiusPixPct.height + "px");

              elem.domElem.setAttribute("cx", "0%");
              elem.domElem.setAttribute("cy", "0%");

              if (elem.animatedAttributes.length > 0)
                updateAttrs(elem, frameOffset, false);
              /* prettier-ignore */
              elem.domElem.style.transformOrigin = anchorPixPct.width + 'px ' + anchorPixPct.height + 'px';
              elem.domElem.style.transform = `translate(${posPixPct.x}px, ${posPixPct.y}px) scale(${scale.x},${scale.y}) rotate(${rot}deg) translateZ(0)`;
            } else if (elem.type === "text") {
              if (elem.animatedAttributes.length > 0)
                updateAttrs(elem, frameOffset, true);
              elem.domElem.style.transform = `translate(${posPixPct.x}px, ${posPixPct.y}px) scale(${scale.x},${scale.y}) rotate(${rot}deg) translateZ(0)`;
            } else if (elem.type === "image") {
              if (elem.animatedAttributes.length > 0)
                updateFilterAttrs(elem, frameOffset);

              elem.domElem.style.width = sizePixPct.pctWidth * 100 + "%";
              elem.domElem.style.height = sizePixPct.pctHeight * 100 + "%";
              elem.domElem.style.transformOrigin =
                anchor.x + "% " + anchor.y * anchorMultY + "%";
              elem.domElem.style.transform = `translate(${posPixPct.x}px, ${posPixPct.y}px) scale(${scale.x},${scale.y}) rotate(${rot}deg) translateZ(0)`;
              elem.domElem.classList.remove("g-scrollingparty-layer-hide");

              if (hasValue(elem.mask)) {
                let coords = elem.animatedMask
                    ? elem.mask[frameOffset]
                    : elem.mask,
                  coordsLen = coords.length,
                  pathStr = "";
                // anchorPixPct = findSize(anchor.x, anchor.y, 1, 1, absAnchor);

                if (elem.animatedMask || elem.needsUpdate) {
                  let lastVertex;

                  for (let i = 0; i < coordsLen; i++) {
                    /* prettier-ignore */
                    let index     = i === coordsLen ? 0 : i,
													inTan     = i && coords[index][0].length ? { x: coords[index][0][0], y: coords[index][0][1] } : { x: null, y: null },
													inAdj     = inTan.x !== null ? findSize (inTan.x, inTan.y, 1, 1, absSize) : null,
													inStr     = inAdj !== null ? inAdj.width + " " + inAdj.height : "",
													outTan    = i && coords[i - 1][1].length ? { x: coords[i - 1][1][0], y: coords[i - 1][1][1] } : { x: null, y: null },
													outAdj    = outTan.x !== null ? findSize (outTan.x, outTan.y, 1, 1, absSize) : null,
													outStr    = outAdj !== null ? outAdj.width + " " + outAdj.height : "",
													vertex    = { x: coords[index][2][0], y: coords[index][2][1] },
													vertexAdj = findSize (vertex.x, vertex.y, 1, 1, absSize),
													vertexStr = vertexAdj.width + " " + vertexAdj.height + " ";

                    if (i) {
                      if (outAdj !== null || inAdj !== null) {
                        // @ts-ignore
                        if (outAdj === null)
                          outStr = lastVertex.x + " " + lastVertex.y;
                        if (inAdj === null)
                          inStr = vertexAdj.width + " " + vertexAdj.height;
                        pathStr +=
                          "C " + outStr + ", " + inStr + ", " + vertexStr + " ";
                      } else pathStr += "L " + vertexStr + " ";
                    } else pathStr += "M " + vertexStr + " ";

                    lastVertex = { x: vertexAdj.width, y: vertexAdj.height };
                  }

                  pathStr += "Z";

                  elem.domElem.style.clipPath = 'path("' + pathStr + '")';
                  elem.needsUpdate = false;
                }
              }
            } else if (
              elem.type === "video" ||
              elem.type === "scrollingvideo"
            ) {
              if (elem.animatedAttributes.length > 0)
                updateFilterAttrs(elem, frameOffset);

              elem.domElem.parentNode.style.width =
                sizePixPct.pctWidth * 100 + "%";
              elem.domElem.parentNode.style.height =
                sizePixPct.pctHeight * 100 + "%";
              elem.domElem.parentNode.style.transformOrigin =
                anchor.x + "% " + anchor.y * anchorMultY + "%";

              elem.domElem.parentNode.style.transform = `translate(${posPixPct.x}px, ${posPixPct.y}px) scale(${scale.x},${scale.y}) rotate(${rot}deg) translateZ(0)`;

              elem.mute.style.transform =
                "scale(" + 1 / scale.x + "," + 1 / scale.y + ")";
              elem.mute.style.marginBottom =
                elem.muteMargin * (1 / scale.y) + "px";
              elem.mute.style.marginRight =
                elem.muteMargin * (1 / scale.x) + "px";
              elem.domElem.parentNode.classList.remove(
                "g-scrollingparty-layer-hide",
              );

              if (elem.type === "video") {
                if (elem.domElem.muted !== vidsMuted)
                  elem.domElem.muted = vidsMuted;

                let isVideoPlaying = !!(
                    elem.domElem.currentTime > 0 &&
                    !elem.domElem.paused &&
                    !elem.domElem.ended &&
                    elem.domElem.readyState > 2
                  ),
                  isVideoInView = isInView(elem.domElem);

                if (isVideoPlaying && !isVideoInView && !elem.domElem.paused)
                  elem.domElem.pause();
                else if (
                  !isVideoPlaying &&
                  isVideoInView &&
                  elem.domElem.paused
                )
                  elem.domElem.play();
              } else {
                if (obj.videoElem !== elem.domElem) {
                  obj.videoElem = elem.domElem;
                  addTimeUpdate();
                  checkPlayThrough();
                }

                obj.videoStartEnd = { start: elem.start, end: elem.end };

                hasScrollVid = true;
              }

              if (hasValue(elem.mask)) {
                let coords = elem.animatedMask
                    ? elem.mask[frameOffset]
                    : elem.mask,
                  coordsLen = coords.length,
                  pathStr = "";
                // anchorPixPct = findSize(anchor.x, anchor.y, 1, 1, absAnchor);

                if (elem.animatedMask || elem.needsUpdate) {
                  let lastVertex;

                  for (let i = 0; i < coordsLen; i++) {
                    /* prettier-ignore */
                    let index     = i === coordsLen ? 0 : i,
													inTan     = i && coords[index][0].length ? { x: coords[index][0][0], y: coords[index][0][1] } : { x: null, y: null },
													inAdj     = inTan.x !== null ? findSize (inTan.x, inTan.y, 1, 1, absSize) : null,
													inStr     = inAdj !== null ? inAdj.width + " " + inAdj.height : "",
													outTan    = i && coords[i - 1][1].length ? { x: coords[i - 1][1][0], y: coords[i - 1][1][1] } : { x: null, y: null },
													outAdj    = outTan.x !== null ? findSize (outTan.x, outTan.y, 1, 1, absSize) : null,
													outStr    = outAdj !== null ? outAdj.width + " " + outAdj.height : "",
													vertex    = { x: coords[index][2][0], y: coords[index][2][1] },
													vertexAdj = findSize (vertex.x, vertex.y, 1, 1, absSize),
													vertexStr = vertexAdj.width + " " + vertexAdj.height + " ";

                    if (i) {
                      if (outAdj !== null || inAdj !== null) {
                        // @ts-ignore
                        if (outAdj === null)
                          outStr = lastVertex.x + " " + lastVertex.y;
                        if (inAdj === null)
                          inStr = vertexAdj.width + " " + vertexAdj.height;
                        pathStr +=
                          "C " + outStr + ", " + inStr + ", " + vertexStr + " ";
                      } else pathStr += "L " + vertexStr + " ";
                    } else pathStr += "M " + vertexStr + " ";

                    lastVertex = { x: vertexAdj.width, y: vertexAdj.height };
                  }

                  pathStr += "Z";

                  elem.domElem.style.clipPath = 'path("' + pathStr + '")';
                  elem.needsUpdate = false;
                }
              }
            } else if (elem.type === "null") {
              elem.domElem.style.transformOrigin =
                anchor.x + "% " + anchor.y * anchorMultY + "%";
              elem.domElem.style.transform = `translate(${posPixPct.x}px, ${posPixPct.y}px) scale(${scale.x},${scale.y}) rotate(${rot}deg) translateZ(0)`;
              elem.domElem.classList.remove("g-scrollingparty-layer-hide");
            }
          } else {
            if (elem.type === "text") elem.domElem.style.opacity = 0;
            else {
              if (elem.type === "video" || elem.type === "scrollingvideo") {
                if (
                  elem.domElem.currentTime > 0 &&
                  !elem.domElem.paused &&
                  !elem.domElem.ended &&
                  elem.domElem.readyState > 2
                )
                  elem.domElem.pause();
                // TODO make a new class that uses display: none;
                elem.domElem.parentNode.classList.add(
                  "g-scrollingparty-layer-hide",
                );
              } else if (
                obj.tracking.layers[key].type === "rect" ||
                obj.tracking.layers[key].type === "ellipse" ||
                obj.tracking.layers[key].type === "path"
              ) {
                elem.domElem.classList.add("g-scrollingparty-shape-hide");
              } else elem.domElem.classList.add("g-scrollingparty-layer-hide"); //g-scrollingparty-shape-hide
            }
          }
        }
      });

      if (!hasScrollVid && !obj.hasVideoBackdrop) {
        clearInterval(playThroughTimer);
        obj.videoElem = null;
      }
    };

    const updateAttrs = (elem, frameOffset, style) => {
      elem.animatedAttributes.forEach((attr) => {
        if (attr === "text") {
          elem.domElem.firstChild.innerHTML = elem[attr][frameOffset];
        } else {
          let unit = pxArr.includes(attr) ? "px" : "";
          unit = pctArr.includes(attr) && !obj.absolute ? "%" : unit;

          if (style) {
            elem.domElem.style[attr] =
              elem.attributes[attr][frameOffset] + unit;
          } else {
            elem.domElem.setAttribute(
              attr,
              elem.attributes[attr][frameOffset] + unit,
            );
          }
        }
      });
    };

    const updateFilterAttrs = (elem, frameOffset) => {
      let allFilters = "";

      for (const [key] of Object.entries(elem.attributes)) {
        if (!elem.animatedAttributes.includes(key) && filterArr.includes(key))
          allFilters += buildFilters(elem, key, null);
      }

      elem.animatedAttributes.forEach((attr) => {
        allFilters += buildFilters(elem, attr, frameOffset);
      });

      elem.domElem.style.filter = allFilters;
    };

    const buildFilters = (elem, attr, frameOffset) => {
      let unit = pxFilterArr.includes(attr) ? "px" : "";
      unit = pctFilterArr.includes(attr)
        ? "%"
        : degFilterArr.includes(attr)
          ? "deg"
          : unit;

      /* prettier-ignore */
      return frameOffset !== null ? attr + "(" + elem.attributes[attr][frameOffset] + unit + ") " : attr + "(" + elem.attributes[attr] + unit + ") ";
    };

    const findXY = (x, y) => {
      /* prettier-ignore */
      let origX   = dim.srcWidth * x,
						adjPctX = (origX - dim.overflowX / 2) / (dim.srcWidth - dim.overflowX),
						origY   = dim.srcHeight * y,
						adjPctY = (origY - dim.overflowY / 2) / (dim.srcHeight - dim.overflowY),
						pctX    = dim.curRatioWH < dim.srcRatioWH ? adjPctX : x,
						pctY    = dim.curRatioWH > dim.srcRatioWH ? adjPctY : y;

      return {
        x: pctX * dim.curWidth,
        y: pctY * dim.curHeight,
        pctX: pctX,
        pctY: pctY,
      };
    };

    const findSize = (w, h, scaleX, scaleY, absolute) => {
      /* prettier-ignore */
      let widthScaledX  = w * scaleX,
						fullWidthAbs  = widthScaledX * (dim.srcWidth / dim.curWidth),
						widthMultRel  = dim.curRatioWH < dim.srcRatioWH ? dim.srcWidth / (dim.srcWidth - dim.overflowX ) : 1,
						fullWidthRel  = widthScaledX * widthMultRel,
						heightScaledY = h * scaleY,
						fullHeightAbs = heightScaledY * (dim.srcHeight / dim.curHeight),
						heightMultRel = dim.curRatioWH > dim.srcRatioWH ? dim.srcHeight / (dim.srcHeight - dim.overflowY) : 1,
						fullHeightRel = heightScaledY * heightMultRel,
						width         = absolute ? fullWidthAbs : fullWidthRel,
						height        = absolute ? fullHeightAbs : fullHeightRel;

      return {
        width: width * dim.curWidth,
        height: height * dim.curHeight,
        pctWidth: width,
        pctHeight: height,
      };
    };

    const loadFallbackImages = (index) => {
      if (obj.slides && index > obj.slides.length - 1) {
        if (debugMode || (hasValue(obj.debug) && obj.debug === true)) {
          console.log(
            "scrollingparty",
            obj.id,
            "fallbackImages",
            fallbackImages,
          );
        }
        return;
      }

      /* prettier-ignore */
      let container    = scrollContainer.querySelector("div.g-scrollingparty-fallback"),
						img          = document.createElement ("img"),
						hasVideo     = obj.videoElem !== null,
						hasTracking  = hasValue(obj.tracking),
						hasSlides    = hasValue(obj.slides),
						hasCurrSlide = hasSlides && hasValue(obj.slides[index]),
						hasFallback  = hasSlides && hasCurrSlide && hasValue(obj.slides[index]["fallback-" + aspect]),
						start        = hasCurrSlide ? Number.parseFloat(obj.slides[index].percent) : 0;

      if (hasTracking) {
        if (hasVideo && hasFallback) {
          img.onload = function () {
            fallbackImages[index] = {
              width: -1,
              height: -1,
              start: start,
              image: img,
              natural: true,
            };
            container.append(img);
            if (!index) img.classList.add("g-show");
            setTimeout(function () {
              loadFallbackImages(++index);
            }, 100);
            checkLayout();
            finalLayoutTimer = setTimeout(checkLayout, 300);
          };

          // TODO: do we need this anymore?
          /* prettier-ignore */
          // @ts-ignore
          img.src == isInAppAndroid ? ("_assets/" + obj.slides[index]["fallback-" + aspect]).replace("static01.nyt.com", "www.nytimes.com") : "_assets/" + obj.slides[index]["fallback-" + aspect];
        } else {
          let width = obj.tracking.stage.width,
            height = obj.tracking.stage.height;

          fallbackImages[index] = {
            width: width,
            height: height,
            start: start,
            image: img,
            natural: false,
          };
          container.append(img);
          img.width = width;
          img.height = height;
          let imgData = createFallback(width, height);
          img.setAttribute("src", imgData);
          checkLayout();
          finalLayoutTimer = setTimeout(checkLayout, 300);
        }
      }

      if (hasVideo && !hasTracking) {
        if (hasFallback) {
          img.onload = function () {
            fallbackImages[index] = {
              width: -1,
              height: -1,
              start: start,
              image: img,
              natural: true,
            };
            container.append(img);
            if (!index) img.classList.add("g-show");
            setTimeout(function () {
              loadFallbackImages(++index);
            }, 100);
            checkLayout();
            finalLayoutTimer = setTimeout(checkLayout, 300);
          };

          /* prettier-ignore */
          img.src = isInAppAndroid ? ("_assets/" + obj.slides[index]["fallback-" + aspect]).replace ("static01.nyt.com", "www.nytimes.com") : "_assets/" + obj.slides[index]["fallback-" + aspect];
        } else {
          let width = obj.videoElem.videoWidth,
            height = obj.videoElem.videoHeight;

          fallbackImages[index] = {
            width: width,
            height: height,
            start: start,
            image: img,
            natural: false,
          };
          container.append(img);
          img.width = width;
          img.height = height;
          let imgData = createFallback(width, height);
          img.setAttribute("src", imgData);
          checkLayout();
          finalLayoutTimer = setTimeout(checkLayout, 300);
        }
      }
    };

    const createFallback = (width, height) => {
      const fallback = document.createElement("canvas");

      fallback.width = width;
      fallback.height = height;

      return fallback.toDataURL();
    };

    const showFallback = () => {
      fallbackImages.forEach(function (img, index) {
        if (
          (scrollPct >= img.start && scrollPct > 0) ||
          (scrollPct < img.start && !index)
        ) {
          if (debugMode || (hasValue(obj.debug) && obj.debug === "true"))
            console.log("scrollingparty", container, "fallback", img);
          if (obj.videoElem !== null) img.image.classList.add("g-show");
        } else img.image.classList.remove("g-show");
      });

      if (obj.videoElem !== null) {
        obj.videoElem.style.opacity = 0;
        obj.videoElem.style.visibility = "hidden";
      }
    };

    const hideFallback = () => {
      fallbackImages.forEach(function (img) {
        img.image.classList.remove("g-show");
      });

      obj.videoElem.style.opacity = 1;
      obj.videoElem.style.visibility = "visible";
    };

    const checkPlayThrough = () => {
      if (obj.videoElem !== null) {
        playThroughTimer = setInterval(function () {
          if (obj.videoElem.readyState > 3) {
            obj.videoElem.pause();
            clearInterval(playThroughTimer);
            obj.videoElem.currentTime = 0;
            readyState = true;
          }
        }, 15);
      }
    };

    const addTimeUpdate = () => {
      if (obj.videoElem !== null) {
        obj.videoElem.addEventListener("timeupdate", function () {
          if (videoShouldUpdate) adjustScrollPct(15);
          else clearTimeout(custTimeout);
        });
      }
    };

    setupPage();
    loadFallbackImages(0);
    addTimeUpdate();
    checkPlayThrough();

    resizeMethods.push(checkLayout);
    if (!scrollDisabled) startScrollAnimation();
    else
      setTimeout(function () {
        playSegment(0, 0);
      }, 2000);
  };

  const preventEvent = (element, eventName, test) => {
    const handler = (e) => {
      if (!test || test(element, eventName)) {
        e.stopImmediatePropagation();
      }
    };

    element.addEventListener(eventName, handler);
    return handler;
  };

  const extend = (target, ...sources) => {
    let source = [];
    sources.forEach((src) => {
      source = source.concat([src, Object.getPrototypeOf(src)]);
    });
    return Object.assign(target, ...source);
  };

  // TODO: do we want to run this for each component?
  const init = () => {
    scrollingparties = [props].map(function (scrollingparty) {
      scrollingparty.hasVideoBackdrop =
        hasValue(scrollingparty["videoRenditions"]) ||
        hasValue(scrollingparty["videoAsset"]);

      let stillImage =
          scrollingparty.hasVideoBackdrop &&
          hasValue(scrollingparty["singleFrames"])
            ? new Image()
            : null,
        video = null;

      if (scrollingparty.hasVideoBackdrop) {
        video = document.createElement("video");
        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;
        video.disableRemotePlayback = true;
        video.setAttribute("playsinline", "true");
        // video.setAttribute ("autoplay", true);
        video.setAttribute("disableRemotePlayback", "true"); // chromecast control

        preventEvent(video, "seeking", function () {
          return;
        });
        preventEvent(video, "seeked", function () {
          return;
        });
      }

      const getBaseUrl = (file) => {
        const isUrl = isValidUrl(file);
        const isSlash = file.split("/")[0] === "/";

        if (isInAppAndroid) {
          return file.replace("static01.nyt.com", "www.nytimes.com");
        }
        if (isUrl) {
          return file;
        }
        return `${isSlash ? "" : "/"}${file}`;
      };

      return extend(scrollingparty, {
        videoElem: video,
        stillImage: stillImage,
        intersectObj: { root: null, entries: [] },
        nonScrollVideos: [],
        setSrc: function (loadCallback) {
          let self = this;
          let scrollyContainer = container.querySelector(
            ".g-scrollingparty-container",
          );
          self.intersectObj.root = scrollyContainer;

          if (self.hasVideoBackdrop) {
            if (scrollyContainer) {
              scrollyContainer.appendChild(self.videoElem);
            }

            if (isIos()) {
              let playOnce = () => {
                if (self.videoElem && self.videoElem.src) {
                  self.videoElem.play();
                  self.videoElem.pause();
                  self.videoElem.parentNode.removeEventListener(
                    "touchstart",
                    playOnce,
                  );
                }
              };

              if (scrollyContainer) {
                scrollyContainer.addEventListener("touchstart", playOnce);
              }
            }

            if (stillImage !== null && scrollyContainer) {
              scrollyContainer.appendChild(self.stillImage);
            }

            self.videoElem.addEventListener(
              "loadedmetadata",
              function () {
                if (
                  !hasValue(self["tracking-desktop"]) ||
                  !hasValue(self["tracking-mobile"])
                )
                  create(self);
                // @ts-ignore
                self.videoElem.removeEventListener("loadedmetadata", this);
              },
              false,
            );

            self.videoElem.addEventListener(
              "canplaythrough",
              function () {
                self.videoElem.pause();
              },
              false,
            );

            self.videoElem["data-src"] = parseVideoURL(self);
            self.videoElem["data-scrolling-video"] = true;
            self.intersectObj.entries.push({ target: self.videoElem });
          }

          if (
            hasValue(self["tracking-desktop"]) ||
            hasValue(self["tracking-mobile"])
          ) {
            let trackingTimer = null,
              trackingFile = self["tracking-" + aspect];

            let baseURL = getBaseUrl(trackingFile);

            fetch(baseURL)
              .then((json) => json.json())
              .then((text) => {
                self.tracking = text;

                if (scrollyContainer) {
                  trackingTimer = setInterval(function () {
                    if (scrollyContainer) {
                      create(self);
                      addTrackingElements(self);
                      intersectionSetup(self.intersectObj);
                      clearInterval(trackingTimer);
                      // loadCallback ();
                      setTimeout(loadCallback, 100);
                      if (hasValue(self.layers))
                        updateLayers(self.id, self.layers);
                    }
                  }, 1000);

                  setTimeout(function () {
                    clearInterval(trackingTimer);
                  }, 10000); // give up after 10 seconds
                } else {
                  create(self);
                  addTrackingElements(self);
                  intersectionSetup(self.intersectObj);
                  setTimeout(loadCallback, 100);
                }
              });
          } else {
            intersectionSetup(self.intersectObj);
            setTimeout(loadCallback, 100);
          }
        },
      });
    });

    const loadVideosAsync = () => {
      if (vidsLoaded < scrollingparties.length) {
        scrollingparties[vidsLoaded].setSrc(loadVideosAsync);
      }
      vidsLoaded++;
    };

    loadVideosAsync();
  };

  const parseVideoURL = (self, layerStr) => {
    let size = null,
      url = null,
      desktopSizes = [],
      mobileSizes = [],
      videoSizes = {};

    // if it's an ae layer
    if (hasValue(layerStr)) {
      let matches = layerStr.match(/\[(.*?)\]/);

      if (matches !== null && matches.length) {
        desktopSizes = mobileSizes = matches[1].split(",");
      } else {
        url = layerStr;
      }
    } else {
      desktopSizes = self["sizes-desktop"].split(",");
      mobileSizes = self["sizes-mobile"].split(",");
    }

    videoSizes = { desktop: desktopSizes, mobile: mobileSizes };

    for (let i = desktopSizes.length; i--; )
      desktopSizes[i] = desktopSizes[i] | 0;
    for (let i = mobileSizes.length; i--; ) mobileSizes[i] = mobileSizes[i] | 0;

    // choose video slightly bigger than viewport
    size = videoSizes[aspect].find(function (s) {
      return s * 1.1 > winWidth;
    });

    // if desktop safari, override with smaller video if needed
    if (
      downgradeDesktopSafari &&
      isDesktopSafari &&
      videoSizes["desktop"].length >= 2
    ) {
      const secondFromLargest =
        videoSizes["desktop"][videoSizes["desktop"].length - 2];
      // use smaller of existing pick or second from largest.
      // existing size may be null, so need to check it has a value before Math.min()
      size = size ? Math.min(size, secondFromLargest) : secondFromLargest;
    }

    if (!size) size = videoSizes[aspect][videoSizes[aspect].length - 1];

    self.size = size;

    if (url === null) {
      // layer name has brackets
      if (hasValue(layerStr)) {
        let prefix = layerStr.split("[")[0];
        url = prefix + size + ".mp4";
      } else {
        if (self["videoRenditions"])
          url = self["videoRenditions"] + "-" + size + ".mp4";
        else url = self["videoAsset"];
      }
    }

    if (offline) {
      let urlSplit = url.split("/");
      url = "_assets/offline/" + urlSplit[urlSplit.length - 1];
    }

    return url;
  };

  const addTrackingElements = (obj) => {
    // let assetIndex = 0;
    const scrollContainer = container.querySelector(
      ".g-scrollingparty-container",
    );

    Object.keys(obj.tracking.layers).forEach(function (key) {
      if (
        obj.tracking.layers[key].type === "rect" ||
        obj.tracking.layers[key].type === "ellipse" ||
        obj.tracking.layers[key].type === "path"
      ) {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        /* prettier-ignore */
        // @ts-ignore
        svg.style = `position: absolute; top: 0; left: 0; width: ${obj.tracking.stage.width * 3}px; height: ${obj.tracking.stage.height * 3}px`;

        //svg.setAttribute ("viewBox", "0 0 " + obj.tracking.layers[key].stage.width + " " + obj.tracking.layers[key].stage.height);
        svg.setAttribute("preserveAspectRatio", "none");

        let shape = document.createElementNS(
          svg.namespaceURI,
          obj.tracking.layers[key].type,
        );
        shape.id = obj.id + "_tracking_" + key;
        shape.setAttribute("class", "g-scrollingparty-shape-hide");

        addTrackingAttrs(obj.tracking.layers[key], shape, false);

        let update = hasValue(obj.layers)
          ? updateLayerAttrs(obj.layers, key.split("|")[0])
          : { text: null, style: null };

        if (update.style !== null) {
          strToArray(update.style).forEach((className) => {
            shape.classList.add(className);
          });
        }

        svg.appendChild(shape);
        obj.tracking.layers[key].domElem = shape;
        obj.tracking.layers[key].needsUpdate = true;
        scrollContainer.appendChild(svg);
      } else if (obj.tracking.layers[key].type === "text") {
        let layer = obj.tracking.layers[key];

        const div = document.createElement("div"),
          update = hasValue(obj.layers)
            ? updateLayerAttrs(obj.layers, key.split("|")[0])
            : { text: null, style: null };

        div.className = "g-scrollingparty-text";
        div.id = obj.id + "_tracking_" + key;

        for (const [key, value] of Object.entries(layer.text.globals)) {
          div.style[key] = value;
        }

        const spanContainer = document.createElement("div");

        for (const [key, value] of Object.entries(layer.text.attrs)) {
          spanContainer.style[key] = value;
        }

        layer.text.blocks.forEach(function (block) {
          let span = document.createElement("span");

          for (const [key, value] of Object.entries(block.diffs)) {
            span.style[key] = value;
          }

          span.innerText = block.text;

          spanContainer.append(span);
        });

        addTrackingAttrs(obj.tracking.layers[key], spanContainer, true);

        if (update.style !== null) {
          strToArray(update.style).forEach((className) => {
            spanContainer.classList.add(className);
          });
        }

        div["style"].top = "0";
        div["style"].left = "0";

        div.append(spanContainer);

        obj.tracking.layers[key].domElem = div;
        scrollContainer.appendChild(div);
      } else if (obj.tracking.layers[key].type === "image") {
        let image = document.createElement("img");
        // svg = null,
        // clipID = null;

        image.id = obj.id + "_tracking_" + key;
        image.className = "g-scrollingparty-image";
        image["data-src"] = isInAppAndroid
          ? ("_assets/" + obj.tracking.layers[key].file).replace(
              "static01.nyt.com",
              "www.nytimes.com",
            )
          : "_assets/" + obj.tracking.layers[key].file;

        addTrackingAttrs(obj.tracking.layers[key], image, true);

        obj.tracking.layers[key].domElem = image;
        obj.intersectObj.entries.push({ target: image });

        if (hasValue(obj.tracking.layers[key].mask)) {
          obj.tracking.layers[key].needsUpdate = true;
        }

        scrollContainer.appendChild(image);
      } else if (
        obj.tracking.layers[key].type === "video" ||
        obj.tracking.layers[key].type === "scrollingvideo"
      ) {
        let update = hasValue(obj.layers)
          ? updateLayerAttrs(obj.layers, key.split("|")[0])
          : { captions: null, style: null };

        let videoContainer = document.createElement("div");
        videoContainer.id = obj.id + "_tracking_container_" + key;
        videoContainer.className =
          obj.tracking.layers[key].type === "video"
            ? "g-scrollingparty-video-container-with-button"
            : "g-scrollingparty-video-container";

        let mute = document.createElement("div"),
          speaker = document.createElement("div");
        mute.id = obj.id + "_tracking_mute_" + key;
        mute.className = "g-scrollingparty-mute-small-container";
        speaker.className = "g-scrollingparty-mute-small-speaker";

        let video = document.createElement("video");
        video.id = obj.id + "_tracking_" + key;
        video.className = "g-scrollingparty-video";

        addTrackingAttrs(obj.tracking.layers[key], videoContainer, true);

        obj.tracking.layers[key].domElem = video;
        obj.tracking.layers[key].mute = mute;

        mute.addEventListener("mousedown", function () {
          vidsMuted = !vidsMuted;
          video.muted = vidsMuted;
          mute.style.backgroundPosition = vidsMuted ? "0% 0%" : "0% 100%";
        });

        video.preload = "auto";
        video.playsInline = true;
        video.muted = true;
        video.loop = true;
        video.crossOrigin = "anonymous";
        video["data-src"] = parseVideoURL(obj, obj.tracking.layers[key].url);
        video.setAttribute("playsinline", "true");
        video.setAttribute("loop", "true");
        video.setAttribute("crossorigin", "anonymous");
        // video.setAttribute ("autoplay", true);  // commenting out autoplay to prevent playhead from appearing in low power mode ios.

        videoContainer.appendChild(video);

        if (isIos()) {
          let playOnce = () => {
            if (video && video.src) {
              video.play();
              video.pause();
              document.body.removeEventListener("touchstart", playOnce);
            }
          };
          document.body.addEventListener("touchstart", playOnce);
        }

        if (update.captions !== null) {
          let captionsContainer = document.createElement("div"),
            captionsSpan = document.createElement("span");

          captionsContainer.className = "g-video-captions-container";
          captionsSpan.className = "g-scrollingparty-video-captions";

          if (update.style !== null) {
            strToArray(update.style).forEach((className) => {
              captionsSpan.classList.add(className);
            });
          }

          captionsContainer.appendChild(captionsSpan);
          videoContainer.appendChild(captionsContainer);

          video.addEventListener("loadedmetadata", function () {
            let track = document.createElement("track");
            // @ts-ignore
            track.crossorigin = "anonymous";
            track.kind = "captions";
            track.label = "English";
            track.srclang = "en";
            // @ts-ignore
            track.mode = "hidden";
            track.default = true;

            track.addEventListener("cuechange", function () {
              video.textTracks[0].mode = "hidden";

              if (
                video &&
                video.textTracks[0] &&
                video.textTracks[0].activeCues &&
                video.textTracks[0].activeCues.length > 0
              ) {
                /* prettier-ignore */
                // @ts-ignore
                animatedCaptions (captionsSpan, video.textTracks[0].activeCues[0].text, video.textTracks[0].activeCues[0].endTime - video.textTracks[0].activeCues[0].startTime );
              }
            });

            track.src = isInAppAndroid
              ? ("_assets/" + update.captions).replace(
                  "static01.nyt.com",
                  "www.nytimes.com",
                )
              : "_assets/" + update.captions;

            this.appendChild(track);
          });
        }

        if (obj.tracking.layers[key].type === "video") {
          mute.appendChild(speaker);

          if (obj.tracking.layers[key].audio) {
            vidsWithAudio.push(video);
          }

          obj.nonScrollVideos.push(video);

          video.addEventListener(
            "canplaythrough",
            function () {
              video.pause();
              // @ts-ignore
              video.removeEventListener("canplaythrough", this);
            },
            false,
          );

          // @ts-ignore
          if (typeof window.customVideoHandler === "undefined") {
            // @ts-ignore
            window.customVideoHandler = [];
          }

          // @ts-ignore
          window.customVideoHandler.push(video);
        }

        obj.intersectObj.entries.push({ target: video });

        scrollContainer.appendChild(videoContainer);

        if (
          obj.tracking.layers[key].type === "scrollingvideo" &&
          hasValue(obj["singleFrames"] && obj.stillImage === null)
        ) {
          obj.stillImage = new Image();
          scrollContainer.appendChild(obj.stillImage);
        }

        let style = getComputedStyle(mute);
        obj.tracking.layers[key].muteMargin = parseInt(style.marginBottom);
      } else if (obj.tracking.layers[key].type === "null") {
        let dummy = document.createElement("div");
        dummy.id = obj.id + "_tracking_" + key;
        dummy.className = "g-scrollingparty-null";

        obj.tracking.layers[key].domElem = dummy;
        scrollContainer.appendChild(dummy);
      }
    });
  };

  const updateLayerAttrs = (layers, name) => {
    let returnObj = { text: null, style: null, captions: null };

    layers.forEach((layer) => {
      if (layer.layer === name) {
        if (hasValue(layer.text)) returnObj.text = layer.text;
        if (hasValue(layer.style)) returnObj.style = layer.style;
        if (hasValue(layer.captions)) returnObj.captions = layer.captions;
        return returnObj;
      }
    });

    return returnObj;
  };

  const addTrackingAttrs = (obj, elem, style) => {
    let allFilters = "",
      hasFilter = false;

    Object.keys(obj.attributes).forEach(function (attrKey) {
      if (filterArr.includes(attrKey)) {
        let unit = pxFilterArr.includes(attrKey) ? "px" : "";
        /* prettier-ignore */
        unit = pctFilterArr.includes (attrKey) ? "%" : degFilterArr.includes (attrKey) ? "deg" : unit;
        allFilters += attrKey + "(" + obj.attributes[attrKey] + unit + ") ";
        hasFilter = true;
      } else {
        let unit = pxArr.includes(attrKey) ? "px" : "";
        unit = pctArr.includes(attrKey) && !obj.absolute ? "%" : unit;
        if (style) elem.style[attrKey] = obj.attributes[attrKey] + unit;
        else elem.setAttribute(attrKey, obj.attributes[attrKey] + unit);
      }
    });

    if (hasFilter) elem.style.filter = allFilters;
  };

  // const playSegment = (id, start, end) => {
  // 	if (hasValue(segmentMethods[id])) segmentMethods[id](start, end);
  // };

  // const callback = (method) => {
  // 	if (!hasValue(method)) return scrollCallback;
  // 	scrollCallback = method;
  // };

  // const muted = (bool) => {
  // 	if (!hasValue(bool)) return vidsMuted;
  // 	vidsMuted = bool;
  // 	vidsWithAudio.forEach(function (video, index) {
  // 		setTimeout(function () {
  // 			video.muted = vidsMuted;
  // 		}, index * 150);
  // 	});
  // };

  const updateLayers = (assetID, layers) => {
    // TODO: maybe a callback here? just using this to wait for dom to settle
    setTimeout(function () {
      updateLayersDelayed(assetID, layers);
    }, 3000);
  };

  const updateLayersDelayed = (assetID, layers) => {
    layers.forEach(function (layer) {
      let elems = document.querySelectorAll(
        "[id^='" + assetID + "_tracking_" + layer.layer + "'] > div",
      );

      elems.forEach(function (element) {
        if (hasValue(layer.className) && layer.className.trim() !== "")
          element.classList.add(layer.className);
        if (hasValue(layer.text) && layer.text.trim() !== "")
          element.innerHTML = "<span>" + layer.text + "</span>";
      });
    });
  };

  const intersectionSetup = (intersection) => {
    let options = {
      //root: intersection.root,
      rootMargin: "1000px",
      threshold: 0.0,
    };

    let allAssetsLoaded = false;

    let callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.target.src === "" && entry.isIntersecting) {
          entry.target.src = entry.target["data-src"];

          // the sublayer video doesn't have 'data-scrolling-video', is that a bug?
          // if (entry.target["data-scrolling-video"]) entry.target.play ();
          if (entry.target.nodeName == "VIDEO" && entry.target.playsinline) {
            entry.target.play();

            let playOnce = () => {
              entry.target.play();
              entry.target.pause();
              document.body.removeEventListener("touchstart", playOnce);
            };
            document.body.addEventListener("touchstart", playOnce);
          }
          // unusual safari-only bug where the video doesn't start loading.
          setTimeout(() => {
            if (
              entry.target.nodeName == "VIDEO" &&
              entry.target.playsinline &&
              !entry.target.readyState
            ) {
              //console.log("Kicking safari's wheels a bit.. " + entry.target.src);
              entry.target.load();

              let playOnce = () => {
                entry.target.play();
                entry.target.pause();
                document.body.removeEventListener("touchstart", playOnce);
              };
              document.body.addEventListener("touchstart", playOnce);
            }
          }, 600);
        }
      });

      if (!allAssetsLoaded) {
        if (entries.map((entry) => entry.target.src).every((src) => src)) {
          allAssetsLoaded = true;
          intersection.root.classList.add("g-scrollingparty-loaded");
        }
      }
    };

    let observer = new IntersectionObserver(callback, options);

    intersection.entries.forEach((elem) => {
      observer.observe(elem.target);
    });

    // console.log ("INTERSECTION OBJ", intersection.root.id, intersection.entries);
  };

  window.addEventListener("resize", function () {
    if (!throttled) {
      throttled = true;
      if (resizeMethods.length > 0)
        resizeMethods.forEach(function (method) {
          method();
        });
      setTimeout(function () {
        throttled = false;
      }, 150);
    }
  });

  init();
};
