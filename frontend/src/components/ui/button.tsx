import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "rounded-md flex items-center justify-center px-2 py-1 font-bold",
  {
    variants: {
      variant: {
        default: "hover:bg-btn-prime",
        prime: "bg-btn-prime hover:bg-btn-hover",
        accent: "bg-accent outline-2 -outline-offset-4 hover:outline-offset-0",
        action: "bg-btn-sec hover:scale-[0.95] text-bg-prime",
        destructive:
          "bg-[#251017] text-[#d43759] hover:bg-red-600 transition-all ease-in hover:text-txt-prime",
        link: "text-primary underline-offset-4 hover:underline hover:text-blue-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Button({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
