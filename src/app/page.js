"use client";
import Image from "next/image";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { useState, useEffect, useRef } from "react";
import { visualize } from "./utils/visualisers";
import { renderVisualization } from "./utils/renderVisualization";
import { loadRenderFrames } from "./utils/loadRenderingFrames";

//ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const VISUALIZER = visualize;
const NUM_BARS = 60;
const FPS = 60;

export default function Home() {
  const renderingCanvas = useRef();
  const previewCanvas = useRef();
  const canvasFrame = useRef();
  const audio = useRef();
  const isInitialAudioMount = useRef(0);
  const videoRef = useRef();
  const [video, setVideo] = useState("");
  const [file, setfile] = useState("");
  const featuresRef = useRef([]);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(580);
  const [audioSource, setAudioSource] = useState(null);
  const [load, setLoad] = useState(false);

  const ffmpegRef = useRef(new FFmpeg());
  const ffmpeg = ffmpegRef.current;

  //visualizer options
  const visualizerOptions = useRef({
    type: "straitLine",
    background: "none",
  });

  //Monitors window size and resizes canvas accordingly
  useEffect(() => {
    const handleWindowResize = () => {
      //setHeight(canvasFrame.current.clientHeight);
      setWidth(canvasFrame.current.clientWidth);
    };
    handleWindowResize();

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  //send visualization to the rendering pipeline
  async function startVideoRendering(file) {
    if (!load) {
      setLoad(true);
      const url = URL.createObjectURL(file);
      const audioType = file.name.split(".")[1];
      const audioContext = new AudioContext();

      async function startRenderingPipeline() {
        const rendering_data = await loadRenderFrames(url, audioContext);

        const canvasCtx = renderingCanvas.current.getContext("2d", {
          willReadFrequently: true,
        });
        await renderVisualization({
          visualisationFunc: VISUALIZER,
          options: visualizerOptions.current,
          dataArrayMatrix: rendering_data.data_chunks,
          canvas: renderingCanvas.current,
          canvasCtx: canvasCtx,
          numOfBars: NUM_BARS,
          chunkLength: rendering_data.lengthPerChunk,
          ffmpeg: ffmpeg,
          audio: { url: url, type: audioType },
          setVideo: setVideo,
          setLoad: setLoad,
        });
      }

      startRenderingPipeline();
    }
  }

  //prevew visualization displayed with real-time data
  useEffect(() => {
    console.log(file);
    //initial check to skip component mount, react mounts components twice for some reason
    if (isInitialAudioMount.current > 1) {
      const audioContext = new AudioContext();

      if (!audioSource) {
        const source = audioContext.createMediaElementSource(audio.current);
        setAudioSource(source);
        console.log(audioSource);
        source.connect(audioContext.destination);

        const canvasCtx = previewCanvas.current.getContext("2d", {
          willReadFrequently: true,
        });

        function animate() {
          let x = 0;
          let data = featuresRef.current.amplitudeSpectrum;
          const barWidth = previewCanvas.current.width / NUM_BARS;

          if (data) {
            const bufferLength = data.length;
            let barHeight;
            canvasCtx.clearRect(
              0,
              0,
              previewCanvas.current.width,
              previewCanvas.current.height
            );

            VISUALIZER({
              options: visualizerOptions.current,
              canvasCtx: canvasCtx,
              canvasWidth: previewCanvas.current.width,
              canvasHeight: previewCanvas.current.height,
              bufferLength: bufferLength,
              x: x,
              barWidth: barWidth,
              barHeight: barHeight,
              dataArray: data,
              numBars: NUM_BARS,
            });
          }
          setTimeout(() => {
            requestAnimationFrame(animate);
          }, 1000 / FPS);
        }
        animate();

        const analyzer = Meyda.createMeydaAnalyzer({
          audioContext: audioContext,
          source: source,
          bufferSize: 2048,
          featureExtractors: ["amplitudeSpectrum"],
          callback: (features) => {
            //console.log(features);
            featuresRef.current = features;
          },
        });
        analyzer.start();
      }
    } else {
      isInitialAudioMount.current++;
    }
  }, [file]);

  const changeFn = (optionType, option) => {
    visualizerOptions.current = {
      ...visualizerOptions.current,
      type: option,
    };
    console.log(visualizerOptions.current);
  };

  return (
    <main className=" bg-slate-400 w-full h-full flex min-h-screen flex-col items-center justify-between md:px-5 lg:px-10">
      <div className="flex flex-col items-center justify-between w-full h-full">
        <div className="flex items-center justify-between p-10 gap-3">
          <Input
            className="z-40 mx-auto my-auto"
            type="file"
            accept="audio/*"
            onChange={(e) => {
              setfile(e.target.files[0]);
            }}
          ></Input>
          <select
            name="visualizers"
            onChange={(e) => changeFn("type", e.target.value)}
          >
            <option value={"straitLine"}>Line</option>
            <option value={"straitBar"}>Bar</option>
          </select>
        </div>
        <div className=" w-full items-center justify-between" ref={canvasFrame}>
          <canvas
            className="h-full w-full"
            ref={previewCanvas}
            height={height}
            width={width}
          ></canvas>

          {file && (
            <div className="relative inline-block top-[-60px] mx-auto w-full">
              <div className="flex gap-2 z-50 justify-center items-center">
                <audio
                  ref={audio}
                  src={URL.createObjectURL(file)}
                  controls
                ></audio>
                <Button
                  variant="outline"
                  onClick={() => {
                    startVideoRendering(file);
                  }}
                >
                  <h3 className="mx-auto my-auto">Render</h3>
                </Button>
              </div>
            </div>
          )}
        </div>

        <canvas
          className="absolute top-0 left-0 -z-20"
          ref={renderingCanvas}
          width={600}
          height={400}
          hidden
        ></canvas>
      </div>

      <div>
        {video && (
          <div className="flex z-50">
            <video
              ref={videoRef}
              src={video}
              width={600}
              height={400}
              controls
            ></video>
          </div>
        )}
      </div>
    </main>
  );
}
