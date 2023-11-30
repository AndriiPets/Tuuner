import Meyda from "meyda";
import { fetchData } from "./fetchData";
import { getFFTs } from "./getFFTs";

export async function loadRenderFrames(url, audioContext) {
  let audioBuffer = await fetchData(url, audioContext);
  let monoChannel = audioBuffer.getChannelData(0);
  let bufferSize = 2048; //2048
  Meyda.bufferSize = bufferSize;
  Meyda.windowingFunction = "blackman";

  let numChunks = Math.floor(monoChannel.length / bufferSize);
  let lengthPerChunk = monoChannel.length / audioBuffer.sampleRate / numChunks; //in secs
  console.log(lengthPerChunk * 1000);

  //get float32array frequency data from meyda
  let data_chunks = [];
  for (let i = 0; i < numChunks; i++) {
    let chunk = monoChannel.slice(i * bufferSize, (i + 1) * bufferSize);
    let result = Meyda.extract("amplitudeSpectrum", chunk);

    //ffts fill spectrum buffers
    let ffts = getFFTs(result);
    console.log(result);
    data_chunks.push(result);
  }
  //console.log(data_chunks);
  return {
    data_chunks: data_chunks,
    lengthPerChunk: lengthPerChunk,
    numChunks: numChunks,
  };
}
