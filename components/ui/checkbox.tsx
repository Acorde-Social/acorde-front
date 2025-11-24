"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps {
  id?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ id, checked = false, onCheckedChange, disabled = false, className }, ref) => {
    return (
      <button
        ref={ref}
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        style={{
          width: '20px',
          height: '20px',
          border: '2px solid #c41e3a',
          borderRadius: '4px',
          backgroundColor: checked ? '#c41e3a' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.2s ease',
        }}
        className={className}
      >
        {checked && (
          <Check
            style={{
              width: '16px',
              height: '16px',
              color: '#ffffff',
              strokeWidth: 4
            }}
          />
        )}
      </button>
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox }
