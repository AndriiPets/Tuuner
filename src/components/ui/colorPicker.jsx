import React, {useCallback, useRef, useState} from 'react'
import { RgbStringColorPicker } from "react-colorful";
import useClickOutside from "./useClickOutside";

function ColorPicker({color, onChange}) {
    const popover = useRef()
    const [isOpen, setOpen] = useState(false)

    const close = useCallback(() => setOpen(false), [])
    useClickOutside(popover, close)
  return (
    <div className='relative'>
        <div className='border-2 rounded-lg border-slate-300 h-7 w-10 cursor-pointer' 
             onClick={() => setOpen(true)}
             style={{ backgroundColor: color }}>
            {isOpen && (
                <div className='absolute right-0 top-[100%] rounded-lg' ref={popover}>
                    <RgbStringColorPicker color={color} onChange={onChange} />
                </div>
            )}
        </div>
    </div>
  )
}

export default ColorPicker