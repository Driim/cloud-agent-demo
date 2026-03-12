import { useParams } from 'react-router'

function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800">Session Detail</h2>
      <p className="mt-2 text-gray-500">Session ID: {id}</p>
    </div>
  )
}

export default SessionDetailPage
