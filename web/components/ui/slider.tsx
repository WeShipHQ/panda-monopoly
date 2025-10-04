"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  onValueChange,
  onValueCommit,
  step = 1,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  onValueCommit?: (value: number[]) => void;
}) {
  // Memoize values array to prevent unnecessary re-renders
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )
  
  // Performance optimization for the value change handler
  const optimizedOnValueChange = React.useCallback(
    (value: number[]) => {
      if (onValueChange) {
        onValueChange(value);
      }
    },
    [onValueChange]
  )
  
  // Handle value commit (when user releases the slider)
  const optimizedOnValueCommit = React.useCallback(
    (value: number[]) => {
      if (onValueCommit) {
        onValueCommit(value);
      }
    },
    [onValueCommit]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      step={step}
      onValueChange={optimizedOnValueChange}
      onValueCommit={optimizedOnValueCommit}
      className={cn(
        "relative flex w-full touch-auto items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col py-3",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 shadow-inner border border-muted/50"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-emerald-500 absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-emerald-500 bg-white ring-emerald-400/20 block size-6 shrink-0 rounded-full border-2 shadow-md hover:ring-2 focus-visible:ring-2 focus-visible:outline-hidden active:cursor-grabbing cursor-grab disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
