import React from 'react'
import { Button } from "@/components/ui/button";

function AudioElement({audio, file, rendering}) {
  return (
    <div className="sticky bottom-0 bg-purple-600 rounded-t-2xl mx-auto w-full">
    <div className="flex gap-2 z-50 justify-center items-center">
      <audio ref={audio} src={URL.createObjectURL(file)} controls></audio>
      <Button
        variant="outline"
        onClick={() => {
          rendering(file);
        }}
      >
        <h3 className="mx-auto my-auto">Render</h3>
      </Button>
    </div>
  </div>
  )
}

export default React.memo(AudioElement)