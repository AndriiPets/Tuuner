"use client";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { useState, useEffect, useRef, useCallback } from "react";
import { visualize } from "./visualizer/visualisers";
import { renderVisualization } from "./utils/renderVisualization";
import { loadRenderFrames } from "./utils/loadRenderingFrames";
import { bufferToBase64 } from "./utils/bufferConversion";
import { getFFTs } from "./utils/getFFTs";

//ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ListVisualizer from "@/components/ui/listVisualizer";
import AudioElement from "@/components/ui/audioElement";
import ViewMenu from "@/components/ui/viewMenu";

//store
import { useOptions } from "@/store/optionsStore";
import { useShallow } from "zustand/react/shallow";

const VISUALIZER = visualize;
const NUM_BARS = 60;
const FPS = 60;

export default function Home() {
  const renderingCanvas = useRef();
  const previewCanvas = useRef();
  const backgroundCanvas = useRef();
  const canvasFrame = useRef();
  const audio = useRef();
  const isInitialAudioMount = useRef(0);
  const videoRef = useRef();
  const [video, setVideo] = useState("");
  const [file, setfile] = useState("");
  const featuresRef = useRef([]);
  const [backgroundBuffer, setBackdroundBuffer] = useState("");
  const [backgroundDataURL, setBackgroundDataURL] = useState("");

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(580);
  const [audioSource, setAudioSource] = useState(null);
  const [load, setLoad] = useState(false);

  const ffmpegRef = useRef(new FFmpeg());
  const ffmpeg = ffmpegRef.current;

  //store
  const opts = useRef();
  const addStoreVisualizer = useOptions(
    useShallow((state) => state.addVisualizer)
  );
  const deleteStoreVisualizer = useOptions(
    useShallow((state) => state.deleteVisualizer)
  );
  const storeOptions = useOptions(
    useShallow((state) => (opts.current = state.current))
  );

  //visualizer options
  const defaultOptions = useRef({
    type: "line",
    style: "bars",
    background: "none",
    numBars: NUM_BARS,
    radius: 50,
    color: "rgb(0, 0, 0)",
    position: "down",
    orientation: "up",
  });

  const visualizerOptions = useRef({
    Visualizer_1: { ...defaultOptions.current },
  });
  const [visualizers, setVisualizers] = useState(["Visualizer_1"]);
  const [visualizerNames, setVisualizersNames] = useState([
    "Visualizer_2",
    "Visualizer_3",
  ]);

  //TODO delete visualizers, pass to each visualizer individual options

  function addVisualizer() {
    if (visualizerNames.length > 0) {
      const newName = visualizerNames[0];
      setVisualizers([...visualizers, newName]);
      visualizerNames.splice(0, 1);
      console.log(`name ${newName}`);
      addStoreVisualizer(newName);
      //visualizerOptions.current = {
      //  ...visualizerOptions.current,
      //  [newName]: { ...defaultOptions.current },
      //};
    } else {
      window.alert("Cannot add more than three visualizers!");
    }
  }

  function removeVisualizer(name) {
    //console.log(`deleting ${name}`);
    deleteStoreVisualizer(name);
    setVisualizers(visualizers.filter((item) => item !== name));
    setVisualizersNames([...visualizerNames, name]);
    console.log(visualizerNames);
  }

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

  //SETTING VISUALIZATIONS TO RENDER

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
          options: opts.current,
          dataArrayMatrix: rendering_data.data_chunks,
          canvas: renderingCanvas.current,
          canvasCtx: canvasCtx,
          chunkLength: rendering_data.lengthPerChunk,
          ffmpeg: ffmpeg,
          audio: { url: url, type: audioType },
          setVideo: setVideo,
          setLoad: setLoad,
          background: backgroundCanvas.current,
        });
      }

      startRenderingPipeline();
    }
  }

  const memoizedVideoRendering = useCallback(startVideoRendering, [
    file,
    backgroundCanvas,
  ]);

  //SETTING REAL-TIME VISUALIZATION

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

          if (data) {
            canvasCtx.clearRect(
              0,
              0,
              previewCanvas.current.width,
              previewCanvas.current.height
            );

            VISUALIZER({
              options: opts.current,
              canvasCtx: canvasCtx,
              canvasWidth: previewCanvas.current.width,
              canvasHeight: previewCanvas.current.height,
              x: x,
              dataArray: data,
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
          bufferSize: 1024,
          windowingFunction: "blackman",
          featureExtractors: ["amplitudeSpectrum"],
          callback: (features) => {
            featuresRef.current = features;
          },
        });
        analyzer.start();
      }
    } else {
      isInitialAudioMount.current++;
    }
  }, [file]);

  //SETTING THE BACKGROUND IMAGE

  useEffect(() => {
    //use file reader to convert buffer from the input to dataURL
    let fileReader,
      isCancel = false;
    if (backgroundBuffer) {
      fileReader = new FileReader();
      fileReader.onload = (e) => {
        const result = e.target.result;
        if (result && !isCancel) {
          setBackgroundDataURL(result);
        }
      };
      fileReader.readAsDataURL(new Blob([backgroundBuffer]));
    }

    return () => {
      isCancel = true;
      if (fileReader && fileReader.readyState === 1) {
        fileReader.abort();
      }
    };
  }, [backgroundBuffer]);

  useEffect(() => {
    console.log(backgroundDataURL);

    const url = backgroundDataURL;
    const bgCanvasCtx = backgroundCanvas.current.getContext("2d");

    const img = new Image(); // Create new img
    //make shure image can load in time before displaying
    img.addEventListener(
      "load",
      () => {
        bgCanvasCtx.drawImage(img, 0, 0);
      },
      false
    );
    img.src = url;
  }, [backgroundDataURL]);

  return (
    <main className=" bg-slate-400 w-full h-full">
      <div className="flex sticky top-0 bg-white rounded-b-xl w-full z-50">
        <h1 className="py-5 font-bold text-2xl mx-3">Tuuner</h1>
      </div>
      <div className="flex w-full md:px-5 lg:px-10 sm:px-2">
        <div className="flex flex-col w-full h-full items-center justify-between overflow-hidden border-2 rounded-xl my-3 border-black">
          <div className="flex justify-between p-5 w-full border-b-2 border-black">
            <Input
              className="z-40 rounded-xl bg-transparent border-black border-2"
              type="file"
              accept="audio/*"
              onChange={(e) => {
                setfile(e.target.files[0]);
              }}
            ></Input>
            <ViewMenu setBG={setBackdroundBuffer}></ViewMenu>
          </div>
          <div className="flex my-3 mx-3 w-full">
            <div
              className="w-full grid mx-3 border-2 border-black rounded-xl"
              ref={canvasFrame}
            >
              <canvas
                className="h-full w-full col-start-1 row-start-1 z-10 bg-transparent rounded-xl"
                ref={previewCanvas}
                height={height}
                width={width}
              ></canvas>
              <canvas
                className="h-full w-full col-start-1 row-start-1 z-0  bg-red-400 rounded-xl"
                ref={backgroundCanvas}
                height={height}
                width={width}
              ></canvas>
            </div>
            <div className="flex flex-col bg-yellow-700 mr-3">
              {visualizers.map((item, i) => (
                <ListVisualizer
                  name={item}
                  removeFn={removeVisualizer}
                  key={i}
                />
              ))}
              <Button variant="ghost" onClick={addVisualizer}>
                Add Visualizer
              </Button>
            </div>
          </div>

          <canvas
            className="absolute top-0 left-0 -z-20"
            ref={renderingCanvas}
            width={600}
            height={400}
            hidden
          ></canvas>
        </div>
      </div>

      {file && (
        <AudioElement
          audio={audio}
          file={file}
          rendering={memoizedVideoRendering}
        ></AudioElement>
      )}

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
