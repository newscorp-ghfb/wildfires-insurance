var activeComp = app.project.activeItem,
  layersAll = activeComp.layers,
  duration = activeComp.duration,
  frameRate = activeComp.frameRate,
  frameDuration = activeComp.frameDuration,
  totalFrames = duration / frameDuration,
  compWidth = activeComp.width,
  compHeight = activeComp.height,
  textWidth = 300,
  textHeight = 300,
  tempExpName = "TEMP EXPRESSIONS",
  outFile = null;

function hasValue(key) {
  return (
    typeof key !== "undefined" &&
    typeof key !== undefined &&
    key !== null &&
    key !== ""
  );
}

function collectMarkers() {
  var markerProp = activeComp.markerProperty,
    markerNum = markerProp.numKeys,
    markers = [],
    prevFrame = -1,
    prevColor = -1,
    prevComment = "";

  for (var i = 1; i <= markerNum; i++) {
    var frame = secondsToFrames(markerProp.keyTime(i)),
      color = markerProp.keyValue(i).label,
      comment = markerProp.keyValue(i).comment;

    if (prevColor == color && prevComment == comment) {
      var clip = { start: prevFrame, end: frame, behavior: comment };
      markers.push(clip);
    }

    prevFrame = frame;
    (prevColor = color), (prevComment = comment);

    // alert (frame + " " + color + " " + comment);
  }

  return markers;
}

