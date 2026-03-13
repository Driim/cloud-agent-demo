import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        // Entry points & routing — no testable logic
        'src/main.tsx',
        'src/router.tsx',
        'src/App.tsx',
        'src/index.css',
        // Type definitions
        'src/types/**',
        // Test infrastructure
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
        // Simple useQuery wrappers — tested indirectly via api/client tests
        'src/api/analytics.ts',
        'src/api/team.ts',
        'src/api/repositories.ts',
        // Pure Tremor chart wrappers — no business logic
        'src/components/costs/**',
        'src/components/overview/**',
        'src/components/layout/**',
        'src/components/team/**',
        'src/components/sessions/SessionsTable.tsx',
        'src/components/sessions/SessionTimeline.tsx',
        'src/components/sessions/SessionFilters.tsx',
        'src/components/sessions/ErrorBreakdown.tsx',
        'src/components/shared/KPICard.tsx',
        'src/components/shared/LoadingSkeleton.tsx',
        'src/components/shared/TimeRangeSelector.tsx',
        // Page scaffolds without testable business logic
        'src/pages/CostsPage.tsx',
        'src/pages/OverviewPage.tsx',
        'src/pages/SessionsPage.tsx',
        'src/pages/TeamPage.tsx',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
})
