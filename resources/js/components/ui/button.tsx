import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// 💡 warna utama sidebar-mu
const primaryColor = "oklch(0.4963 0.1135 260.06)";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[oklch(0.4963_0.1135_260.06)] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // === PRIMARY / DEFAULT BUTTON ===
        default: cn(
          "bg-[oklch(0.4963_0.1135_260.06)] text-white shadow-sm",
          "hover:bg-[oklch(0.4863_0.1135_260.06)]",
          "active:scale-[0.98]"
        ),

        // === DESTRUCTIVE / DANGER BUTTON ===
        destructive: cn(
          "bg-red-100 text-red-700 hover:bg-red-200",
          "dark:bg-red-800/40 dark:text-red-200 dark:hover:bg-red-800/60"
        ),

        // === OUTLINE BUTTON ===
        outline: cn(
          "border border-gray-300 bg-white text-gray-800 shadow-sm",
          "hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        ),

        // === SECONDARY BUTTON ===
        secondary: cn(
          "bg-gray-100 text-gray-800 hover:bg-gray-200",
          "dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        ),

        // === GHOST BUTTON (transparent) ===
        ghost: cn(
          "bg-transparent text-[oklch(0.4963_0.1135_260.06)] hover:bg-[oklch(0.4963_0.1135_260.06)/10]",
          "dark:hover:bg-[oklch(0.4963_0.1135_260.06)/20]"
        ),

        // === LINK STYLE BUTTON ===
        link: cn(
          "text-[oklch(0.4963_0.1135_260.06)] underline-offset-4 hover:underline"
        ),
      },

      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-6 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
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
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
