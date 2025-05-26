let jaggednessSlider, fontSizeSlider, fontUploadButton;
let font;
let defaultFontPath = 'assets/Helvetica.ttf';
let fontSize = 150;
let typedText = "";
let cursorVisible = true;
let cursorBlinkInterval = 500;
let lastCursorBlinkTime;
let focused = false;
let canvasElement;

function preload() {
  try {
    font = loadFont(defaultFontPath);
  } catch (error) {
    console.error("Error loading default font:", error);
  }
}

function setup() {
  const controlsHeight = document.querySelector('.controls-container').offsetHeight;
  const section = document.getElementById('text-section');
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('text-section');
  canvasElement = canvas.elt;

  jaggednessSlider = document.getElementById('jaggednessSlider');
  fontSizeSlider = document.getElementById('fontSizeSlider');
  fontUploadButton = document.getElementById('fontUploadButton');

  jaggednessSlider.addEventListener('input', () => {
    document.getElementById('jaggednessValue').textContent = parseFloat(jaggednessSlider.value).toFixed(1);
  });

  fontSizeSlider.addEventListener('input', () => {
    fontSize = parseInt(fontSizeSlider.value);
    document.getElementById('fontSizeValue').textContent = fontSize;
  });

  fontUploadButton.addEventListener('change', handleFontUpload);

  canvasElement.focus();
  focused = true;
  lastCursorBlinkTime = millis();
  frameRate(30);
}

function draw() {
  clear();
  let jag = parseFloat(jaggednessSlider.value);

  if (font) {
    let lines = wrapTextLines(typedText, width - 100);
    let currentY = 20 + fontSize;
    drawWrappedLines(lines, 50, currentY, jag);

    if (focused) {
      let currentLine = lines[lines.length - 1] || "";
      let cursorX = 60 + getLineWidth(currentLine);
      let cursorY = currentY + (lines.length - 1) * fontSize * 1.2;
      let cursorHeight = fontSize * 0.8;

      if (millis() - lastCursorBlinkTime > cursorBlinkInterval) {
        cursorVisible = !cursorVisible;
        lastCursorBlinkTime = millis();
      }

      if (cursorVisible) {
        stroke(0);
        strokeWeight(2);
        line(cursorX, cursorY - cursorHeight, cursorX, cursorY + cursorHeight / 2);
      }
    }
  }
}

function keyPressed() {
  if (focused) {
    if (keyCode === BACKSPACE) {
      typedText = typedText.slice(0, -1);
    } else if (keyCode === DELETE) {
      typedText = "";
    } else if (keyCode === ENTER || keyCode === RETURN) {
      typedText += "\n";
    } else if (key.length === 1) {
      typedText += key;
    }
    cursorVisible = true;
    lastCursorBlinkTime = millis();
  }
}

function mousePressed() {
  if (canvasElement) {
    canvasElement.focus();
    focused = true;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function handleFontUpload(event) {
  const file = event.target.files[0];
  if (file) {
    document.getElementById('fontFileName').textContent = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      loadFont(reader.result, newFont => {
        font = newFont;
        console.log('Font uploaded and loaded successfully.');
      }, error => {
        console.error('Error loading font:', error);
      });
    };
    reader.readAsDataURL(file);
  }
}

function wrapTextLines(text, maxWidth) {
  let words = text.split(/(\s+)/); // keep spaces
  let lines = [];
  let currentLine = "";

  for (let word of words) {
    let testLine = currentLine + word;
    let lineWidth = getLineWidth(testLine);

    if (lineWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word.trimStart();
    }
  }

  lines.push(currentLine);
  return lines;
}

function getLineWidth(text) {
  let total = 0;
  for (let ch of text) {
    let bounds = font.textBounds(ch, 0, 0, fontSize);
    total += (bounds && bounds.w ? bounds.w : fontSize * 0.3) + 5;
  }
  return total;
}

function drawWrappedLines(lines, x, y, jag) {
  for (let i = 0; i < lines.length; i++) {
    drawTextLine(lines[i], x, y + i * fontSize * 1.2, jag);
  }
}

function drawTextLine(line, x, y, jag) {
  let xCursor = x;
  for (let char of line) {
    let charWidth = font.textBounds(char, 0, 0, fontSize).w;

    if (char !== ' ') {
      let paths = font.textToPoints(char, xCursor, y, fontSize, {
        sampleFactor: 0.25,
        simplifyThreshold: 0
      });

      let contours = separateContours(paths);

      beginShape();
      noStroke();
      fill(0);

      for (let pt of contours.outer) {
        vertex(pt.x + random(-jag, jag), pt.y + random(-jag, jag));
      }

      for (let inner of contours.inner) {
        beginContour();
        for (let pt of inner) {
          vertex(pt.x + random(-jag, jag), pt.y + random(-jag, jag));
        }
        endContour();
      }

      endShape(CLOSE);
    }

    xCursor += charWidth + 5;
  }
}

function separateContours(points) {
  let result = { outer: [], inner: [] };
  let currentContour = [];
  let lastPoint = null;

  for (let point of points) {
    if (lastPoint) {
      let distance = dist(lastPoint.x, lastPoint.y, point.x, point.y);
      if (distance > fontSize / 10) {
        if (currentContour.length > 0) {
          if (result.outer.length === 0) {
            result.outer = currentContour;
          } else {
            result.inner.push(currentContour);
          }
          currentContour = [];
        }
      }
    }

    currentContour.push(point);
    lastPoint = point;
  }

  if (currentContour.length > 0) {
    if (result.outer.length === 0) {
      result.outer = currentContour;
    } else {
      result.inner.push(currentContour);
    }
  }

  return result;
}