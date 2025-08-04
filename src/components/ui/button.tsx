import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "primary" | "accent";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const getVariantClass = () => {
      switch (variant) {
        case "primary":
          return "bg-primary text-primary-foreground hover:bg-primary/90";
        case "accent":
          return "bg-accent text-accent-foreground hover:bg-accent/90";
        case "outline":
          return "border border-border bg-background hover:bg-muted";
        case "ghost":
          return "hover:bg-muted hover:text-foreground";
        case "destructive":
          return "bg-destructive text-white hover:bg-destructive/90";
        case "secondary":
          return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
        case "link":
          return "text-primary underline-offset-4 hover:underline";
        default:
          return "bg-primary text-primary-foreground hover:bg-primary/90";
      }
    };

    const getSizeClass = () => {
      switch (size) {
        case "sm":
          return "h-9 px-3 text-sm";
        case "lg":
          return "h-11 px-8 text-base";
        case "icon":
          return "h-10 w-10 p-0";
        default:
          return "h-10 px-4 py-2";
      }
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          getVariantClass(),
          getSizeClass(),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
