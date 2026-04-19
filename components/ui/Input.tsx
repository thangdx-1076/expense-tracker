import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => {
    const baseClasses =
      'w-full px-3 py-2 border border-gray-300 rounded-lg transition-colors duration-200'
    const focusClasses = 'focus:outline-none focus:ring-2 focus:ring-blue-500'
    const errorClasses = error
      ? 'border-red-500 focus:ring-red-500'
      : 'focus:border-blue-500'

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${focusClasses} ${errorClasses} ${className || ''}`}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
