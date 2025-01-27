// TODO: exclude elements outside artboard bounds

var doc = app.activeDocument,
  layerName = doc.layers,
  coordOffset = [0, 0],
  json = {};

json.stage = {};
json.ways = { mobile: null, desktop: null };
json.symbols = [];
json.zooms = { mobile: [], desktop: [] };
json.texts = [];

function hasValue(key) {
  return typeof key !== "undefined" && typeof key !== undefined && key !== null;
}

function init() {
  getArtboardParams();
  findObjects();
  writeFile();
}

function findObjects() {
  for (var i = 0; i < layerName.length; i++) {
    var currentLayer = layerName[i];

    if (currentLayer.name == "ways") {
      for (var p = 0; p < currentLayer.pathItems.length; p++) {
        if (hasValue(currentLayer.pathItems[p].pathPoints)) {
          var pathLen = currentLayer.pathItems[p].pathPoints.length,
            pathStr = "";

          for (var j = 0; j < pathLen; j++) {
            var currAnchor = currentLayer.pathItems[p].pathPoints[j].anchor;

            if (j) {
              var prevRight =
                  currentLayer.pathItems[p].pathPoints[j - 1].rightDirection,
                currLeft =
                  currentLayer.pathItems[p].pathPoints[j].leftDirection;

              pathStr +=
                " C " +
                (prevRight[0] + coordOffset[0]) +
                " " +
                (-prevRight[1] + coordOffset[0]) +
                ", " +
                (currLeft[0] + coordOffset[0]) +
                " " +
                (-currLeft[1] + coordOffset[0]) +
                ", " +
                (currAnchor[0] + coordOffset[0]) +
                " " +
                (-currAnchor[1] + coordOffset[0]);
            } else {
              pathStr +=
                "M " +
                (currAnchor[0] + coordOffset[0]) +
                " " +
                (-currAnchor[1] + coordOffset[0]);
            }
          }

          if (currentLayer.pathItems[p].name == "desktop")
            json.ways.desktop = pathStr;
          else if (currentLayer.pathItems[p].name == "mobile")
            json.ways.mobile = pathStr;

          // json.ways.push ({ name: currentLayer.pathItems[p].name, way: pathStr });
        }
      }
    }

    if (currentLayer.name == "zooms") {
      for (var p = 0; p < currentLayer.pathItems.length; p++) {
        if (
          (currentLayer.pathItems[p].name == "desktop" ||
            currentLayer.pathItems[p].name == "mobile") &&
          currentLayer.pathItems[p].closed
        ) {
          var bounds = currentLayer.pathItems[p].geometricBounds,
            top = bounds[1],
            right = bounds[2],
            left = bounds[0],
            bottom = bounds[3],
            width = right - left,
            height = -bottom - -top,
            center = [left + width / 2, -top + height / 2];

          if (currentLayer.pathItems[p].name == "desktop")
            json.zooms.desktop.push({
              center: center,
              width: width,
              height: height,
            });
          else
            json.zooms.mobile.push({
              center: center,
              width: width,
              height: height,
            });
        }
      }
    }

    if (currentLayer.name == "symbols") {
      for (var p = 0; p < currentLayer.placedItems.length; p++) {
        var centerX =
            currentLayer.placedItems[p].geometricBounds[0] +
            (currentLayer.placedItems[p].geometricBounds[2] -
              currentLayer.placedItems[p].geometricBounds[0]) /
              2,
          centerY =
            currentLayer.placedItems[p].geometricBounds[1] +
            (currentLayer.placedItems[p].geometricBounds[3] -
              currentLayer.placedItems[p].geometricBounds[1]) /
              2,
          width =
            (currentLayer.placedItems[p].boundingBox[0] -
              currentLayer.placedItems[p].boundingBox[2]) *
            currentLayer.placedItems[p].matrix.mValueD,
          height =
            (currentLayer.placedItems[p].boundingBox[3] -
              currentLayer.placedItems[p].boundingBox[1]) *
            currentLayer.placedItems[p].matrix.mValueD,
          tags = hasValue(currentLayer.placedItems[p].tags),
          rotated = false, //tags ? hasValue (currentLayer.placedItems[p].tags["BBAccumRotation"]) : false,
          rotation = rotated
            ? parseFloat(
                currentLayer.placedItems[p].tags["BBAccumRotation"].value,
              ) * -100.0
            : 0,
          splitStr = currentLayer.placedItems[p].name.split("|"),
          id =
            splitStr.length > 1
              ? splitStr[0]
              : currentLayer.placedItems[p].name,
          name =
            splitStr.length > 1
              ? splitStr[1]
              : currentLayer.placedItems[p].name,
          symbol = {
            center: [centerX, -centerY],
            width: width,
            height: height,
            rotation: rotation,
            id: id,
            name: name,
          };

        json.symbols.push(symbol);
      }
    }

    if (currentLayer.name == "text") {
      for (var p = 0; p < currentLayer.textFrames.length; p++) {
        var justRight = Justification.RIGHT,
          justLeft = Justification.LEFT,
          justCenter = Justification.CENTER;

        var top = currentLayer.textFrames[p].top,
          left = currentLayer.textFrames[p].left,
          width = currentLayer.textFrames[p].width,
          height = currentLayer.textFrames[p].height,
          note = currentLayer.textFrames[p].note,
          valign =
            note.indexOf("valign") !== -1 && note.indexOf("middle") !== -1
              ? "center"
              : note.indexOf("valign") !== -1 && note.indexOf("bottom") !== -1
                ? "flex-end"
                : "flex-start",
          just = currentLayer.textFrames[p].textRange.justification + "", // Justification.RIGHT, Justification.LEFT, Justification.CENTER
          halign = "left", //currentLayer.textFrames[p].textRange.justification == justRight ? "right" : currentLayer.textFrames[p].textRange.justification == justCenter ? "center" : "left",
          capitalization = currentLayer.textFrames[p].textRange.capitalization, // FontCapsOption.NORMALCAPS, FontCapsOption.ALLCAPS
          caps = capitalization == FontCapsOption.ALLCAPS,
          marginTop = 0,
          marginLeft = 0,
          text = { globals: {}, attrs: {}, blocks: [] },
          charLen = currentLayer.textFrames[p].textRange.characters.length,
          currStr = "",
          initialAttrs = {},
          currAttrs = {},
          diffs = {};

        if (
          currentLayer.textFrames[p].textRange.justification ==
          Justification.RIGHT
        )
          halign = "right";
        else if (
          currentLayer.textFrames[p].textRange.justification ==
          Justification.CENTER
        )
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

        text.globals.id = currentLayer.textFrames[p].name;
        text.globals.top = (-top / json.stage.height) * 100 + "%";
        text.globals.left = (left / json.stage.width) * 100 + "%";
        text.globals.width = width + "px";
        text.globals.height = height + "px";
        text.globals.marginTop = marginTop + "px";
        text.globals.marginLeft = marginLeft + "px";

        text.globals["alignItems"] = valign;
        text.globals["textAlign"] = halign;

        for (var i = 0; i < charLen; i++) {
          var currChar = currentLayer.textFrames[p].textRange.characters[i];

          if (i == 0) {
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
        json.texts.push(text);
      }
    }
  }
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

function fillCharacterAttributes(currChar) {
  var attrs = currChar.characterAttributes,
    red = currChar.characterAttributes.fillColor.red,
    green = currChar.characterAttributes.fillColor.green,
    blue = currChar.characterAttributes.fillColor.blue,
    caps =
      currChar.characterAttributes.capitalization == FontCapsOption.ALLCAPS,
    attrObj = {
      font: attrs.textFont.name,
      size: attrs.size,
      leading: attrs.leading,
      tracking: attrs.tracking,
      caps: caps,
      red: red,
      green: green,
      blue: blue,
      underline: attrs.underline,
      strikeThrough: attrs.strikeThrough,
    };
  return attrObj;
}

function checkCharacterAttributes(currChar, attrs) {
  var match = true,
    diffs = {};

  currChar.characterAttributes.font =
    currChar.characterAttributes.textFont.name;
  currChar.characterAttributes.caps =
    currChar.characterAttributes.capitalization == FontCapsOption.ALLCAPS;
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
        case "underline":
          returnObj.textDecoration = attrs["underline"] ? "underline" : "none";
          break;
        case "strikeThrough":
          returnObj.textDecoration = attrs["strikeThrough"]
            ? "line-through"
            : "none";
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

function getArtboardParams() {
  var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()],
    bounds = artboard.artboardRect,
    left = bounds[0],
    top = bounds[1],
    right = bounds[2],
    bottom = bounds[3],
    width = right - left,
    height = top - bottom;

  coordOffset = [-left, -top];

  json.stage.width = width;
  json.stage.height = height;
}

function writeFile() {
  var outFile = new File("untitled.json").saveDlg(
    ["Save a JSON attribute file."],
    ["JSON Files:*.json"],
  );
  // var outFile = new File ("/Users/jeremy/projects/preview/2023-02-01-wayfinder/public/_assets/short-track.json");
  var parentFolder = outFile.parent;

  outFile = outFile instanceof File ? outFile : new File(outFile);
  outFile.encoding = "utf-8";

  if (!parentFolder.exists && !parentFolder.create())
    throw new Error("Cannot create file in path " + outFile.fsName);

  outFile.open("w");
  var stringify = JSON.stringify(json); // json, null, 2

  outFile.write(stringify);
  outFile.close();

  alert("JSON successfully written");
}

var fonts = {
  // Franklin
  "NYTFranklin-Light": {
    family: "nyt-franklin,arial,helvetica,sans-serif",
    weight: "300",
    style: "",
    vshift: "8%",
  },
  "NYTFranklin-Medium": {
    family: "nyt-franklin,arial,helvetica,sans-serif",
    weight: "500",
    style: "",
    vshift: "8%",
  },
  "NYTFranklin-SemiBold": {
    family: "nyt-franklin,arial,helvetica,sans-serif",
    weight: "600",
    style: "",
    vshift: "8%",
  },
  "NYTFranklin-Semibold": {
    family: "nyt-franklin,arial,helvetica,sans-serif",
    weight: "600",
    style: "",
    vshift: "8%",
  },
  "NYTFranklinSemiBold-Regular": {
    family: "nyt-franklin,arial,helvetica,sans-serif",
    weight: "600",
    style: "",
    vshift: "8%",
  },
  "NYTFranklin-SemiboldItalic": {
    family: "nyt-franklin,arial,helvetica,sans-serif",
    weight: "600",
    style: "italic",
    vshift: "8%",
  },
  "NYTFranklin-Bold": {
    family: "nyt-franklin,arial,helvetica,sans-serif",
    weight: "700",
    style: "",
    vshift: "8%",
  },
  "NYTFranklin-LightItalic": {
    family: "nyt-franklin,arial,helvetica,sans-serif",
    weight: "300",
    style: "italic",
    vshift: "8%",
  },
  "NYTFranklin-MediumItalic": {
    family: "nyt-franklin,arial,helvetica,sans-serif",
    weight: "500",
    style: "italic",
    vshift: "8%",
  },
  "NYTFranklin-BoldItalic": {
    family: "nyt-franklin,arial,helvetica,sans-serif",
    weight: "700",
    style: "italic",
    vshift: "8%",
  },
  "NYTFranklin-ExtraBold": {
    family: "nyt-franklin,arial,helvetica,sans-serif",
    weight: "800",
    style: "",
    vshift: "8%",
  },
  "NYTFranklin-ExtraBoldItalic": {
    family: "nyt-franklin,arial,helvetica,sans-serif",
    weight: "800",
    style: "italic",
    vshift: "8%",
  },
  "NYTFranklin-Headline": {
    family: "nyt-franklin,arial,helvetica,sans-serif",
    weight: "bold",
    style: "",
    vshift: "8%",
  },
  "NYTFranklin-HeadlineItalic": {
    family: "nyt-franklin,arial,helvetica,sans-serif",
    weight: "bold",
    style: "italic",
    vshift: "8%",
  },
  // Chelt
  "NYTCheltenham-ExtraLight": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "200",
    style: "",
  },
  "NYTCheltenhamExtLt-Regular": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "200",
    style: "",
  },
  "NYTCheltenham-Light": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "300",
    style: "",
  },
  "NYTCheltenhamLt-Regular": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "300",
    style: "",
  },
  "NYTCheltenham-LightSC": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "300",
    style: "",
  },
  "NYTCheltenham-Book": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "400",
    style: "",
  },
  "NYTCheltenhamBook-Regular": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "400",
    style: "",
  },
  "NYTCheltenham-Wide": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "",
    style: "",
  },
  "NYTCheltenhamMedium-Regular": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "500",
    style: "",
  },
  "NYTCheltenham-Medium": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "500",
    style: "",
  },
  "NYTCheltenham-Bold": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "700",
    style: "",
  },
  "NYTCheltenham-BoldCond": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "bold",
    style: "",
  },
  "NYTCheltenhamCond-BoldXC": {
    family: "nyt-cheltenham-extra-cn-bd,georgia,serif",
    weight: "bold",
    style: "",
  },
  "NYTCheltenham-BoldExtraCond": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "bold",
    style: "",
  },
  "NYTCheltenham-ExtraBold": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "bold",
    style: "",
  },
  "NYTCheltenham-ExtraLightIt": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "",
    style: "italic",
  },
  "NYTCheltenham-ExtraLightItal": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "",
    style: "italic",
  },
  "NYTCheltenham-LightItalic": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "",
    style: "italic",
  },
  "NYTCheltenham-BookItalic": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "",
    style: "italic",
  },
  "NYTCheltenham-WideItalic": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "",
    style: "italic",
  },
  "NYTCheltenham-MediumItalic": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "",
    style: "italic",
  },
  "NYTCheltenham-BoldItalic": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "700",
    style: "italic",
  },
  "NYTCheltenham-ExtraBoldItal": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "bold",
    style: "italic",
  },
  "NYTCheltenham-ExtraBoldItalic": {
    family: "nyt-cheltenham,georgia,serif",
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
    family: "nyt-cheltenham,georgia,serif",
    weight: "500",
    style: "",
  },
  "NYTCheltenhamWide-Italic": {
    family: "nyt-cheltenham,georgia,serif",
    weight: "500",
    style: "italic",
  },
  // Imperial
  "NYTImperial-Regular": {
    family: "nyt-imperial,georgia,serif",
    weight: "400",
    style: "",
  },
  "NYTImperial-Italic": {
    family: "nyt-imperial,georgia,serif",
    weight: "400",
    style: "italic",
  },
  "NYTImperial-Semibold": {
    family: "nyt-imperial,georgia,serif",
    weight: "600",
    style: "",
  },
  "NYTImperial-SemiboldItalic": {
    family: "nyt-imperial,georgia,serif",
    weight: "600",
    style: "italic",
  },
  "NYTImperial-Bold": {
    family: "nyt-imperial,georgia,serif",
    weight: "700",
    style: "",
  },
  "NYTImperial-BoldItalic": {
    family: "nyt-imperial,georgia,serif",
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

// prettier-ignore
"object"!=typeof JSON&&(JSON={}),function(){"use strict";var rx_one=/^[\],:{}\s]*$/,rx_two=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,rx_three=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,rx_four=/(?:^|:|,)(?:\s*\[)+/g,rx_escapable=/[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,rx_dangerous=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta,rep,seen;function f(t){return t<10?"0"+t:t}function this_value(){return this.valueOf()}function quote(t){return rx_escapable.lastIndex=0,rx_escapable.test(t)?'"'+t.replace(rx_escapable,(function(t){var e=meta[t];return"string"==typeof e?e:"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)}))+'"':'"'+t+'"'}function includes(t,e){var r;for(r=0;r<t.length;r+=1)if(e===t[r])return!0;return!1}function str(t,e){var r,n,o,u,f,i=gap,a=e[t];switch(a&&"object"==typeof a&&"function"==typeof a.toJSON&&(a=a.toJSON(t)),"function"==typeof rep&&(a=rep.call(e,t,a)),typeof a){case"string":return quote(a);case"number":return isFinite(a)?String(a):"null";case"boolean":case"null":return String(a);case"object":if(!a)return"null";if(includes(seen,a))throw new TypeError("Converting circular structure to JSON");if(seen.push(a),gap+=indent,f=[],"[object Array]"===Object.prototype.toString.apply(a)){for(u=a.length,r=0;r<u;r+=1)f[r]=str(r,a)||"null";return o=0===f.length?"[]":gap?"[\n"+gap+f.join(",\n"+gap)+"\n"+i+"]":"["+f.join(",")+"]",gap=i,o}if(rep&&"object"==typeof rep)for(u=rep.length,r=0;r<u;r+=1)"string"==typeof rep[r]&&(o=str(n=rep[r],a))&&f.push(quote(n)+(gap?": ":":")+o);else for(n in a)Object.prototype.hasOwnProperty.call(a,n)&&(o=str(n,a))&&f.push(quote(n)+(gap?": ":":")+o);return o=0===f.length?"{}":gap?"{\n"+gap+f.join(",\n"+gap)+"\n"+i+"}":"{"+f.join(",")+"}",gap=i,o}}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},Boolean.prototype.toJSON=this_value,Number.prototype.toJSON=this_value,String.prototype.toJSON=this_value),"function"!=typeof JSON.stringify&&(meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},JSON.stringify=function(t,e,r){var n;if(gap="",indent="","number"==typeof r)for(n=0;n<r;n+=1)indent+=" ";else"string"==typeof r&&(indent=r);if(rep=e,e&&"function"!=typeof e&&("object"!=typeof e||"number"!=typeof e.length))throw new Error("JSON.stringify");return seen=[],str("",{"":t})}),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){var j;function walk(t,e){var r,n,o=t[e];if(o&&"object"==typeof o)for(r in o)Object.prototype.hasOwnProperty.call(o,r)&&(void 0!==(n=walk(o,r))?o[r]=n:delete o[r]);return reviver.call(t,e,o)}if(text=String(text),rx_dangerous.lastIndex=0,rx_dangerous.test(text)&&(text=text.replace(rx_dangerous,(function(t){return"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)}))),rx_one.test(text.replace(rx_two,"@").replace(rx_three,"]").replace(rx_four,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}();

init();