function writeFile(fileObj, encoding) {
  encoding = encoding || "utf-8";
  fileObj = fileObj instanceof File ? fileObj : new File(fileObj);

  var parentFolder = fileObj.parent,
    previousWritten = false,
    json = {},
    clips = collectMarkers();

  json.stage = {};
  json.layers = {};

  json.stage = {
    width: compWidth,
    height: compHeight,
    frameRate: frameRate,
    frameLength: totalFrames,
    clips: clips,
  };

  if (!parentFolder.exists && !parentFolder.create())
    throw new Error("Cannot create file in path " + fileObj.fsName);

  fileObj.encoding = encoding;

  fileObj.open("w");

  for (var i = layersAll.length; i > 0; i--) {
    var layerStr = "",
      layerType = resolveLayerType(layersAll[i], fileObj),
      audioSplit = layersAll[i].name.split("+"),
      nameSplit = audioSplit[0].split(/:(?![^https:|http:])/),
      name = nameSplit[0] + "|" + uuidv4(),
      absVals = nameSplit.length > 1 ? nameSplit[1].split(",") : [];

    if (layerType.type != null) {
      var sourceRect = layersAll[i].sourceRectAtTime(0, false);

      json.layers[name] = {};
      json.layers[name]["start"] = timecodeToFrames(layersAll[i].inPoint);
      json.layers[name]["end"] = timecodeToFrames(layersAll[i].outPoint);
      json.layers[name]["absolute"] = absVals;
      json.layers[name]["type"] = layerType.type;

      if (layerType.type === "path") {
        json.layers[name]["closed"] = layerType.base
          .property("ADBE Vector Shape - Group")
          .property("ADBE Vector Shape").value.closed;
        json.layers[name]["animatedPath"] = layerType.base
          .property("ADBE Vector Shape - Group")
          .property("ADBE Vector Shape").isTimeVarying;
      }

      json.layers[name]["attributes"] = {};
      json.layers[name]["animatedAttributes"] = [];
    }

    if (layerType.type == "text") {
      var base = layerType.base,
        sourceRect = layersAll[i].sourceRectAtTime(0, false),
        anchorPoint = layerType.transform
          .property("Anchor Point")
          .valueAtTime(0, false),
        top = sourceRect.top,
        left = sourceRect.left,
        width = sourceRect.width,
        height = sourceRect.height,
        valign =
          anchorPoint[1] == 0
            ? "center"
            : anchorPoint[1] > 0
              ? "flex-end"
              : "flex-start",
        halign = "left",
        marginTop = 0,
        marginLeft = 0,
        text = { globals: {}, attrs: {}, blocks: [] },
        charLen = layersAll[i].property("Source Text").value.text.length, // layersAll[i].text.sourceText.length,
        currStr = "",
        initialAttrs = {},
        diffs = {},
        expressionLayer = activeComp.layer(tempExpName);

      if (base.justification == ParagraphJustification.RIGHT_JUSTIFY)
        halign = "right";
      else if (base.justification == ParagraphJustification.CENTER_JUSTIFY)
        halign = "center";

      if (halign == "right") {
        left += width;
        marginLeft = -width;
      } else if (halign == "center") {
        left += width / 2;
        marginLeft = -width / 2;
      }

      if (valign == "flex-end") {
        top -= height;
        marginTop = -height;
      } else if (valign == "center") {
        top -= height / 2;
        marginTop = -height / 2;
      }

      text.globals.id = name;
      text.globals.top = (-top / compHeight) * 100 + "%";
      text.globals.left = (left / compWidth) * 100 + "%";
      text.globals.width = width + "px";
      text.globals.height = height + "px";
      text.globals.marginTop = marginTop + "px";
      text.globals.marginLeft = marginLeft + "px";

      text.globals["alignItems"] = valign;
      text.globals["textAlign"] = halign;

      for (var letter = 0; letter < charLen; letter++) {
        var currChar = setupCharacterAttributes(expressionLayer, letter, i);

        if (letter == 0) {
          initialAttrs = fillCharacterAttributes(currChar);
          text.attrs = formatAttrs(initialAttrs, initialAttrs);
          currStr += currChar.contents;
        } else {
          var isMatchingInitial = checkCharacterAttributes(
              currChar,
              initialAttrs,
            ),
            isMatchingDiff = shallowCompare(diffs, isMatchingInitial.diffs);

          if (isMatchingDiff) {
            currStr += currChar.contents;
          } else {
            var formattedDiffs = formatAttrs(initialAttrs, diffs);
            text.blocks.push({ text: currStr, diffs: formattedDiffs });
            currStr = currChar.contents;
            diffs = checkCharacterAttributes(currChar, initialAttrs).diffs;
          }
        }
      }

      var formattedDiffs = formatAttrs(initialAttrs, diffs);
      text.blocks.push({ text: currStr, diffs: formattedDiffs });
      json.layers[name].text = text;
    } else if (
      layerType.type === "ellipse" ||
      layerType.type === "rect" ||
      layerType.type === "path"
    ) {
      var stroke = layerType.base.property("ADBE Vector Graphic - Stroke"),
        fill = layerType.base.property("ADBE Vector Graphic - Fill"),
        showStroke = stroke.enabled,
        showFill = fill.enabled,
        hasDashes =
          layerType.base
            .property("ADBE Vector Graphic - Stroke")
            .property("ADBE Vector Stroke Dashes")
            .property("ADBE Vector Stroke Dash 1").value !== 10, // TODO: fix this. just checks for default right now.
        widthHeight = layerType.base.property(1).property("Size")
          ? layerType.base.property(1).property("Size").value
          : [100, 100];

      json.layers[name]["attributes"] = {};
      json.layers[name]["attributes"]["stroke"] = showStroke
        ? resolveAttributes(
            layersAll[i],
            ["ADBE Vector Graphic - Stroke", "Color"],
            layerType,
          )
        : "none";
      json.layers[name]["attributes"]["stroke-opacity"] = resolveAttributes(
        layersAll[i],
        ["ADBE Vector Graphic - Stroke", "Opacity"],
        layerType,
      );
      json.layers[name]["attributes"]["stroke-width"] = resolveAttributes(
        layersAll[i],
        ["ADBE Vector Graphic - Stroke", "Stroke Width"],
        layerType,
      );
      json.layers[name]["attributes"]["fill"] = showFill
        ? resolveAttributes(
            layersAll[i],
            ["ADBE Vector Graphic - Fill", "Color"],
            layerType,
          )
        : "none";
      json.layers[name]["attributes"]["fill-opacity"] = resolveAttributes(
        layersAll[i],
        ["ADBE Vector Graphic - Fill", "Opacity"],
        layerType,
      );
      json.layers[name]["attributes"]["vector-effect"] = "non-scaling-stroke";
      json.layers[name]["attributes"]["stroke-dasharray"] = hasDashes
        ? resolveAttributes(
            layersAll[i],
            [
              "ADBE Vector Graphic - Stroke",
              "ADBE Vector Stroke Dashes",
              "ADBE Vector Stroke Dash 1",
            ],
            layerType,
          )
        : 0;
      json.layers[name]["attributes"]["stroke-dashoffset"] = hasDashes
        ? resolveAttributes(
            layersAll[i],
            [
              "ADBE Vector Graphic - Stroke",
              "ADBE Vector Stroke Dashes",
              "ADBE Vector Stroke Offset",
            ],
            layerType,
          )
        : 0;

      switch (layerType.type) {
        case "ellipse":
          json.layers[name]["attributes"]["rx"] =
            widthHeight[0] / 2 / compWidth;
          json.layers[name]["attributes"]["ry"] =
            widthHeight[1] / 2 / compHeight;
          break;
        case "rect":
          json.layers[name]["attributes"]["width"] = widthHeight[0] / compWidth;
          json.layers[name]["attributes"]["height"] =
            widthHeight[1] / compHeight;
          break;
        case "path":
          json.layers[name]["attributes"]["d"] = "M 0 0";
          break;
        default:
      }
    } else if (layerType.type === "image" || layerType.type === "canvas") {
      //if (layersAll[i].property ("ADBE Effect Parade").property ("ADBE Color Balance (HLS)") !== null) alert (layersAll[i].property ("ADBE Effect Parade").property ("ADBE Color Balance (HLS)").property ("ADBE Color Balance (HLS)-0003").value);
      if (layerType.type === "image")
        json.layers[name]["file"] = layersAll[i].name.substring(6, name.length);
      json.layers[name]["attributes"]["width"] = sourceRect.width / compWidth;
      json.layers[name]["attributes"]["height"] =
        sourceRect.height / compHeight;

      if (
        layersAll[i]
          .property("ADBE Effect Parade")
          .property("ADBE Gaussian Blur 2") !== null
      )
        json.layers[name]["attributes"]["blur"] = resolveAttributes(
          layersAll[i],
          [
            "ADBE Effect Parade",
            "ADBE Gaussian Blur 2",
            "ADBE Gaussian Blur 2-0001",
          ],
          layerType,
          true,
        );

      if (
        layersAll[i]
          .property("ADBE Effect Parade")
          .property("ADBE Color Balance (HLS)") !== null
      ) {
        json.layers[name]["attributes"]["hue-rotate"] = resolveAttributes(
          layersAll[i],
          [
            "ADBE Effect Parade",
            "ADBE Color Balance (HLS)",
            "ADBE Color Balance (HLS)-0001",
          ],
          layerType,
          true,
        );
        json.layers[name]["attributes"]["brightness"] = resolveAttributes(
          layersAll[i],
          [
            "ADBE Effect Parade",
            "ADBE Color Balance (HLS)",
            "ADBE Color Balance (HLS)-0002",
          ],
          layerType,
          true,
        );
        json.layers[name]["attributes"]["saturate"] = resolveAttributes(
          layersAll[i],
          [
            "ADBE Effect Parade",
            "ADBE Color Balance (HLS)",
            "ADBE Color Balance (HLS)-0003",
          ],
          layerType,
          true,
        );
      }

      if (layerType.mask !== null) {
        json.layers[name]["mask"] = resolvePath(layersAll[i], layerType, true);
        json.layers[name]["animatedMask"] =
          layerType.mask.property("ADBE Mask Shape").isTimeVarying;
      }
    } else if (
      layerType.type === "video" ||
      layerType.type === "scrollingvideo"
    ) {
      var startLength = layerType.type === "video" ? 6 : 15;

      json.layers[name]["url"] = layersAll[i].name
        .substring(startLength, name.length)
        .split("+")[0];
      json.layers[name]["audio"] = audioSplit.length > 1;
      json.layers[name]["attributes"]["width"] = sourceRect.width / compWidth;
      json.layers[name]["attributes"]["height"] =
        sourceRect.height / compHeight;

      if (
        layersAll[i]
          .property("ADBE Effect Parade")
          .property("ADBE Gaussian Blur 2") !== null
      )
        json.layers[name]["attributes"]["blur"] = resolveAttributes(
          layersAll[i],
          [
            "ADBE Effect Parade",
            "ADBE Gaussian Blur 2",
            "ADBE Gaussian Blur 2-0001",
          ],
          layerType,
          true,
        );

      if (layerType.mask !== null) {
        json.layers[name]["mask"] = resolvePath(layersAll[i], layerType, true);
        json.layers[name]["animatedMask"] =
          layerType.mask.property("ADBE Mask Shape").isTimeVarying;
      }
    } else if (layerType.type === "null") {
      json.layers[name]["attributes"]["width"] = sourceRect.width / compWidth;
      json.layers[name]["attributes"]["height"] =
        sourceRect.height / compHeight;
    }

    if (layerType.type !== null) {
      json.layers[name]["animatedTransforms"] = [];

      json.layers[name]["anchor"] = resolveTransforms(
        layersAll[i],
        "Anchor Point",
        layerType,
      );
      json.layers[name]["pos"] = resolveTransforms(
        layersAll[i],
        "Position",
        layerType,
      );
      json.layers[name]["scale"] = resolveTransforms(
        layersAll[i],
        "Scale",
        layerType,
      );
      json.layers[name]["rot"] = resolveTransforms(
        layersAll[i],
        "Rotation",
        layerType,
      );
      json.layers[name]["opacity"] = resolveTransforms(
        layersAll[i],
        "Opacity",
        layerType,
      );

      for (var j = 0; j < layerType.animatedTransforms.length; j++)
        json.layers[name]["animatedTransforms"].push(
          layerType.animatedTransforms[j],
        );
      for (var j = 0; j < layerType.animatedAttributes.length; j++)
        json.layers[name]["animatedAttributes"].push(
          layerType.animatedAttributes[j],
        );

      if (layerType.type === "path")
        json.layers[name]["path"] = resolvePath(layersAll[i], layerType, false);
    }
  }

  var stringify = JSON.stringify(json); // json, null, 2

  //stringify = stringify.replace (/\[[\r\n\s]+\]/gm, "[]");

  fileObj.write(stringify);
  fileObj.close();
  return fileObj;
}

