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
  ImpactViewsPage.tsx        # page shell / container (stub today; renders dummy goal view in PR 6)
  LazyImpactViewsPage.tsx    # lazy wrapper used by the route
  views/                     # goal-view components & pure utils (PR 2 onward)
  hooks/                     # co-located getters + chart card (lands in PR 4)
  fixtures/                  # hardcoded dummy MetricView + series/events (lands in PR 6)
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

**Current focus: get the *basic* goal-tracking view rendering with hardcoded dummy data
first** — just the goal chart, the goal-summary headline, and a followed-features list.

Scope right now is **goal-tracking only**. Everything else is **deferred** (to revisit
later, not in the basic goal view): the system-health view, the **Top Movers** panel and
the **Flag Impact** dialog (and the flag-event impact math behind them), synthetic-data
generators, the view editor, localStorage CRUD, and real-data wiring.

| PR | Contents |
|----|----------|
| **1** ✅ | `impactViews` flag (backend `experimental.ts` + frontend `UiFlags`), `/impact-views` route, gated nav item, stub page + this README. |
| **2** | Goal-view types + goal summary (no components, no API calls): `views/types.ts`, `computeGoalSummary(+test)`. |
| **3** | Basic goal-view display: `GoalSummaryPanel`, `FollowedFeaturesStrip` (render-only). |
| **4** | Chart card + getter: `hooks/MultimetricChartCard`, `hooks/useGroupedImpactMetricsData` + `sumSeriesByTimestamp(+test)`. |
| **5** | Goal chart + lists: `GoalTrackingViewChart` (Top Movers / Flag Impact / dev simulation stripped), `FollowedFeaturesList`, `useMergedFeatureEvents`. |
| **6** | Wire the dummy goal view: `fixtures/dummyGoalView.ts` (hardcoded `MetricView` + static series/events) rendered from `ImpactViewsPage` — no API calls. |
| **Deferred** | **Top Movers / Flag Impact** (`computeFlagEventImpact`, `flagImpactFormatting`, `TopFlagMoversPanel`, `FlagImpactDialog`); real-data wiring; view editor + localStorage CRUD (`ViewEditorDialog`, `useImpactMetricViews`, `FeaturePicker`, `TemplatePickerDialog`, `ViewSwitcher`, `ImpactMetricViews`); system-health view (`SystemHealthViewChart`, `ViewChart` template router, `useAutoFollowedFeatureNames`, `useEnvironmentEvents`, `normalizeSeriesToBaseline`); the synthetic generator `simulateFlagContribution`. |

## Status

- **PR 1** — merged (#12173). Flag, route, nav, stub page, this README.
- **PR 2** — open (#12177). `views/types.ts` + `views/computeGoalSummary.ts(+test)`.
- **PR 3+** — not started.

## Decisions & context (for picking this up later)

- **Dummy data = a hardcoded static fixture** (`fixtures/dummyGoalView.ts`, PR 6), *not*
  the branch's `simulateFlagContribution` generator. The fixture must match the shapes the
  panels consume: `MultimetricStepSeries` / `MultimetricStep` / `MultimetricFeatureEvent`
  (see on-`main` `MultimetricChart/types.ts` + `MultimetricTotals.tsx`).
- **No backend work** is needed for the goal view; getters hit existing endpoints. If an
  extracted file imports a symbol not on `main`, add the smallest co-located copy rather
  than editing shared/backend code.
- **`ImpactViewFeatureEvent`** (in `views/types.ts`) = the shared `MultimetricFeatureEvent`
  plus an optional `featureName`, so a multi-feature chart can tag which flag each toggle
  event belongs to. Kept local (not a widening of the shared type) to stay removable. It is
  currently **unused** in scope — its consumers (`computeFlagEventImpact`,
  `simulateFlagContribution`) are deferred — but pre-declared on purpose.
- **`types.ts` was trimmed** to only what the goal view needs (`MetricView`,
  `ViewMetricConfig`, `ImpactViewFeatureEvent`). The template machinery
  (`ViewTemplate`/`TEMPLATE_DEFAULTS`/`DEFAULT_VIEW_*`), localStorage keys, and default
  env/timeRange constants were removed — they're only used by the deferred editor + CRUD,
  and come back with those PRs.
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
