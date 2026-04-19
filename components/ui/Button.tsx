import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', isLoading = false, className, ...props },
    ref
  ) => {
    const baseClasses =
      'font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
      secondary:
        'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? 'Loading...' : props.children}
      </button>
    )
  }
)

Button.displayName = 'Button'