function shallowCompare(objOne, objTwo) {
  var objOneLen = 0,
    objTwoLen = 0;

  for (var key in objOne) {
    if (objOne.hasOwnProperty(key)) {
      objOneLen++;
    }
  }
  for (var key in objTwo) {
    if (objTwo.hasOwnProperty(key)) {
      objTwoLen++;
    }
  }

  if (objOneLen !== objTwoLen) return false;

  for (var key in objOne) {
    if (objOne.hasOwnProperty(key) && objTwo.hasOwnProperty(key)) {
      if (objOne[key] !== objTwo[key]) return false;
    } else return false;
  }

  return true;
}

function setupCharacterAttributes(expressionLayer, letterIndex, layerIndex) {
  expressionLayer.text.sourceText.expression =
    "var sourceTextProperty = thisComp.layer (" +
    layerIndex +
    ").text.sourceText; var newStyle = sourceTextProperty.getStyleAt(" +
    letterIndex +
    "," +
    layersAll[layerIndex].inPoint +
    "); thisComp.layer('TEMP EXPRESSIONS').setText = " +
    "newStyle.fillColor[0] + '|' + " +
    "newStyle.fillColor[1] + '|' + " +
    "newStyle.fillColor[2] + '|' + " +
    "newStyle.isAllCaps + '|' + " +
    "newStyle.font + '|' + " +
    "newStyle.fontSize + '|' + " +
    "newStyle.leading + '|' + " +
    "newStyle.tracking";

  var attrSplit = activeComp
      .layer(tempExpName)
      .property("Source Text")
      .value.text.split("|"),
    contents = layersAll[layerIndex]
      .property("Source Text")
      .value.text.substring(letterIndex, letterIndex + 1),
    characterAttributes = {};

  // this structure is strange, but it mimics the illustrator scripting environment to reduce dev time
  characterAttributes.fillColor = {};
  characterAttributes.fillColor.red = Math.round(
    parseFloat(attrSplit[0] * 255),
  );
  characterAttributes.fillColor.green = Math.round(
    parseFloat(attrSplit[1] * 255),
  );
  characterAttributes.fillColor.blue = Math.round(
    parseFloat(attrSplit[2] * 255),
  );
  characterAttributes.capitalization = attrSplit[3] == "true";
  characterAttributes.textFont = {};
  characterAttributes.textFont.name = attrSplit[4];
  characterAttributes.size = parseFloat(attrSplit[5]);
  characterAttributes.leading = parseFloat(attrSplit[6]);
  characterAttributes.tracking = parseFloat(attrSplit[7]);

  return { characterAttributes: characterAttributes, contents: contents };
}

function fillCharacterAttributes(currChar) {
  var attrs = currChar.characterAttributes,
    red = attrs.fillColor.red,
    green = attrs.fillColor.green,
    blue = attrs.fillColor.blue,
    caps = attrs.capitalization,
    attrObj = {
      font: attrs.textFont.name,
      size: attrs.size,
      leading: attrs.leading,
      tracking: attrs.tracking,
      caps: caps,
      red: red,
      green: green,
      blue: blue,
    };
  return attrObj;
}

function checkCharacterAttributes(currChar, attrs) {
  var match = true,
    diffs = {};

  currChar.characterAttributes.font =
    currChar.characterAttributes.textFont.name;
  currChar.characterAttributes.caps =
    currChar.characterAttributes.capitalization;
  currChar.characterAttributes.red = currChar.characterAttributes.fillColor.red;
  currChar.characterAttributes.green =
    currChar.characterAttributes.fillColor.green;
  currChar.characterAttributes.blue =
    currChar.characterAttributes.fillColor.blue;

  for (var attr in attrs) {
    if (attrs.hasOwnProperty(attr)) {
      if (attrs[attr] !== currChar.characterAttributes[attr]) {
        diffs[attr] = currChar.characterAttributes[attr];
        match = false;
      }
    }
  }

  return { match: match, diffs: diffs };
}

function formatAttrs(initialAttrs, attrs) {
  var returnObj = {},
    red = !hasValue(attrs.red) ? initialAttrs.red : attrs.red,
    green = !hasValue(attrs.green) ? initialAttrs.green : attrs.green,
    blue = !hasValue(attrs.blue) ? initialAttrs.blue : attrs.blue,
    size = !hasValue(attrs.size) ? initialAttrs.size : attrs.size;

  for (var attr in attrs) {
    if (attrs.hasOwnProperty(attr)) {
      switch (attr) {
        case "font":
          returnObj.fontFamily = fonts[attrs["font"]].family;
          returnObj.fontWeight = fonts[attrs["font"]].weight;
          returnObj.fontStyle = fonts[attrs["font"]].style;
          break;
        case "size":
          returnObj.fontSize = attrs["size"] + "px";
          break;
        case "leading":
          returnObj.lineHeight = attrs["leading"] + "px";
          break;
        case "tracking":
          returnObj.letterSpacing = size * (attrs["tracking"] / 1000) + "px";
          break;
        case "caps":
          returnObj.textTransform = attrs["caps"] ? "uppercase" : "none";
          break;
        case "red":
          returnObj.color = "rgb(" + red + "," + green + "," + blue + ")";
          break;
        case "green":
          returnObj.color = "rgb(" + red + "," + green + "," + blue + ")";
          break;
        case "blue":
          returnObj.color = "rgb(" + red + "," + green + "," + blue + ")";
          break;
        default:
        // code block
      }
    }
  }

  return returnObj;
}

function resolveTransforms(layer, transform, layerType) {
  var isTimeVarying = layerType.transform.property(transform).isTimeVarying,
    vals = isTimeVarying ? [] : null;

  if (isTimeVarying) {
    var inPoint = timecodeToFrames(layer.inPoint),
      outPoint = timecodeToFrames(layer.outPoint);

    for (var frame = 0; frame < totalFrames; frame++) {
      var time = timecodeToFrames(frame * frameDuration),
        timeHMS = frame * frameDuration;

      if (time >= inPoint && time <= outPoint) {
        vals.push(addTransforms(layer, transform, layerType, timeHMS));
      }
    }
  } else {
    vals = addTransforms(layer, transform, layerType, 0);
  }

  return vals;
}

function checkArrayForValue(val, arr) {
  for (var i = 0; i < arr.length; i++) {
    if (val == arr[i]) {
      return true;
    }
  }

  return false;
}

function addTransforms(layer, transform, layerType, timeHMS) {
  // alert (layerType.animatedTransforms.length);

  // if (layerType.animatedTransforms.length === 0) layerType.animatedTransforms = new Array ("");

  switch (transform) {
    case "Anchor Point":
      var anchorPoint = layerType.transform
          .property(transform)
          .valueAtTime(timeHMS, false),
        sourceRect = layer.sourceRectAtTime(0, false),
        anchorSourcePct = {
          pctX: anchorPoint[0] / sourceRect.width,
          pctY: anchorPoint[1] / sourceRect.height,
        },
        offset = {
          x: roundAnchor(anchorPoint[0], compWidth),
          y: roundAnchor(anchorPoint[1], compHeight),
        },
        offsetPct = {
          pctX: roundAnchorPct(anchorSourcePct.pctX * 100),
          pctY: roundAnchorPct(anchorSourcePct.pctY * 100),
        };

      if (
        !checkArrayForValue("anchor", layerType.animatedTransforms) &&
        timeHMS
      )
        layerType.animatedTransforms.push("anchor");

      if (
        layerType.type === "image" ||
        layerType.type === "canvas" ||
        layerType.type === "video" ||
        layerType.type === "scrollingvideo" ||
        layerType.type === "text" ||
        layerType.type === "null"
      )
        return [offsetPct.pctX, offsetPct.pctY];
      else return [offset.x, offset.y];
      break;

    case "Position":
      var x = roundPos(
          layerType.transform
            .property(transform)
            .valueAtTime(timeHMS, false)[0],
          compWidth,
        ),
        y = roundPos(
          layerType.transform
            .property(transform)
            .valueAtTime(timeHMS, false)[1],
          compHeight,
        );

      // if (layerType.animatedTransforms === Array && layerType.animatedTransforms.indexOf ("pos") === -1 && timeHMS) layerType.animatedTransforms.push ("pos");
      if (!checkArrayForValue("pos", layerType.animatedTransforms) && timeHMS)
        layerType.animatedTransforms.push("pos");
      return [x, y];
      break;

    case "Scale":
      var width = roundScale(
          layerType.transform
            .property(transform)
            .valueAtTime(timeHMS, false)[0],
        ),
        height = roundScale(
          layerType.transform
            .property(transform)
            .valueAtTime(timeHMS, false)[1],
        );

      // if (layerType.animatedTransforms === Array && layerType.animatedTransforms.indexOf ("scale") === -1 && timeHMS) layerType.animatedTransforms.push ("scale");
      if (!checkArrayForValue("scale", layerType.animatedTransforms) && timeHMS)
        layerType.animatedTransforms.push("scale");
      return [width, height];
      break;

    case "Rotation":
      var rotation = roundRotation(
        layerType.transform.property(transform).valueAtTime(timeHMS, false),
      );

      // if (layerType.animatedTransforms === Array && layerType.animatedTransforms.indexOf ("rot") === -1 && timeHMS) layerType.animatedTransforms.push ("rot");
      if (!checkArrayForValue("rot", layerType.animatedTransforms) && timeHMS)
        layerType.animatedTransforms.push("rot");
      return rotation;
      break;

    case "Opacity":
      var opacity = roundOpacity(
        layerType.transform.property(transform).valueAtTime(timeHMS, false),
      );

      // if (layerType.animatedTransforms === Array && layerType.animatedTransforms.indexOf ("opacity") === -1 && timeHMS) layerType.animatedTransforms.push ("opacity");
      if (
        !checkArrayForValue("opacity", layerType.animatedTransforms) &&
        timeHMS
      )
        layerType.animatedTransforms.push("opacity");
      return opacity;
      break;

    default:
  }
}

function resolveAttributes(layer, attr, layerType, isRoot) {
  var property = isRoot
    ? layer.property(attr[0])
    : layerType.base.property(attr[0]);

  for (var i = 1; i < attr.length; i++) {
    property = property.property(attr[i]);
  }

  var isTimeVarying = property.isTimeVarying,
    vals = isTimeVarying ? [] : null,
    attrStr = attr.join("|");

  if (isTimeVarying) {
    var inPoint = timecodeToFrames(layer.inPoint),
      outPoint = timecodeToFrames(layer.outPoint);

    for (var frame = 0; frame < totalFrames; frame++) {
      var time = timecodeToFrames(frame * frameDuration),
        timeHMS = frame * frameDuration;

      if (time >= inPoint && time <= outPoint) {
        vals.push(addAttributes(attrStr, property, layerType, timeHMS));
      }
    }
  } else {
    vals = addAttributes(attrStr, property, layerType, 0);
  }

  return vals;
}

