const VISUALIZERS_MAP = new Map([
  ["straitBar", drawStraitBarVisualizer],
  ["straitLine", drawStraitLineVisualizer],
]);

export function visualize(args) {
  const {
    options,
    canvasCtx,
    canvasWidth,
    canvasHeight,
    bufferLength,
    x,
    barWidth,
    barHeight,
    dataArray,
    numBars,
  } = args;

  let visualizationFunc = VISUALIZERS_MAP.get(options.type);
  if (!visualizationFunc) {
    console.log("Invalid input");
  }

  visualizationFunc(
    canvasCtx,
    canvasWidth,
    canvasHeight,
    bufferLength,
    x,
    barWidth,
    barHeight,
    dataArray,
    numBars
  );
}

function drawStraitBarVisualizer(
  canvasCtx,
  canvasWidth,
  canvasHeight,
  bufferLength,
  x,
  barWidth,
  barHeight,
  dataArray,
  numBars
) {
  let prev = 0;
  const chunkLen = bufferLength / numBars;
  const applyChunking = true;
  for (let i = 0; i < numBars; i++) {
    barHeight = applyChunking
      ? Math.max(...dataArray.slice(prev, prev + chunkLen))
      : dataArray[i];
    prev += chunkLen;
    const red = (i * barHeight) / 10;
    const green = i * 4;
    const blue = barHeight / 2;
    canvasCtx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
    //console.log(`bar w:${barWidth}, bar h:${barHeight}`); //"rgb(" + red + "," + green + "," + blue + ")";
    canvasCtx.fillRect(x, canvasHeight - barHeight, barWidth, barHeight);
    x += barWidth;
  }
}

function drawStraitLineVisualizer(
  canvasCtx,
  canvasWidth,
  canvasHeight,
  bufferLength,
  x,
  barWidth,
  barHeight,
  dataArray,
  numBars
) {
  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = "rgb(0, 0, 0)";
  canvasCtx.beginPath();

  const applyChunking = true;

  let bars = numBars * 2;
  let prev = 0;
  const chunkLen = bufferLength / bars;

  const sliceWidth = (canvasWidth * 1.0) / bars;

  for (let i = 0; i < bars; i++) {
    const v = applyChunking
      ? Math.max(...dataArray.slice(prev, prev + chunkLen)) * 5.0
      : dataArray[i] * 5.0;
    prev += chunkLen;
    const y = canvasHeight / 2 + v;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }
    x += sliceWidth;
  }

  canvasCtx.lineTo(canvasWidth, canvasHeight / 2);
  canvasCtx.stroke();
}

function drawMirroredBarVisualizer(
  canvasCtx,
  canvasWidth,
  canvasHeight,
  bufferLength,
  x,
  barWidth,
  barHeight,
  dataArray
) {
  const halfBarWidth = canvasWidth / 2 / bufferLenght;
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];
    const red = (i * barHeight) / 10;
    const green = i * 4;
    const blue = barHeight / 2;
    canvasCtx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
    canvasCtx.fillRect(
      canvasWidth / 2 - x,
      canvasHeight - barHeight,
      halfBarWidth,
      barHeight
    );
    x += halfBarWidth;
  }
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];
    const red = (i * barHeight) / 10;
    const green = i * 4;
    const blue = barHeight / 2;
    canvasCtx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
    canvasCtx.fillRect(x, canvasHeight - barHeight, halfBarWidth, barHeight);
    x += halfBarWidth;
  }
}

function drawSpiralBarVisualizer(
  canvasCtx,
  canvasWidth,
  canvasHeight,
  bufferLength,
  x,
  barWidth,
  barHeight,
  dataArray
) {
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];
    canvasCtx.save();
    canvasCtx.translate(canvasWidth / 2, canvasHeight / 2);
    canvasCtx.rotate((i * (Math.PI * 2)) / bufferLength);
    const red = (i * barHeight) / 10;
    const green = i * 4;
    const blue = barHeight / 2;
    canvasCtx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
    canvasCtx.fillRect(0, 0, barWidth, barHeight);
    x += barWidth;
    canvasCtx.restore();
  }
}
