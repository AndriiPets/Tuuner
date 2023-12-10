import { fetchFile } from "@ffmpeg/util";
import { base64ToBuffer } from "./bufferConversion";
import { get, set } from "idb-keyval";

const FFMPEG_CORE_VERSION = "0.12.4";
const FFMPEG_KEY = "ffmpeg.wasm";

export async function renderVisualization(args) {
  const {
    visualisationFunc,
    options,
    dataArrayMatrix,
    canvas,
    canvasCtx,
    chunkLength,
    ffmpeg,
    audio,
    setVideo,
    setLoad,
  } = args;

  const load = async () => {
    let buffer = await get(FFMPEG_KEY);
    if (!buffer) {
      console.log(`Loading ffmpeg version ${FFMPEG_CORE_VERSION}`);
      const startTime = Date.now() / 1000;
      const baseURL = `https://unpkg.com/@ffmpeg/core-mt@${FFMPEG_CORE_VERSION}/dist/umd`;

      const core = await fetch(`${baseURL}/ffmpeg-core.js`);
      const wasm = await fetch(`${baseURL}/ffmpeg-core.wasm`);
      const worker = await fetch(`${baseURL}/ffmpeg-core.worker.js`);

      buffer = {
        coreURL: await core.arrayBuffer(),
        wasmURL: await wasm.arrayBuffer(),
        workerURL: await worker.arrayBuffer(),
      };
      set(FFMPEG_KEY, buffer);

      console.log(
        `ffmpeg loaded in ${(Date.now() / 1000 - startTime).toFixed(
          1
        )} seconds.`
      );
    }
    console.log("wasm file loaded");
    const ffmpegLoadObj = {
      coreURL: URL.createObjectURL(
        new Blob([buffer.coreURL], { type: "text/javascript" })
      ),
      wasmURL: URL.createObjectURL(
        new Blob([buffer.wasmURL], { type: "application/wasm" })
      ),
      workerURL: URL.createObjectURL(
        new Blob([buffer.workerURL], { type: "text/javascript" })
      ),
    };

    await ffmpeg.load(ffmpegLoadObj);

    ffmpeg.on("log", ({ message }) => {
      if (message === "Aborted()") {
        console.log(`DANGER:::${message}`);
      }
      console.log(message);
    });
  };

  const loadAudio = async (audio) => {
    await ffmpeg.writeFile(`input.${audio.type}`, await fetchFile(audio.url));
  };

  const prepareFrames = async () => {
    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;

    //drawing frame on the shadow canvas and sending it to be processd by the ffmpeg rendering pipline
    for (let i in dataArrayMatrix) {
      console.log(`frame ${i} incoming`);
      //console.log(dataArrayMatrix[i]);

      let freqencyDataArray = dataArrayMatrix[i];
      let x = 0;

      canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
      canvasCtx.fillStyle = "white";
      canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);
      visualisationFunc({
        options: options,
        canvasCtx: canvasCtx,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight,
        x: x,
        dataArray: freqencyDataArray,
      });

      //sleep(1000 * chunkLength)
      //create url containing base64 encoded PNG
      let frameURL = canvas.toDataURL("image/png");
      //console.log(`frame${i}::${frameURL}`);
      //decode base64 into 8bit binary array
      let frame = base64ToBuffer(frameURL);
      //console.log(frame);
      //save binary PNG in the ffmpeg filesystem
      await ffmpeg.writeFile(`image${i}.png`, frame);
    }
  };

  const render = async () => {
    const startTime = Date.now() / 1000;

    const ffmpegCmd = `-r ${
      1000 / (1000 * chunkLength)
    } -i image%d.png -c:v libx264 -pix_fmt yuv420p -vf scale=600:400 concat.mp4`;
    const ffmpegArgs = ffmpegCmd.split(" ");
    await ffmpeg.exec([...ffmpegArgs]);

    const prepareAudioCmd = `-i input.${audio.type} -b:a 320k audio.mp3`;
    const args = prepareAudioCmd.split(" ");
    await ffmpeg.exec([...args]);

    const ffmpegAudioCmd =
      "-i concat.mp4 -i audio.mp3 -map 0:v -map 1:a -c:v copy -c:a copy -shortest output.mp4";
    const ffmpegAudioArgs = ffmpegAudioCmd.split(" ");
    await ffmpeg.exec([...ffmpegAudioArgs]);

    const data = await ffmpeg.readFile("output.mp4");
    console.log(data.buffer);
    const videoSrc = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/mp4" })
    );

    console.log(
      `Render took ${(Date.now() / 1000 - startTime).toFixed(1)} seconds.`
    );
    console.log(videoSrc);
    setVideo(videoSrc);
  };

  const init = async () => {
    await load();
    await prepareFrames();
    await loadAudio(audio);
    await render();
    setLoad(false);
  };

  await init();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
