import React, { useEffect, useState } from 'react'

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"

function ViewMenu({setBG}) {
    const [picName, setPicName] = useState('')
  return (
    <div>
    <Popover>
        <PopoverTrigger asChild>
            <Button 
                variant="outline"
                className="rounded-xl bg-transparent border-black border-2"
            >View</Button>
        </PopoverTrigger>
        <PopoverContent>
            <div className='flex flex-col gap-2'>
                <div className='flex gap-2 items-center'>
                    <input 
                    type="file" 
                    accept="image/*"
                    id='background-btn' 
                    onChange={async (e) => {
                        const buffer = await e.target.files[0].arrayBuffer()
                        setBG(buffer); 
                        setPicName(e.target.files[0].name);
                    }}
                    hidden/>
                    <label htmlFor="background-btn" >Set background</label>
                    <span className='truncate text-green-700 font-bold'>{picName}</span>
                </div>
                <Separator />
                <div className='flex gap-2'>
                    <span>Set central picture</span>
                </div>
            </div>
        </PopoverContent>
    </Popover>
    
    </div>
  )
}

export default ViewMenu