import React from 'react'
import {Button} from "@/components/ui/button"

function ListVisualizer({name, changeFn, removeFn}) {
  return (
    <div className="flex flex-col border-2 rounded-xl border-black">
                <div className="flex justify-between items-center border-b-2 border-black">
                  <h3 className='mx-3'>{name}</h3>
                  <Button onClick={() => removeFn(name)}>x</Button>
                </div>
                <div className="flex flex-col my-2 mx-2">
                  <select
                    name="visualizers"
                    onChange={(e) => changeFn("type", e.target.value, name)}
                  >
                    <option value={"straitLine"}>Line</option>
                    <option value={"straitBar"}>Bar</option>
                  </select>
                </div>
              </div>
  )
}

export default ListVisualizer