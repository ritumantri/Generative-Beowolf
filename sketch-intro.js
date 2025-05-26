// sketch-intro.js
const introSketch = (p) => {
  let font;
  let fontSizeIntro = 300; // Specific font size for intro
  let jagIntro = 0;
  let stopJaggingIntro = false;
  let stopButtonIntro;
  let introCanvas;

  p.preload = function() {
    font = p.loadFont('assets/Helvetica.ttf');
  }

  p.setup = function() {
    const introSection = p.select('#intro-section');
    const introSectionWidth = introSection.elt.offsetWidth;
    const introSectionHeight = introSection.elt.offsetHeight;
    introCanvas = p.createCanvas(introSectionWidth, introSectionHeight);
    introCanvas.parent(introSection);
    introCanvas.style('position', 'absolute');
    introCanvas.style('top', '0');
    introCanvas.style('left', '0');
    introCanvas.style('z-index', '1'); // Ensure it's above the intro section's background

    // Create container for centered controls (matching HTML CSS)
    const controlsContainer = p.createDiv('');
    controlsContainer.parent(introSection);
    controlsContainer.style('position', 'absolute');
    controlsContainer.style('bottom', '0');
    controlsContainer.style('left', '0');
    controlsContainer.style('right', '0');
    controlsContainer.style('display', 'flex');
    controlsContainer.style('flex-direction', 'column');
    controlsContainer.style('gap', '16px');
    controlsContainer.style('padding', '16px 32px');
    controlsContainer.style('background', 'white');
    controlsContainer.style('justify-content', 'center');
    controlsContainer.style('align-items', 'center');
    controlsContainer.style('z-index', '10');
    controlsContainer.style('font-family', 'monospace');

    // Button
    stopButtonIntro = p.createButton('STOP JAGGING');
    stopButtonIntro.parent(controlsContainer);
    stopButtonIntro.style('font-size', '12px');
    stopButtonIntro.style('font-family', 'monospace');
    stopButtonIntro.style('font-weight', 'bold');
    stopButtonIntro.style('border', '2px solid black');
    stopButtonIntro.style('background', 'none');
    stopButtonIntro.style('padding', '4px 8px');
    stopButtonIntro.style('cursor', 'pointer');

    // "Try it Yourself" text
    const tryText = p.createDiv('TRY IT YOURSELF');
    tryText.parent(controlsContainer);
    tryText.style('font-size', '12px');
    tryText.style('font-weight', 'bold');
    tryText.style('font-family', 'monospace');

    // Arrow
    const arrow = p.createDiv('↓');
    arrow.parent(controlsContainer);
    arrow.style('font-size', '20px');
    arrow.style('font-weight', 'bold');
    arrow.style('font-family', 'monospace');

    stopButtonIntro.mousePressed(() => {
      stopJaggingIntro = true;
      jagIntro = 0;
    });
  }

  p.draw = function() {
    p.background(255);

    if (!stopJaggingIntro) {
      jagIntro += 0.005;
    }

    let text = "BEOWOLF";
    let bounds = font.textBounds(text, 0, 0, fontSizeIntro);
    let x = (p.width - bounds.w) / 2;
    let y = bounds.h + 50; // Move text to top with small margin

    drawDistortedTextIntro(text, x, y, jagIntro, fontSizeIntro);
  }

  function drawDistortedTextIntro(text, startX, startY, jagAmount, currentFontSize) {
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let y = startY + i * currentFontSize * 1.2;
      let xCursor = startX;

      for (let char of line) {
        let charWidth = font.textBounds(char, 0, 0, currentFontSize).w;

        if (char !== ' ') {
          let paths = font.textToPoints(char, xCursor, y, currentFontSize, {
            sampleFactor: 0.25,
            simplifyThreshold: 0
          });

          let contours = separateContoursIntro(paths);

          p.beginShape();
          p.noStroke();
          p.fill(0);

          for (let pt of contours.outer) {
            p.vertex(pt.x + p.random(-jagAmount, jagAmount), pt.y + p.random(-jagAmount, jagAmount));
          }

          for (let inner of contours.inner) {
            p.beginContour();
            for (let pt of inner) {
              p.vertex(pt.x + p.random(-jagAmount, jagAmount), pt.y + p.random(-jagAmount, jagAmount));
            }
            p.endContour();
          }

          p.endShape(p.CLOSE);
        }

        xCursor += charWidth + 5;
      }
    }
  }

  function separateContoursIntro(points) {
    let result = { outer: [], inner: [] };
    let currentContour = [];
    let lastPoint = null;

    for (let point of points) {
      if (lastPoint) {
        let distance = p.dist(lastPoint.x, lastPoint.y, point.x, point.y);
        if (distance > fontSizeIntro / 10) {
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

  p.windowResized = function() {
    const introSection = p.select('#intro-section');
    const introSectionWidth = introSection.elt.offsetWidth;
    const introSectionHeight = introSection.elt.offsetHeight;
    p.resizeCanvas(introSectionWidth, introSectionHeight);
    // No need to reposition controls as they're centered with CSS
  }
};

// Create the intro sketch instance
new p5(introSketch);