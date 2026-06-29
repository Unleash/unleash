# Impact Views (experimental)

Impact views let a user follow a set of feature flags and their impact metrics
together on a single chart.

The **full** feature (built on the `feat/exp-views` branch) includes goal-tracking
and system-health templates, a "top flag movers" panel, a flag-impact dialog, and a
view editor. We are re-introducing it onto `main` incrementally. **The current,
narrowed scope is a basic goal-tracking view with dummy data** — see "Rollout plan"
for what is in scope now vs. deferred.

This feature is **experimental and intentionally not production-hardened**:

- **Storage is browser `localStorage`** — there is no backend persistence, no
  new database tables, and no new API endpoints. The getters used here hit
  existing endpoints only (e.g. `api/admin/search/events`).
- It is **gated behind the `impactViews` feature flag** and served from the
  self-contained `/impact-views` route.
- Everything is **co-located under this directory** so the feature can be
  removed cleanly (see "Deletion contract" below).

## Layout

```
component/impact-views/
  README.md                  # this file (rollout plan + context)
  ImpactViewsPage.tsx        # page: switcher + active view's chart (useGoalViewData)
  LazyImpactViewsPage.tsx    # lazy wrapper used by the route
  views/                     # components (GoalSummaryPanel, MultimetricChartCard, FollowedFeaturesList,
                             #   ViewSwitcher, FeaturePicker, ViewEditorDialog, ImpactMetricViewsEmptyState, …)
  hooks/                     # data hooks (useGoalViewData seam + resolver/event/metrics hooks)
                             #   + useImpactMetricViews (localStorage CRUD)
```

**Reused from `main` (imported, not copied):** the `MultimetricChart` suite
(`chartConfig`, `types`, `FeatureEventOverlay/eventTheme`, `MultimetricTotals`),
`metricsFormatters`, `useFeatureEnvironmentEvents`, `useImpactMetricsMetadata`
(`useImpactMetricsOptions`), `useEnvironments`, `useFeatureSearch`,
`useLocalStorageState`, `createUuid`, `PageHeader`, `PageContent`, `LineChart`,
`FeatureLifecycleStageIcon`.

## Rollout plan (small, independently-mergeable PRs)

Source of the view files: the `feat/exp-views` branch under
`frontend/src/component/impact-metrics/views/`. Extract file contents (not
commits — the branch carries unrelated churn) and adjust import paths to the
co-located locations.

**Current focus: the view editor + localStorage CRUD** — let users create/edit/switch/delete
their own views, persisted in browser localStorage. The basic goal-tracking view already
renders **real** sandbox data. See "Status" and the "NEXT" section below for exactly where to
resume.

Scope is **goal-tracking only**. Still **deferred** (revisit later): the system-health view,
the **Top Movers** panel and the **Flag Impact** dialog (and the flag-event impact math behind
them), and the synthetic-data generators.

