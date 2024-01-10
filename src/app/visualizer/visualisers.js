const VISUALIZERS_MAP = new Map([
  ["circle", drawSpiralBarVisualizer],
  ["line", drawStraitLineVisualizer],
]);

export function visualize(args) {
  const { options, canvasCtx, canvasWidth, canvasHeight, x, dataArray } = args;

  for (const visName in options) {
    const visOptions = options[visName];
    let visualizationFunc = VISUALIZERS_MAP.get(visOptions.type);
    if (!visualizationFunc) {
      console.log("Invalid input");
    }

    visualizationFunc(
      canvasCtx,
      canvasWidth,
      canvasHeight,
      x,
      dataArray,
      visOptions
    );
  }
}

function drawStraitBarVisualizer(
  canvasCtx,
  canvasWidth,
  canvasHeight,
  x,
  dataArray,
  options
) {
  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = "#FFFFFF";
  canvasCtx.beginPath();

  let prev = 0;
  const bars = options?.numBars * 2;

  const bufferLength = dataArray.length;
  const barWidth = (canvasWidth * 1.0) / bars;
  const chunkLen = bufferLength / bars;
  let barHeight;

  const applyChunking = true;
  for (let i = 0; i < bars; i++) {
    barHeight = applyChunking
      ? Math.max(...dataArray.slice(prev, prev + chunkLen)) * 5.0
      : dataArray[i];
    prev += chunkLen;
    const red = (i * barHeight) / 10;
    const green = i * 4;
    const blue = barHeight / 2;
    canvasCtx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
    //console.log(`bar w:${barWidth}, bar h:${barHeight}`); //"rgb(" + red + "," + green + "," + blue + ")";
    //if (i === 0) {
    //  canvasCtx.moveTo(x, canvasHeight / 2 - barHeight);
    //} else {
    //  canvasCtx.lineTo(x, canvasHeight / 2 - barHeight);
    //}
    canvasCtx.fillRect(
      x,
      canvasHeight - barHeight,
      barWidth - 2,
      barHeight + 2
    );
    x += barWidth;
  }

  canvasCtx.lineTo(canvasWidth, canvasHeight / 2);
  //canvasCtx.stroke();
}

function drawStraitLineVisualizer(
  canvasCtx,
  canvasWidth,
  canvasHeight,
  x,
  dataArray,
  options
) {
  const color = options?.color;
  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = color;
  canvasCtx.beginPath();

  const applyChunking = true;

  let bars = options?.numBars * 2;
  let prev = 0;
  const bufferLength = dataArray.length;
  const chunkLen = bufferLength / bars;

  const sliceWidth = (canvasWidth * 1.0) / bars;

  for (let i = 0; i < bars; i++) {
    const v = applyChunking
      ? Math.max(...dataArray.slice(prev, prev + chunkLen)) * 5.0
      : dataArray[i] * 5.0;
    prev += chunkLen;
    const y = canvasHeight / 2 - v;

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
  x,
  barWidth,
  barHeight,
  dataArray
) {
  const bufferLength = dataArray.length;
  const halfBarWidth = canvasWidth / 2 / bufferLength;
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

function drawCircleLineVisiualizer(
  ctx,
  canvasWidth,
  canvasHeight,
  x,
  dataArray,
  numBars
) {
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgb(0, 0, 0)";
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.beginPath();

  let radius = 127;
  let cX = canvasWidth / 2;
  let cY = canvasHeight / 2;
  const twoPI = Math.PI * 2;

  let bars = numBars * 2;
  let prev = 0;
  const bufferLength = dataArray.length;
  const chunkLen = bufferLength / bars;
  const barWidth = (canvasWidth * 1.0) / bars;

  let radianAdd = twoPI / bars;
  let radian = 0;

  for (let i = 0; i < bars; i++) {
    let v = Math.max(...dataArray.slice(prev, prev + chunkLen)) * 5.0;
    prev += chunkLen;
    if (v < radius) {
      v = radius;
    }
    let x = v * Math.cos(radian) + cX;
    let y = v * Math.sin(radian) + cY;
    //if (i === 0) {
    //  ctx.moveTo(x, y);
    //} else {
    //  ctx.lineTo(x, y);
    //}
    ctx.fillRect(x, y, barWidth, v);
    radian += radianAdd;
  }
  //ctx.arc(canvasWidth / 2, canvasHeight / 2, radius, 0, twoPI);
  ctx.stroke();
}

function drawSpiralBarVisualizer(
  canvasCtx,
  canvasWidth,
  canvasHeight,
  x,
  dataArray,
  options
) {
  const radius = options?.radius;
  const color = options?.color;
  const bars = options?.numBars;
  const bufferLength = dataArray.length;
  const chunkLen = bufferLength / bars;
  const barWidth = (canvasWidth * 1.0) / bars;
  const twoPI = Math.PI * 2;

  let prev = 0;
  let barHeight;

  for (let i = bars; i > 0; i--) {
    //half a circle visualization
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 0)";
    canvasCtx.fillStyle = "rgb(0, 0, 0)";

    barHeight = Math.max(...dataArray.slice(prev, prev + chunkLen)) * 5.0;
    prev += chunkLen;
    canvasCtx.save();
    canvasCtx.translate(canvasWidth / 2, canvasHeight / 2);
    canvasCtx.beginPath();
    //canvasCtx.moveTo(0, radius + barHeight);

    canvasCtx.rotate((i * Math.PI) / bars);

    canvasCtx.fillStyle = color;
    canvasCtx.fillRect(0, radius, barWidth - 8, barHeight + 2);

    //canvasCtx.lineTo(0, radius + barHeight);
    //canvasCtx.arc(0, radius + barHeight, 2, 0, twoPI);
    //canvasCtx.fill();

    //canvasCtx.stroke();
    canvasCtx.restore();

    //other half
    canvasCtx.save();
    canvasCtx.translate(canvasWidth / 2, canvasHeight / 2);
    canvasCtx.rotate(((i * Math.PI) / bars) * -1);
    canvasCtx.fillStyle = color;
    canvasCtx.fillRect(0, radius, barWidth - 8, barHeight + 2);
    canvasCtx.restore();
  }
}
