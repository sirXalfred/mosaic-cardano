import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap font-bold transition-all disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-theme-forest text-theme-parchment hover:bg-theme-forest/90 hover:scale-105 active:scale-95 disabled:opacity-50",
        accent: "bg-amber-500 text-black shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50",
        secondary: "bg-black/5 hover:bg-black/10 text-[#111827]",
        outline: "border border-theme-forest hover:bg-theme-forest hover:text-theme-parchment text-[#111827]",
        cardActive: "bg-[#4338CA] text-white border border-[#4338CA] shadow-xl scale-105",
        ghost: "hover:bg-black/5 text-theme-forest",
        link: "tracking-widest text-theme-accent hover:text-theme-forest transition-colors underline-offset-4 hover:underline",
        linkAccent: "text-amber-600 hover:text-amber-700"
      },
      size: {
        default: "px-10 py-3 rounded-2xl text-lg",
        sm: "px-3 py-1 rounded-lg text-sm",
        lg: "px-12 py-5 rounded-lg text-lg",
        xl: "px-12 py-6 rounded-xl text-xl",
        card: "p-8 rounded-[2rem]",
        icon: "h-10 w-10 rounded-lg",
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
  isLoading = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    isLoading?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
          {children}
        </>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
