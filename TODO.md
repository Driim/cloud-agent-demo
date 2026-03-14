# TODO / Plan

## P0 — Критично (блокируют качество)

- [x] **Заменить синий акцент на тёмный неоновый оранжевый**
  - `--color-ai-blue: #3B82F6` → новый оранжевый токен (`--color-ai-orange`)
  - Обновить `index.css`: CSS-переменные, Tremor dark overrides, chart colors
  - Обновить `tremor-safelist.txt`: заменить `blue-*` на `orange-*`
  - Затронутые компоненты: KPICard, StatusBadge, DashboardCard, ChartTooltip, Sidebar, Header, SessionTimeline, всех графиков

- [x] **Удалить `App.tsx`** — мёртвый файл со светлой темой, никогда не рендерится

- [x] **Цвета статусов — привести к семантике**
  - `completed/merged = emerald`, `pending/queued = blue`, `in_progress = новый оранжевый`, `warning = amber`, `error/failed = red`
  - Затронуто: `StatusBadge.tsx`, `SessionFilters.tsx`

- [x] **ChartTooltip — убрать захардкоженные цвета**
  - `border-neutral-700` → `border-white/10`
  - `bg-neutral-900` → `bg-[var(--color-surface)]`

- [x] **Agent Session дропдаун — починить и улучшить внешний вид**
  - Фильтрация работает корректно (диагностировано)
  - Привести стиль к общему дизайну: dropdown `bg-neutral-900` → `bg-[var(--color-surface)]`, merged цвет → emerald

## P1 — Высокий приоритет

- [x] **`Header.tsx` — унифицировать фон**
  - `bg-surface` → `bg-white/5` (консистентно с DashboardCard glassmorphism)

- [x] **Кнопки — стандартизировать размеры**
  - `px-3 py-1.5`: TimeRangeSelector уже корректен, SessionsTable пагинация исправлена

- [x] **`font-mono` — применить ко всем числовым значениям**
  - Добавлено: `commit_count`, `files_changed` в SessionDetailPage; `active_30d/total_members` в AdoptionRateCard
  - CostsPage (через KPICard Metric), TeamLeaderboard — уже были корректны

- [x] **`!ring-0` — добавить на все Tremor-компоненты**
  - ProgressBar в ConcurrentSessions — добавлено; Callout в BudgetAlerts/ErrorState — уже было; Select не используется

- [x] **`BadgeDelta` / `Badge` — стандартизировать `size="xs"` везде**
  - Аудит: все компоненты (StatusBadge, KPICard, AdoptionRateCard, TeamLeaderboard, ActivityFeed, QuotasList) уже корректны

## P2 — Средний приоритет

- [x] **Аватары — выбрать один стиль**
  - Выбран: градиент (`from-ai-orange to-ai-purple`)
  - Создан компонент `UserAvatar` (`src/components/shared/UserAvatar.tsx`)
  - Применён в Header, TeamLeaderboard, ActivityFeed

- [x] **Цвета графиков — ввести семантику**
  - Session/performance → `orange`, Cost/spend → `violet`, Error → `red`, Success → `emerald`
  - Исправлено: SpendTrend (`orange`→`violet`), LatencyP95 (`violet`→`orange`), CostBreakdownDonut (ведущий `violet`)

- [x] **Карточки — унифицировать отступ title→content**
  - Аудит: все карточки с `<Title>` уже используют `mt-4` единообразно
  - KPI-карточки (`<Text>` label + inline) — отдельный паттерн by design

## P3 — Документация и прочее

- [ ] **Полный ревью кода** — запустить code-reviewer агент по всему фронтенду

- [ ] **Подготовить README проекта**
  - Описать стек, архитектуру, как запустить
  - Описать метрики и почему они были выбраны

- [ ] **Перерисовать схемы system design в Excalidraw**
  - Использовать excalidraw-diagram skill
  - Вставить так чтобы отображалось в GitHub

- [ ] **Задеплоить демо на AWS**
  - Выбрать способ деплоя (ECS / Amplify / EC2)
  - Настроить CI/CD

---

## Выполнено

- [x] Валидировать демо относительно систем дизайна
