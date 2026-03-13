import { Callout } from '@tremor/react'

interface ErrorStateProps {
  readonly message: string
  readonly onRetry?: () => void
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Callout title="Error" color="red" className="bg-red-500/10 border border-red-500/20 !ring-0">
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-sm font-medium text-red-400 underline hover:text-red-300"
        >
          Retry
        </button>
      )}
    </Callout>
  )
}

export default ErrorState
