interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`spinner ${sizeClasses[size]}`}></div>
      {message && (
        <p className="mt-4 text-gray-600 text-sm font-medium">{message}</p>
      )}
    </div>
  )
}