export const getFFTs = (features) => {
  const minDecibels = -100;
  const maxDecibels = -30;
  const smoothingTimeConstant = 0.8;
  const smoothingArrayInByte = [];
  const previousSmooth = new Float32Array(features.length);
  for (let i = 0; i < features.length; i++) {
    const v0 = features[i];

    // smooth over data
    // https://webaudio.github.io/web-audio-api/#fft-windowing-and-smoothing-over-time
    previousSmooth[i] =
      smoothingTimeConstant * previousSmooth[i] +
      (1 - smoothingTimeConstant) * v0;

    // convert to dB
    // https://webaudio.github.io/web-audio-api/#conversion-to-db
    const v1 = 20 * Math.log10(previousSmooth[i]);
    //console.log(v1);

    // convert to byte
    // https://webaudio.github.io/web-audio-api/#AnalyserNode-methods
    const byte =
      (255 / (maxDecibels - minDecibels)) *
      ((Number.isFinite(v1) ? v1 : 0) - minDecibels);

    smoothingArrayInByte[i] = byte;
  }
  return smoothingArrayInByte;
};
