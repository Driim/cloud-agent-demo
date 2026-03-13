import { Callout } from '@tremor/react'

interface ErrorStateProps {
  readonly message: string
  readonly onRetry?: () => void
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Callout title="Error" color="red">
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-900"
        >
          Retry
        </button>
      )}
    </Callout>
  )
}

export default ErrorState
