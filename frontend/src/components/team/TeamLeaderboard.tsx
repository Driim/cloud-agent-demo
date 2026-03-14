import {
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Title,
} from '@tremor/react'
import DashboardCard from '../shared/DashboardCard'
import UserAvatar from '../shared/UserAvatar'
import type { TeamMemberStats } from '../../types/api'
import { formatUSD } from '../../utils/format'

interface TeamLeaderboardProps {
  readonly data: readonly TeamMemberStats[]
}

function TeamLeaderboard({ data }: TeamLeaderboardProps) {
  const sorted = [...data].sort((a, b) => b.sessions - a.sessions)

  return (
    <DashboardCard>
      <Title className="text-white">Team Leaderboard</Title>
      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Sessions</TableHeaderCell>
            <TableHeaderCell>PRs Merged</TableHeaderCell>
            <TableHeaderCell>Success Rate</TableHeaderCell>
            <TableHeaderCell>Avg Duration</TableHeaderCell>
            <TableHeaderCell>Total Cost</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((member) => (
            <TableRow key={member.user}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <UserAvatar name={member.display_name} size="sm" />
                  <div>
                    <span className="font-medium text-white">{member.display_name}</span>
                    <span className="ml-2 text-xs text-neutral-500">{member.user}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell><span className="font-mono">{member.sessions}</span></TableCell>
              <TableCell><span className="font-mono">{member.prs_merged}</span></TableCell>
              <TableCell>
                <Badge
                  color={member.success_rate >= 0.8 ? 'green' : member.success_rate >= 0.5 ? 'amber' : 'red'}
                  size="xs"
                >
                  {(member.success_rate * 100).toFixed(0)}%
                </Badge>
              </TableCell>
              <TableCell><span className="font-mono">{Math.round(member.avg_session_duration_sec / 60)}m</span></TableCell>
              <TableCell><span className="font-mono">{formatUSD(member.total_cost_usd)}</span></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardCard>
  )
}

export default TeamLeaderboard
