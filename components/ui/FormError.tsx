interface FormErrorProps {
  errors?: string[]
  className?: string
}

export function FormError({ errors, className = '' }: FormErrorProps) {
  if (!errors || errors.length === 0) {
    return null
  }

  return (
    <div className={`text-sm text-red-600 space-y-1 ${className}`}>
      {errors.map((error, index) => (
        <p key={index}>{error}</p>
      ))}
    </div>
  )
}
