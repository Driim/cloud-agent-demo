interface LoadingSkeletonProps {
  readonly lines?: number
}

function LoadingSkeleton({ lines = 3 }: LoadingSkeletonProps) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={`skeleton-${i}`}
          className="h-4 rounded bg-white/10"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  )
}

export default LoadingSkeleton
