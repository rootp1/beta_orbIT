export default function LoadingSpinner({ size = "md", className = "" }: { 
  size?: "sm" | "md" | "lg", 
  className?: string 
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  return (
    <div className={`animate-spin rounded-full border-b-2 border-current ${sizeClasses[size]} ${className}`}>
    </div>
  )
}
