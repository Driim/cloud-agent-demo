import {
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Card,
  Title,
} from '@tremor/react'
import type { TeamMemberStats } from '../../types/api'

interface TeamLeaderboardProps {
  readonly data: readonly TeamMemberStats[]
}

function TeamLeaderboard({ data }: TeamLeaderboardProps) {
  const sorted = [...data].sort((a, b) => b.sessions - a.sessions)

  return (
    <Card>
      <Title>Team Leaderboard</Title>
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
                <span className="font-medium">{member.display_name}</span>
                <span className="ml-2 text-xs text-gray-400">{member.user}</span>
              </TableCell>
              <TableCell>{member.sessions}</TableCell>
              <TableCell>{member.prs_merged}</TableCell>
              <TableCell>
                <Badge
                  color={member.success_rate >= 0.8 ? 'green' : member.success_rate >= 0.5 ? 'amber' : 'red'}
                  size="xs"
                >
                  {(member.success_rate * 100).toFixed(0)}%
                </Badge>
              </TableCell>
              <TableCell>{Math.round(member.avg_session_duration_sec / 60)}m</TableCell>
              <TableCell>${member.total_cost_usd.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

export default TeamLeaderboard