function addAttributes(attrStr, property, layerType, timeHMS) {
  switch (attrStr) {
    case "ADBE Vector Graphic - Fill|Color":
      var fillRGB = property.valueAtTime(timeHMS, false),
        hex = rgbToHex(fillRGB[0], fillRGB[1], fillRGB[2]);
      if (
        layerType.animatedAttributes.length > 0 &&
        layerType.animatedAttributes.indexOf("fill") === -1 &&
        timeHMS
      )
        layerType.animatedAttributes.push("fill");
      return hex;
      break;

    case "ADBE Vector Graphic - Fill|Opacity":
      var opacity = property.valueAtTime(timeHMS, false) / 100;
      if (
        layerType.animatedAttributes.length > 0 &&
        layerType.animatedAttributes.indexOf("fill-opacity") === -1 &&
        timeHMS
      )
        layerType.animatedAttributes.push("fill-opacity");
      return opacity;
      break;

    case "ADBE Vector Graphic - Stroke|Color":
      var strokeRGB = property.valueAtTime(timeHMS, false),
        hex = rgbToHex(strokeRGB[0], strokeRGB[1], strokeRGB[2]);
      if (
        layerType.animatedAttributes.length > 0 &&
        layerType.animatedAttributes.indexOf("stroke") === -1 &&
        timeHMS
      )
        layerType.animatedAttributes.push("stroke");
      return hex;
      break;

    case "ADBE Vector Graphic - Stroke|Stroke Width":
      var width = property.valueAtTime(timeHMS, false);
      if (
        layerType.animatedAttributes.length > 0 &&
        layerType.animatedAttributes.indexOf("stroke-width") === -1 &&
        timeHMS
      )
        layerType.animatedAttributes.push("stroke-width");
      return width;
      break;

    case "ADBE Vector Graphic - Stroke|Opacity":
      var opacity = property.valueAtTime(timeHMS, false) / 100;
      if (
        layerType.animatedAttributes.length > 0 &&
        layerType.animatedAttributes.indexOf("stroke-opacity") === -1 &&
        timeHMS
      )
        layerType.animatedAttributes.push("stroke-opacity");
      return opacity;
      break;

    case "ADBE Vector Graphic - Stroke|ADBE Vector Stroke Dashes|ADBE Vector Stroke Dash 1":
      var dash = property.valueAtTime(timeHMS, false);
      if (
        layerType.animatedAttributes.length > 0 &&
        layerType.animatedAttributes.indexOf("stroke-dasharray") === -1 &&
        timeHMS
      )
        layerType.animatedAttributes.push("stroke-dasharray");
      return dash;
      break;

    case "ADBE Vector Graphic - Stroke|ADBE Vector Stroke Dashes|ADBE Vector Stroke Offset":
      var offset = property.valueAtTime(timeHMS, false);
      if (
        layerType.animatedAttributes.length > 0 &&
        layerType.animatedAttributes.indexOf("stroke-dashoffset") === -1 &&
        timeHMS
      )
        layerType.animatedAttributes.push("stroke-dashoffset");
      return offset;
      break;

    case "Text|Source Text":
      var sourceText = property.valueAtTime(timeHMS, false);
      if (
        layerType.animatedAttributes.length > 0 &&
        layerType.animatedAttributes.indexOf("text") === -1 &&
        timeHMS
      )
        layerType.animatedAttributes.push("text");
      // if (timeHMS == 18) alert (sourceText.text);
      return sourceText.text;
      break;

    case "Text|Animators|Animator 1|Properties|ADBE Text Fill Color":
      var color = property.valueAtTime(timeHMS, false),
        hex = rgbToHex(color[0], color[1], color[2]);
      if (
        layerType.animatedAttributes.length > 0 &&
        layerType.animatedAttributes.indexOf("color") === -1 &&
        timeHMS
      )
        layerType.animatedAttributes.push("color");
      return hex;
      break;

    case "Text|Animators|Animator 1|Properties|ADBE Text Tracking Amount":
      var tracking = property.valueAtTime(timeHMS, false),
        adjusted = (tracking / 666) * layerType.base.fontSize;
      if (
        layerType.animatedAttributes.length > 0 &&
        layerType.animatedAttributes.indexOf("letter-spacing") === -1 &&
        timeHMS
      )
        layerType.animatedAttributes.push("letter-spacing");
      return tracking;
      break;

    case "Text|Animators|Animator 1|Properties|ADBE Text Line Spacing":
      var leading =
        property.valueAtTime(timeHMS, false)[1] + layerType.base.leading;
      if (
        layerType.animatedAttributes.length > 0 &&
        layerType.animatedAttributes.indexOf("line-height") === -1 &&
        timeHMS
      )
        layerType.animatedAttributes.push("line-height");
      return leading;
      break;

    case "ADBE Effect Parade|ADBE Gaussian Blur 2|ADBE Gaussian Blur 2-0001":
      var blur = property.valueAtTime(timeHMS, false),
        scaleX = roundScale(
          layerType.transform.property("Scale").valueAtTime(timeHMS, false)[0],
        ),
        scaleY = roundScale(
          layerType.transform.property("Scale").valueAtTime(timeHMS, false)[1],
        );
      if (
        layerType.animatedAttributes.length > 0 &&
        layerType.animatedAttributes.indexOf("blur") === -1 &&
        timeHMS
      )
        layerType.animatedAttributes.push("blur");
      return blur * ((scaleX + scaleY) / 2);
      break;

    case "ADBE Effect Parade|ADBE Color Balance (HLS)|ADBE Color Balance (HLS)-0001":
      var hue = property.valueAtTime(timeHMS, false);
      if (
        layerType.animatedAttributes.length > 0 &&
        layerType.animatedAttributes.indexOf("hue-rotate") === -1 &&
        timeHMS
      )
        layerType.animatedAttributes.push("hue-rotate");
      return hue;
      break;

    case "ADBE Effect Parade|ADBE Color Balance (HLS)|ADBE Color Balance (HLS)-0002":
      var brightness = property.valueAtTime(timeHMS, false);
      if (
        layerType.animatedAttributes.length > 0 &&
        layerType.animatedAttributes.indexOf("brightness") === -1 &&
        timeHMS
      )
        layerType.animatedAttributes.push("brightness");
      return 100 + brightness;
      break;

    case "ADBE Effect Parade|ADBE Color Balance (HLS)|ADBE Color Balance (HLS)-0003":
      var saturate = property.valueAtTime(timeHMS, false);
      if (
        layerType.animatedAttributes.length > 0 &&
        layerType.animatedAttributes.indexOf("saturate") === -1 &&
        timeHMS
      )
        layerType.animatedAttributes.push("saturate");
      return 100 + saturate;
      break;

    default:
      return 0;
  }
}

function resolvePath(layer, layerType, isMask) {
  var base = isMask
      ? layerType.mask.property("ADBE Mask Shape")
      : layerType.base
          .property("ADBE Vector Shape - Group")
          .property("ADBE Vector Shape"),
    isTimeVarying = base.isTimeVarying,
    vals = isTimeVarying ? [] : null;

  if (isTimeVarying) {
    var inPoint = timecodeToFrames(layer.inPoint),
      outPoint = timecodeToFrames(layer.outPoint);

    for (var frame = 0; frame < totalFrames; frame++) {
      var time = timecodeToFrames(frame * frameDuration),
        timeHMS = frame * frameDuration;

      if (time >= inPoint && time <= outPoint)
        vals.push(addPath(layerType, timeHMS, isMask));
    }
  } else vals = addPath(layerType, 0, isMask);

  return vals;
}

function addPath(layerType, timeHMS, isMask) {
  var posXY = {
      x: layerType.transform
        .property("Position")
        .valueAtTime(timeHMS, false)[0],
      y: layerType.transform
        .property("Position")
        .valueAtTime(timeHMS, false)[1],
    },
    vertices = isMask
      ? layerType.mask.property("ADBE Mask Shape")
      : layerType.base
          .property("ADBE Vector Shape - Group")
          .property("ADBE Vector Shape"),
    vertsAtTime = vertices.valueAtTime(timeHMS, false).vertices,
    inTanAtTime = vertices.valueAtTime(timeHMS, false).inTangents,
    outTanAtTime = vertices.valueAtTime(timeHMS, false).outTangents,
    vertsLength = vertsAtTime.length,
    xyAtTime = [];

  for (var verts = 0; verts < vertsLength; verts++) {
    var inOutXY = [],
      xy = [
        calculatePosition(vertsAtTime[verts][0], compWidth, posXY.x),
        calculatePosition(vertsAtTime[verts][1], compHeight, posXY.y),
      ];

    if (inTanAtTime[verts][0] === 0 && inTanAtTime[verts][1] === 0)
      inOutXY.push(new Array());
    else
      inOutXY.push([
        calculatePosition(
          vertsAtTime[verts][0] + inTanAtTime[verts][0],
          compWidth,
          posXY.x,
        ),
        calculatePosition(
          vertsAtTime[verts][1] + inTanAtTime[verts][1],
          compHeight,
          posXY.y,
        ),
      ]);

    if (outTanAtTime[verts][0] === 0 && outTanAtTime[verts][1] === 0)
      inOutXY.push(new Array());
    else
      inOutXY.push([
        calculatePosition(
          vertsAtTime[verts][0] + outTanAtTime[verts][0],
          compWidth,
          posXY.x,
        ),
        calculatePosition(
          vertsAtTime[verts][1] + outTanAtTime[verts][1],
          compHeight,
          posXY.y,
        ),
      ]);

    inOutXY.push(xy);
    xyAtTime.push(inOutXY);
  }

  return xyAtTime;
}

