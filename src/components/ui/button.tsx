import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer whitespace-nowrap font-bold transition-all disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[#4338CA] text-white shadow-xl hover:scale-105 active:scale-95 disabled:opacity-20",
        accent: "bg-amber-500 text-black shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50",
        secondary: "bg-black/5 hover:bg-black/10 text-[#111827]",
        outline: "border border-black/5 bg-white hover:border-black/20 text-[#111827]",
        cardActive: "bg-[#4338CA] text-white border border-[#4338CA] shadow-xl scale-105",
        ghost: "hover:bg-black/5 text-[#4338CA]",
        link: "text-[#4338CA] underline-offset-4 hover:underline",
        linkAccent: "text-amber-600 hover:text-amber-700",
        auth: "bg-[#4338CA] text-white shadow-xl hover:shadow-2xl"
      },
      size: {
        default: "px-10 py-3 rounded-2xl text-lg",
        sm: "px-6 py-2 rounded-full text-xs",
        lg: "px-12 py-5 rounded-full text-lg",
        xl: "px-12 py-6 rounded-full text-xl",
        card: "p-8 rounded-[2rem]",
        icon: "h-10 w-10 rounded-full",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
