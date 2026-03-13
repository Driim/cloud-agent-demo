import { Grid, Title } from '@tremor/react'
import { useTeamStats } from '../api/team'
import { useAdoptionRate } from '../api/analytics'
import SessionsPerMember from '../components/team/SessionsPerMember'
import TeamLeaderboard from '../components/team/TeamLeaderboard'
import ActivityFeed from '../components/team/ActivityFeed'
import AdoptionRateCard from '../components/team/AdoptionRateCard'
import LoadingSkeleton from '../components/shared/LoadingSkeleton'
import ErrorState from '../components/shared/ErrorState'
import { sanitizeApiError } from '../utils/errors'

function TeamPage() {
  const team = useTeamStats()
  const adoptionRate = useAdoptionRate()

  if (team.isLoading) {
    return <LoadingSkeleton lines={6} />
  }

  if (team.error) {
    return (
      <ErrorState
        message={sanitizeApiError(team.error)}
        onRetry={() => {
          void team.refetch()
          void adoptionRate.refetch()
        }}
      />
    )
  }

  if (!team.data) {
    return null
  }

  return (
    <div className="space-y-6">
      <Title>Team Activity</Title>
      {adoptionRate.data && <AdoptionRateCard data={adoptionRate.data} />}
      <Grid numItemsSm={1} numItemsLg={2} className="gap-6">
        <SessionsPerMember data={team.data} />
        <ActivityFeed />
      </Grid>
      <TeamLeaderboard data={team.data} />
    </div>
  )
}

export default TeamPage