function calculatePosition(val, dimension, offset) {
  return Math.round((val / dimension) * 1000) / 1000;
}

function resolveLayerType(layer, fileObj) {
  var base = null,
    transform = null,
    type = null,
    mask = null;

  if (
    layer.name.substring(0, 6) === "shape_" &&
    layer.matchName === "ADBE Vector Layer"
  ) {
    base = layer
      .property("ADBE Root Vectors Group")
      .property("ADBE Vector Group")
      .property("ADBE Vectors Group");
    transform = layer.property("Transform");

    if (base.property(1).matchName === "ADBE Vector Shape - Ellipse")
      type = "ellipse";
    else if (base.property(1).matchName === "ADBE Vector Shape - Rect")
      type = "rect";
    else if (base.property(1).matchName === "ADBE Vector Shape - Group")
      type = "path";
  } else if (
    layer.name.substring(0, 5) === "text_" &&
    layer.matchName === "ADBE Text Layer"
  ) {
    base = layer.property("Text").property("Source Text").value;
    transform = layer.property("Transform");
    type = "text";
  } else if (
    layer.name.substring(0, 6) === "image_" &&
    layer.matchName === "ADBE AV Layer"
  ) {
    base = layer.property("Transform");
    transform = layer.property("Transform");
    type = "image";
    mask = layer.property("ADBE Mask Parade").property("ADBE Mask Atom");
  } else if (
    layer.name.substring(0, 7) === "canvas_" &&
    layer.matchName === "ADBE AV Layer"
  ) {
    base = layer.property("Transform");
    transform = layer.property("Transform");
    type = "canvas";
    mask = layer.property("ADBE Mask Parade").property("ADBE Mask Atom");
  } else if (
    layer.name.substring(0, 6) === "video_" &&
    layer.matchName === "ADBE AV Layer"
  ) {
    base = layer.property("Transform");
    transform = layer.property("Transform");
    type = "video";
    mask = layer.property("ADBE Mask Parade").property("ADBE Mask Atom");
  } else if (
    layer.name.substring(0, 15) === "scrollingvideo_" &&
    layer.matchName === "ADBE AV Layer"
  ) {
    base = layer.property("Transform");
    transform = layer.property("Transform");
    type = "scrollingvideo";
    mask = layer.property("ADBE Mask Parade").property("ADBE Mask Atom");
  } else if (layer.name.substring(0, 5) === "null_" && layer.nullLayer) {
    base = layer.property("Transform");
    transform = layer.property("Transform");
    type = "null";
  }

  return {
    base: base,
    transform: transform,
    type: type,
    mask: mask,
    animatedTransforms: [],
    animatedAttributes: [],
  };
}

function timecodeToFrames(timecode) {
  var timecodeSplit = timeToCurrentFormat(timecode, frameRate, false).split(
      ":",
    ),
    hours = parseInt(timecodeSplit[0]),
    minutes = parseInt(timecodeSplit[1]),
    seconds = parseInt(timecodeSplit[2]),
    frames = parseInt(timecodeSplit[3]),
    total =
      frames +
      seconds * frameRate +
      minutes * (frameRate * 60) +
      hours * (frameRate * 3600);

  return total;
}

function secondsToFrames(seconds) {
  var frames = Math.floor(frameRate * seconds);
  return frames;
}

