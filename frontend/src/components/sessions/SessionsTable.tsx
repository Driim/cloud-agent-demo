import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import {
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from '@tremor/react'
import StatusBadge from '../shared/StatusBadge'
import { formatDuration } from '../../utils/format'
import type { SessionSummary, PaginationMeta } from '../../types/api'

const columnHelper = createColumnHelper<SessionSummary>()

interface SessionsTableProps {
  readonly data: readonly SessionSummary[]
  readonly pagination: PaginationMeta
  readonly onNextPage: () => void
  readonly onPrevPage: () => void
}

function SessionsTable({ data, pagination, onNextPage, onPrevPage }: SessionsTableProps) {
  const navigate = useNavigate()

  const columns = useMemo(
    () => [
      columnHelper.accessor('session_id', {
        header: 'Session',
        cell: (info) => (
          <span className="font-mono text-xs text-ai-purple">{info.getValue().slice(0, 12)}...</span>
        ),
      }),
      columnHelper.accessor('user', {
        header: 'User',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('repo', {
        header: 'Repository',
        cell: (info) => (
          <span className="font-medium text-neutral-300">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor('duration_sec', {
        header: 'Duration',
        cell: (info) => <span className="font-mono">{formatDuration(info.getValue())}</span>,
      }),
      columnHelper.accessor('tokens_used', {
        header: 'Tokens',
        cell: (info) => <span className="font-mono">{info.getValue().toLocaleString()}</span>,
      }),
      columnHelper.accessor('cost_usd', {
        header: 'Cost',
        cell: (info) => <span className="font-mono">${info.getValue().toFixed(2)}</span>,
      }),
      columnHelper.accessor('pr_number', {
        header: 'PR',
        cell: (info) => {
          const pr = info.getValue()
          return pr ? <span className="font-mono">#{pr}</span> : '—'
        },
      }),
    ],
    [],
  )

  const table = useReactTable({
    data: [...data],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
      <Table>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHeaderCell key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHeaderCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={() => navigate(`/sessions/${row.original.session_id}`)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex items-center justify-between text-sm text-neutral-400">
        <span>~{pagination.approx_total.toLocaleString()} sessions total</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={!pagination.prev_cursor}
            className="rounded-lg px-3 py-1.5 border border-white/10 text-neutral-300 disabled:opacity-40 hover:bg-white/5 transition-colors"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={onNextPage}
            disabled={!pagination.has_more}
            className="rounded-lg px-3 py-1.5 border border-white/10 text-neutral-300 disabled:opacity-40 hover:bg-white/5 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default SessionsTable
