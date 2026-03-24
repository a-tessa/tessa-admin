import * as React from 'react'
import { cn } from '@/shared/lib/utils'

interface FloatingInputProps extends React.ComponentProps<'input'> {
  label: string
}

function FloatingInput({
  label,
  id,
  className,
  type,
  value,
  ...props
}: FloatingInputProps) {
  const hasValue = typeof value === 'string' ? value.length > 0 : value !== undefined

  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        data-slot="input"
        placeholder=" "
        className={cn(
          'peer h-14 w-full min-w-0 rounded-lg border border-input bg-transparent px-4 pt-5 pb-2 text-base shadow-xs transition-[color,box-shadow,border-color] outline-none md:text-sm',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
      <label
        htmlFor={id}
        className={cn(
          'pointer-events-none absolute left-4 text-muted-foreground transition-all duration-200 ease-out',
          'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:md:text-sm',
          'peer-focus:top-2.5 peer-focus:-translate-y-0 peer-focus:text-[11px] peer-focus:font-medium peer-focus:text-primary',
          hasValue
            ? 'top-2.5 -translate-y-0 text-[11px] font-medium text-foreground/60'
            : '',
        )}
      >
        {label}
      </label>
    </div>
  )
}

export { FloatingInput }
