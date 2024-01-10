import React, {useState, useEffect} from 'react'
import {Button} from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import ColorPicker from './colorPicker';

//store
import { useOptions } from "@/store/optionsStore"

function ListVisualizer({name, removeFn}) {

  const [color, setColor] = useState('rgb(0, 0, 0)')

  const addOptionToVisualiser = useOptions((state) => state.changeOption);
  const visualizerType = useOptions((state) => state.current[name].type)

  useEffect(() => {
    console.log(`color ${color}`)
    addOptionToVisualiser('color', color, name)
  }, [color])

  return (
    <div className="flex flex-col border-2 rounded-xl border-black">
                <div className="flex justify-between items-center border-b-2 border-black">
                  <h3 className='mx-3'>{name}</h3>
                  <Button variant="gohst" onClick={() => removeFn(name)}>x</Button>
                </div>
                <div className="flex flex-col my-2 mx-2 gap-2">
                  <select
                    name="visualizers"
                    onChange={(e) => addOptionToVisualiser("type", e.target.value, name)}
                  >
                    <option value={"line"}>Line</option>
                    <option value={"circle"}>Circle</option>
                  </select>
                  <select
                    name="type"
                    onChange={(e) => addOptionToVisualiser("style", e.target.value, name)}
                  >
                    <option value={"bars"}>Bars</option>
                    <option value={"wave"}>Wave</option>
                  </select>
                  <div className='flex gap-2'>
                    <p>Color</p>
                    <ColorPicker color={color} onChange={setColor} />
                  </div>
                  {visualizerType === "circle" && (
                    <div className='flex my-2 mx-2'>
                    <Slider defaultValue={[50]} max={100} step={1} onPointerUp={(e) => addOptionToVisualiser("radius", e.target.ariaValueNow
, name)} />
                    </div>
                  )}
                </div>
              </div>
  )
}

export default ListVisualizer