function canWriteFiles() {
  if (isSecurityPrefSet()) return true;

  alert(
    " This script requires access to write files.\n" +
      "Go to Preferences -> General -> Scripting & Expressions\n" +
      'Make sure "Allow Scripts to Write Files and Access Network" is checked.',
  );

  app.executeCommand(2359);

  return isSecurityPrefSet();

  function isSecurityPrefSet() {
    return (
      app.preferences.getPrefAsLong(
        "Main Pref Section",
        "Pref_SCRIPTING_FILE_NETWORK_SECURITY",
      ) === 1
    );
  }
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  r = Math.floor(r * 255);
  g = Math.floor(g * 255);
  b = Math.floor(b * 255);
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function roundAnchor(position, dimension) {
  return Math.round((position / dimension) * 1000) / 1000;
}
function roundAnchorPct(position) {
  return Math.round(position * 100) / 100;
}
function roundPos(position, dimension) {
  return Math.round((position / dimension) * 10000) / 10000;
}
function roundScale(size) {
  return Math.round(size * 10) / 1000;
}
function roundOpacity(opacity) {
  return Math.round(opacity * 10) / 1000;
}
function roundRotation(rotation) {
  return Math.round(rotation * 10) / 1000;
}

function removeExpressionLayer() {
  var expLayer = activeComp.layer(tempExpName);

  if (hasValue(expLayer)) {
    if (!expLayer.visisible) expLayer.visible = true;
    if (expLayer.locked) expLayer.locked = false;
    expLayer.remove();
  }
}

function addExpressionLayer() {
  var expressionLayer = activeComp.layers.addText("X");
  expressionLayer.name = tempExpName;
  expressionLayer.property("Position").setValue([compWidth, 0]);
  expressionLayer.property("Source Text").value.justification =
    ParagraphJustification.LEFT_JUSTIFY;
}

function init() {
  if (!canWriteFiles()) {
    alert(
      "Cannot write files to disk. Check script permissions in After Effects.",
    );
    return null;
  }

  if (!activeComp || !(activeComp instanceof CompItem)) {
    alert("Please select a composition.");
    return null;
  } else {
    outFile = new File("untitled.json").saveDlg(
      ["Save a JSON tracking file."],
      ["JSON Files:*.json"],
    );
  }

  removeExpressionLayer();

  addExpressionLayer();

  writeFile(outFile);

  removeExpressionLayer();

  alert("Tracking file written.");
}

// from ai2html, thanks mbloch (and others)
var fonts = {
  // Franklin
  "NYTFranklin-Light": {
    family: "var(--g-franklin)",
    weight: "300",
    style: "",
    vshift: "8%",
  },
  "NYTFranklin-Medium": {
    family: "var(--g-franklin)",
    weight: "500",
    style: "",
    vshift: "8%",
  },
  "NYTFranklin-SemiBold": {
    family: "var(--g-franklin)",
    weight: "600",
    style: "",
    vshift: "8%",
  },
  "NYTFranklin-Semibold": {
    family: "var(--g-franklin)",
    weight: "600",
    style: "",
    vshift: "8%",
  },
  "NYTFranklinSemiBold-Regular": {
    family: "var(--g-franklin)",
    weight: "600",
    style: "",
    vshift: "8%",
  },
  "NYTFranklin-SemiboldItalic": {
    family: "var(--g-franklin)",
    weight: "600",
    style: "italic",
    vshift: "8%",
  },
  "NYTFranklin-Bold": {
    family: "var(--g-franklin)",
    weight: "700",
    style: "",
    vshift: "8%",
  },
  "NYTFranklin-LightItalic": {
    family: "var(--g-franklin)",
    weight: "300",
    style: "italic",
    vshift: "8%",
  },
  "NYTFranklin-MediumItalic": {
    family: "var(--g-franklin)",
    weight: "500",
    style: "italic",
    vshift: "8%",
  },
  "NYTFranklin-BoldItalic": {
    family: "var(--g-franklin)",
    weight: "700",
    style: "italic",
    vshift: "8%",
  },
  "NYTFranklin-ExtraBold": {
    family: "var(--g-franklin)",
    weight: "800",
    style: "",
    vshift: "8%",
  },
  "NYTFranklin-ExtraBoldItalic": {
    family: "var(--g-franklin)",
    weight: "800",
    style: "italic",
    vshift: "8%",
  },
  "NYTFranklin-Headline": {
    family: "var(--g-franklin)",
    weight: "bold",
    style: "",
    vshift: "8%",
  },
  "NYTFranklin-HeadlineItalic": {
    family: "var(--g-franklin)",
    weight: "bold",
    style: "italic",
    vshift: "8%",
  },
  // Chelt
  "NYTCheltenham-ExtraLight": {
    family: "var(--g-aileron)",
    weight: "200",
    style: "",
  },
  "NYTCheltenhamExtLt-Regular": {
    family: "var(--g-aileron)",
    weight: "200",
    style: "",
  },
  "NYTCheltenham-Light": {
    family: "var(--g-aileron)",
    weight: "300",
    style: "",
  },
  "NYTCheltenhamLt-Regular": {
    family: "var(--g-aileron)",
    weight: "300",
    style: "",
  },
  "NYTCheltenham-LightSC": {
    family: "var(--g-aileron)",
    weight: "300",
    style: "",
  },
  "NYTCheltenham-Book": {
    family: "var(--g-aileron)",
    weight: "400",
    style: "",
  },
  "NYTCheltenhamBook-Regular": {
    family: "var(--g-aileron)",
    weight: "400",
    style: "",
  },
  "NYTCheltenham-Wide": { family: "var(--g-aileron)", weight: "", style: "" },
  "NYTCheltenhamMedium-Regular": {
    family: "var(--g-aileron)",
    weight: "500",
    style: "",
  },
  "NYTCheltenham-Medium": {
    family: "var(--g-aileron)",
    weight: "500",
    style: "",
  },
  "NYTCheltenham-Bold": {
    family: "var(--g-aileron)",
    weight: "700",
    style: "",
  },
  "NYTCheltenham-BoldCond": {
    family: "var(--g-aileron)",
    weight: "bold",
    style: "",
  },
  "NYTCheltenhamCond-BoldXC": {
    family: "var(--g-aileron-cond)",
    weight: "bold",
    style: "",
  },
  "NYTCheltenham-BoldExtraCond": {
    family: "var(--g-aileron)",
    weight: "bold",
    style: "",
  },
  "NYTCheltenham-ExtraBold": {
    family: "var(--g-aileron)",
    weight: "bold",
    style: "",
  },
  "NYTCheltenham-ExtraLightIt": {
    family: "var(--g-aileron)",
    weight: "",
    style: "italic",
  },
  "NYTCheltenham-ExtraLightItal": {
    family: "var(--g-aileron)",
    weight: "",
    style: "italic",
  },
  "NYTCheltenham-LightItalic": {
    family: "var(--g-aileron)",
    weight: "",
    style: "italic",
  },
  "NYTCheltenham-BookItalic": {
    family: "var(--g-aileron)",
    weight: "",
    style: "italic",
  },
  "NYTCheltenham-WideItalic": {
    family: "var(--g-aileron)",
    weight: "",
    style: "italic",
  },
  "NYTCheltenham-MediumItalic": {
    family: "var(--g-aileron)",
    weight: "",
    style: "italic",
  },
  "NYTCheltenham-BoldItalic": {
    family: "var(--g-aileron)",
    weight: "700",
    style: "italic",
  },
  "NYTCheltenham-ExtraBoldItal": {
    family: "var(--g-aileron)",
    weight: "bold",
    style: "italic",
  },
  "NYTCheltenham-ExtraBoldItalic": {
    family: "var(--g-aileron)",
    weight: "bold",
    style: "italic",
  },
  "NYTCheltenhamSH-Regular": {
    family: "nyt-cheltenham-sh,nyt-cheltenham,georgia,serif",
    weight: "400",
    style: "",
  },
  "NYTCheltenhamSH-Italic": {
    family: "nyt-cheltenham-sh,nyt-cheltenham,georgia,serif",
    weight: "400",
    style: "italic",
  },
  "NYTCheltenhamSH-Bold": {
    family: "nyt-cheltenham-sh,nyt-cheltenham,georgia,serif",
    weight: "700",
    style: "",
  },
  "NYTCheltenhamSH-BoldItalic": {
    family: "nyt-cheltenham-sh,nyt-cheltenham,georgia,serif",
    weight: "700",
    style: "italic",
  },
  "NYTCheltenhamWide-Regular": {
    family: "var(--g-aileron)",
    weight: "500",
    style: "",
  },
  "NYTCheltenhamWide-Italic": {
    family: "var(--g-aileron)",
    weight: "500",
    style: "italic",
  },
  // Imperial
  "NYTImperial-Regular": {
    family: "var(--g-aileron)",
    weight: "400",
    style: "",
  },
  "NYTImperial-Italic": {
    family: "var(--g-aileron)",
    weight: "400",
    style: "italic",
  },
  "NYTImperial-Semibold": {
    family: "var(--g-aileron)",
    weight: "600",
    style: "",
  },
  "NYTImperial-SemiboldItalic": {
    family: "var(--g-aileron)",
    weight: "600",
    style: "italic",
  },
  "NYTImperial-Bold": { family: "var(--g-aileron)", weight: "700", style: "" },
  "NYTImperial-BoldItalic": {
    family: "var(--g-aileron)",
    weight: "700",
    style: "italic",
  },
  // Others
  "NYTKarnakText-Regular": {
    family: "nyt-karnak-display-130124,georgia,serif",
    weight: "400",
    style: "",
  },
  "NYTKarnakDisplay-Regular": {
    family: "nyt-karnak-display-130124,georgia,serif",
    weight: "400",
    style: "",
  },
  "NYTStymieLight-Regular": {
    family: "nyt-stymie,arial,helvetica,sans-serif",
    weight: "300",
    style: "",
  },
  "NYTStymieMedium-Regular": {
    family: "nyt-stymie,arial,helvetica,sans-serif",
    weight: "500",
    style: "",
  },
  "StymieNYT-Light": {
    family: "nyt-stymie,arial,helvetica,sans-serif",
    weight: "300",
    style: "",
  },
  "StymieNYT-LightPhoenetic": {
    family: "nyt-stymie,arial,helvetica,sans-serif",
    weight: "300",
    style: "",
  },
  "StymieNYT-Lightitalic": {
    family: "nyt-stymie,arial,helvetica,sans-serif",
    weight: "300",
    style: "italic",
  },
  "StymieNYT-Medium": {
    family: "nyt-stymie,arial,helvetica,sans-serif",
    weight: "500",
    style: "",
  },
  "StymieNYT-MediumItalic": {
    family: "nyt-stymie,arial,helvetica,sans-serif",
    weight: "500",
    style: "italic",
  },
  "StymieNYT-Bold": {
    family: "nyt-stymie,arial,helvetica,sans-serif",
    weight: "700",
    style: "",
  },
  "StymieNYT-BoldItalic": {
    family: "nyt-stymie,arial,helvetica,sans-serif",
    weight: "700",
    style: "italic",
  },
  "StymieNYT-ExtraBold": {
    family: "nyt-stymie,arial,helvetica,sans-serif",
    weight: "700",
    style: "",
  },
  "StymieNYT-ExtraBoldText": {
    family: "nyt-stymie,arial,helvetica,sans-serif",
    weight: "700",
    style: "",
  },
  "StymieNYT-ExtraBoldTextItal": {
    family: "nyt-stymie,arial,helvetica,sans-serif",
    weight: "700",
    style: "italic",
  },
  "StymieNYTBlack-Regular": {
    family: "nyt-stymie,arial,helvetica,sans-serif",
    weight: "700",
    style: "",
  },
  "StymieBT-ExtraBold": {
    family: "nyt-stymie,arial,helvetica,sans-serif",
    weight: "700",
    style: "",
  },
  "Stymie-Thin": {
    family: "nyt-stymie,arial,helvetica,sans-serif",
    weight: "300",
    style: "",
  },
  "Stymie-UltraLight": {
    family: "nyt-stymie,arial,helvetica,sans-serif",
    weight: "300",
    style: "",
  },
  "NYTMagSans-Regular": {
    family: "'nyt-magsans',arial,helvetica,sans-serif",
    weight: "500",
    style: "",
  },
  "NYTMagSans-Bold": {
    family: "'nyt-magsans',arial,helvetica,sans-serif",
    weight: "700",
    style: "",
  },
};

"object" != typeof JSON && (JSON = {}),
  (function () {
    "use strict";
    var rx_one = /^[\],:{}\s]*$/,
      rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
      rx_three =
        /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
      rx_four = /(?:^|:|,)(?:\s*\[)+/g,
      rx_escapable =
        /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      rx_dangerous =
        /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta,
      rep,
      seen;
    function f(t) {
      return t < 10 ? "0" + t : t;
    }
    function this_value() {
      return this.valueOf();
    }
    function quote(t) {
      return (
        (rx_escapable.lastIndex = 0),
        rx_escapable.test(t)
          ? '"' +
            t.replace(rx_escapable, function (t) {
              var e = meta[t];
              return "string" == typeof e
                ? e
                : "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4);
            }) +
            '"'
          : '"' + t + '"'
      );
    }
    function includes(t, e) {
      var r;
      for (r = 0; r < t.length; r += 1) if (e === t[r]) return !0;
      return !1;
    }
    function str(t, e) {
      var r,
        n,
        o,
        u,
        f,
        i = gap,
        a = e[t];
      switch (
        (a &&
          "object" == typeof a &&
          "function" == typeof a.toJSON &&
          (a = a.toJSON(t)),
        "function" == typeof rep && (a = rep.call(e, t, a)),
        typeof a)
      ) {
        case "string":
          return quote(a);
        case "number":
          return isFinite(a) ? String(a) : "null";
        case "boolean":
        case "null":
          return String(a);
        case "object":
          if (!a) return "null";
          if (includes(seen, a))
            throw new TypeError("Converting circular structure to JSON");
          if (
            (seen.push(a),
            (gap += indent),
            (f = []),
            "[object Array]" === Object.prototype.toString.apply(a))
          ) {
            for (u = a.length, r = 0; r < u; r += 1) f[r] = str(r, a) || "null";
            return (
              (o =
                0 === f.length
                  ? "[]"
                  : gap
                    ? "[\n" + gap + f.join(",\n" + gap) + "\n" + i + "]"
                    : "[" + f.join(",") + "]"),
              (gap = i),
              o
            );
          }
          if (rep && "object" == typeof rep)
            for (u = rep.length, r = 0; r < u; r += 1)
              "string" == typeof rep[r] &&
                (o = str((n = rep[r]), a)) &&
                f.push(quote(n) + (gap ? ": " : ":") + o);
          else
            for (n in a)
              Object.prototype.hasOwnProperty.call(a, n) &&
                (o = str(n, a)) &&
                f.push(quote(n) + (gap ? ": " : ":") + o);
          return (
            (o =
              0 === f.length
                ? "{}"
                : gap
                  ? "{\n" + gap + f.join(",\n" + gap) + "\n" + i + "}"
                  : "{" + f.join(",") + "}"),
            (gap = i),
            o
          );
      }
    }
    "function" != typeof Date.prototype.toJSON &&
      ((Date.prototype.toJSON = function () {
        return isFinite(this.valueOf())
          ? this.getUTCFullYear() +
              "-" +
              f(this.getUTCMonth() + 1) +
              "-" +
              f(this.getUTCDate()) +
              "T" +
              f(this.getUTCHours()) +
              ":" +
              f(this.getUTCMinutes()) +
              ":" +
              f(this.getUTCSeconds()) +
              "Z"
          : null;
      }),
      (Boolean.prototype.toJSON = this_value),
      (Number.prototype.toJSON = this_value),
      (String.prototype.toJSON = this_value)),
      "function" != typeof JSON.stringify &&
        ((meta = {
          "\b": "\\b",
          "\t": "\\t",
          "\n": "\\n",
          "\f": "\\f",
          "\r": "\\r",
          '"': '\\"',
          "\\": "\\\\",
        }),
        (JSON.stringify = function (t, e, r) {
          var n;
          if (((gap = ""), (indent = ""), "number" == typeof r))
            for (n = 0; n < r; n += 1) indent += " ";
          else "string" == typeof r && (indent = r);
          if (
            ((rep = e),
            e &&
              "function" != typeof e &&
              ("object" != typeof e || "number" != typeof e.length))
          )
            throw new Error("JSON.stringify");
          return (seen = []), str("", { "": t });
        })),
      "function" != typeof JSON.parse &&
        (JSON.parse = function (text, reviver) {
          var j;
          function walk(t, e) {
            var r,
              n,
              o = t[e];
            if (o && "object" == typeof o)
              for (r in o)
                Object.prototype.hasOwnProperty.call(o, r) &&
                  (void 0 !== (n = walk(o, r)) ? (o[r] = n) : delete o[r]);
            return reviver.call(t, e, o);
          }
          if (
            ((text = String(text)),
            (rx_dangerous.lastIndex = 0),
            rx_dangerous.test(text) &&
              (text = text.replace(rx_dangerous, function (t) {
                return (
                  "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4)
                );
              })),
            rx_one.test(
              text
                .replace(rx_two, "@")
                .replace(rx_three, "]")
                .replace(rx_four, ""),
            ))
          )
            return (
              (j = eval("(" + text + ")")),
              "function" == typeof reviver ? walk({ "": j }, "") : j
            );
          throw new SyntaxError("JSON.parse");
        });
  })();

init();
