import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost', size?: 'sm' | 'md' | 'lg' }>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-blue disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          {
            'bg-medical-blue text-white hover:bg-medical-blue-hover shadow-[0_0_15px_var(--color-medical-blue)] hover:shadow-[0_0_25px_var(--color-medical-blue)]': variant === 'primary',
            'bg-surgical-green text-slate-900 hover:bg-surgical-green-hover shadow-[0_0_15px_var(--color-surgical-green)] hover:shadow-[0_0_25px_var(--color-surgical-green)]': variant === 'secondary',
            'border border-dark-border bg-transparent hover:bg-dark-surface text-slate-300': variant === 'outline',
            'hover:bg-dark-surface text-slate-300': variant === 'ghost',
            'h-9 px-4 text-sm': size === 'sm',
            'h-11 px-6 text-base': size === 'md',
            'h-14 px-8 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