| PR | Contents |
|----|----------|
| **1** ✅ | `impactViews` flag (backend `experimental.ts` + frontend `UiFlags`), `/impact-views` route, gated nav item, stub page + this README. |
| **2** | Goal-view types + goal summary (no components, no API calls): `views/types.ts`, `computeGoalSummary(+test)`. |
| **3** | Goal summary panel (render-only): `GoalSummaryPanel`. (`FollowedFeaturesStrip` dropped — dead code, nothing imports it.) |
| **4** | Chart card (render-only layout): `views/MultimetricChartCard/MultimetricChartCard.tsx`. (Getter `useGroupedImpactMetricsData` deferred to the real-data PR — not needed for dummy data.) |
| **5** | Followed-features list (render-only): `views/FollowedFeaturesList/FollowedFeaturesList.tsx`, rendered below the card on the page with dummy feature names. (The `GoalTrackingViewChart` orchestrator and `useMergedFeatureEvents` stay with the deferred real-data wiring — they exist to fetch live data the dummy view doesn't need.) |
| **(later)** | Replace the per-piece dummy wiring on `ImpactViewsPage` with a single cohesive dummy goal view / `GoalTrackingViewChart` if desired — optional polish, no new components. |
| **Deferred** | **Top Movers / Flag Impact** (`computeFlagEventImpact`, `flagImpactFormatting`, `TopFlagMoversPanel`, `FlagImpactDialog`); real-data wiring; view editor + localStorage CRUD (`ViewEditorDialog`, `useImpactMetricViews`, `FeaturePicker`, `TemplatePickerDialog`, `ViewSwitcher`, `ImpactMetricViews`); system-health view (`SystemHealthViewChart`, `ViewChart` template router, `useAutoFollowedFeatureNames`, `useEnvironmentEvents`, `normalizeSeriesToBaseline`); the synthetic generator `simulateFlagContribution`. |

## Status

- **PR 1** — merged (#12173). Flag, route, nav, stub page, this README.
- **PR 2** — merged (#12177). `views/types.ts` + `views/computeGoalSummary.ts(+test)`.
- **PR 3** — merged. `views/GoalSummaryPanel/` (panel + extracted, tested `sparkline.ts`).
  (Shipped with a throwaway dummy preview that was later replaced by real data in PR 6.)
- **PR 4** — merged. `views/MultimetricChartCard/MultimetricChartCard.tsx` (render-only layout
  card, prop interface tightened to what the goal view needs). The page now renders the card
  with dummy data and the `GoalSummaryPanel` in its `totalsHeaderSlot`. **Note:** the branch
  version passed `highlightedEventId` / `eventImpactById` to `<MultimetricChart>` and exported
  `FeatureEventImpactSummary` — those `MultimetricChart` props are **branch-only additions**
  (deferred Top Movers / event-tooltip work), NOT on `main`, so they were stripped from the
  co-located card. When Top Movers lands, re-add them to both `MultimetricChart` and this card.
- **PR 5** — merged. `views/FollowedFeaturesList/FollowedFeaturesList.tsx` rendered below the
  chart card. Made **presentational**: it takes `features: ResolvedFeature[]` and only groups
  + renders them (data fetching deferred to the real-data phase). Trimmed (550 → ~310) and
  refactored into `StageBadge`/`GroupHeaderRow`/`FeatureRow`. Labels come from the shared
  `getFeatureLifecycleName`. `PageContent` wrapper removed from the page.
- **PR 6** — merged. **Real data** from a hardcoded view template. The page is data-driven:
  `useGoalViewData(view)` fans out to live getters and feeds the card/panel/list. Pieces (all
  hooks under `hooks/`):
  - `fixtures/goalViewConfig.ts` — `GOAL_VIEW` (`purchases` goal + `error_rate`, `count`/
    `month`; flags `impact-views-1/2/3`). **Project-agnostic** — a view holds only
    `featureNames`; each flag's project is resolved from the flag itself (no `project` on
    `MetricView`). `id`/`createdAt`/`updatedAt` stay required (`GOAL_VIEW` stubs them).
    *(This fixture was removed in PR C once localStorage-backed user views replaced the seed data.)*
  - `hooks/useGoalViewData.ts` (+`.test.tsx`) — composition seam (the only file the page calls).
    Picks the goal series/total by the **goal metric's index** (not `[0]`); handles empty series.
  - `hooks/useResolvedFeatures.ts` — `featureNames` → `ResolvedFeature[]` via **one
    cross-project** `useFeatureSearch({ query: names.join(',') })` (backend → `name ILIKE ANY`),
    filtered client-side by exact name. (feature-search `limit` capped at 100 server-side.)
  - `hooks/useFollowedFeatureEvents.ts` — all flags' toggle events in **one** cross-project
    request via the shared `useEventSearch` getter (`feature: IS_ANY_OF:…`), mapped for the
    chart overlay. No per-flag loaders.
  - Chart/totals/window from on-`main` `useGroupedImpactMetricsData(view.metrics)`; goal summary
    from `computeGoalSummary`.
  - **Architecture:** each data concern is its own small hook behind a narrow interface (all
    under `hooks/`); the page has no fetching logic.

### Editor + localStorage CRUD (goal-tracking only) — ✅ COMPLETE
Users create/edit/switch/duplicate/delete their own views, persisted in browser localStorage.
Extracted from `feat/exp-views:.../views/`, **stripping** template/system-health/`normalize`/
`autoFollowFlags`. 4 PRs, all merged:
- **PR A** — View **switcher** (`views/ViewSwitcher/`). Page held `activeViewId` and rendered the
  active view via `useGoalViewData`. (Seeded from a temporary `DUMMY_VIEWS` fixture, since removed.)
- **PR B1** — `views/FeaturePicker/FeaturePicker.tsx` — MUI `<Autocomplete multiple>`, 250ms debounce.
- **PR B2** — `views/ViewEditorDialog/ViewEditorDialog.tsx` (goal-only create/edit form, shared
  `Dialogue` chrome, single view-level aggregation via `GeneralSelect`, `useReducer` form state) +
  page wiring (in-memory create/edit via the `editor` discriminated union).
- **PR C** — `hooks/useImpactMetricViews.ts` (localStorage CRUD: keys `impact-metric-views:list` /
  `impact-metric-views:active-id`, via `useLocalStorageState` + `createUuid`, real `Date.now()`
  timestamps) + `hooks/useImpactMetricViews.test.tsx` + `views/ImpactMetricViewsEmptyState/`.
  Page now uses the hook (no more in-memory state / `DUMMY_VIEWS`): empty storage → empty-state CTA;
  delete → shared `Dialogue` confirm; duplicate → `duplicateView`. The `goalViewConfig.ts` fixture
  was deleted (dead once localStorage landed).

## NEXT: deferred work (revisit when prioritized)

The editor phase is done. Remaining deferred items (not yet started) — see the table above and
"Decisions & context" below:
- **Top Movers / Flag Impact** — `computeFlagEventImpact(+test)`, `flagImpactFormatting`,
  `TopFlagMoversPanel`, `FlagImpactDialog` (re-extract from `feat/exp-views`; not on `main`).
- **System-health view** — `SystemHealthViewChart`, `ViewChart` template router,
  `useAutoFollowedFeatureNames`, `useEnvironmentEvents`, `normalizeSeriesToBaseline`.
- Synthetic generator `simulateFlagContribution`.

Extraction mechanic unchanged: `git show feat/exp-views:.../<file>` → strip
template/system-health/`normalize`/`autoFollowFlags` + comments → point imports at on-`main` modules.

## Decisions & context (for picking this up later)

- **Real data is live** — the goal view renders real sandbox data (PR 6). All dummy fixtures
  (including the `DUMMY_VIEWS`/`GOAL_VIEW` `goalViewConfig.ts`) have been removed; views are now
  user-created and persisted in localStorage (PR C).
- **No backend work** is needed; getters hit existing endpoints. If an extracted file imports
  a symbol not on `main`, add the smallest co-located copy rather than editing shared/backend
  code.
- **`types.ts` is trimmed to goal-tracking-only** (`MetricView`, `ViewMetricConfig`). The
  template machinery (`ViewTemplate`/`TEMPLATE_DEFAULTS`/`DEFAULT_VIEW_*`), localStorage keys,
  and default env/timeRange constants were removed — they come back (re-extracted + stripped of
  system-health) with the editor/CRUD PRs. `MetricView` has **no `project`** (project-agnostic;
  resolved per-flag) and keeps `id`/`createdAt`/`updatedAt` required.
- **Cross-project, one-request data fetching** — the resolver and event hooks deliberately
  avoid per-flag requests + per-project filters; they query all followed flags at once
  (`query: names.join(',')` / `feature: IS_ANY_OF:…`). Keep this pattern when extending.
- **PR-2 history note:** PR 2 originally bundled the flag-impact math; it was split into a
  stacked "PR 2b" (#12178) which was then **closed** when Top Movers / Flag Impact was
  deferred. So `computeFlagEventImpact(+test)` and `flagImpactFormatting` are *not* yet on
  `main` — re-extract them from `feat/exp-views` when picking up Top Movers.
- **Extraction mechanic:** `git show feat/exp-views:frontend/src/component/impact-metrics/views/<file>`
  → write into `views/`, then point imports at the on-`main` shared modules (and at
  co-located `../hooks/` once PR 4 lands). Keep extracted files close to their branch
  originals to ease later wiring.

## Flag wiring

- Backend: `impactViews` in `src/lib/types/experimental.ts`
  (env var `UNLEASH_EXPERIMENTAL_IMPACT_VIEWS`, default `false`).
- Frontend: `impactViews` in `frontend/src/interfaces/uiConfig.ts` (`UiFlags`).
- Route: `/impact-views` in `frontend/src/component/menu/routes.ts` (`flag: 'impactViews'`).
- Nav: gated `PrimaryListItem` in
  `frontend/src/component/layout/MainLayout/NavigationSidebar/NavigationList.tsx`.

## Deletion contract

Removing the feature is: delete this `component/impact-views/` directory, the one
`/impact-views` entry in `routes.ts`, the gated nav line in `NavigationList.tsx`,
and the two `impactViews` flag declarations (backend + frontend).
