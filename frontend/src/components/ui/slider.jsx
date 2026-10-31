import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

/**
 * @typedef {Object} SliderProps
 * @property {string} [className]
 * @property {number} [min]
 * @property {number} [max]
 * @property {number} [step]
 * @property {number[] | [number, number]} [value]
 * @property {(value: number[] | [number, number]) => void} [onValueChange]
 */

/** @type {import("react").ForwardRefExoticComponent<SliderProps & import("react").ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & import("react").RefAttributes<HTMLSpanElement>>} */
const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}>
    <SliderPrimitive.Track
      className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
