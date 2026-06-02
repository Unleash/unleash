# Impact Views (experimental)

Impact views let a user follow a set of feature flags and their impact metrics
together on a single chart — goal-tracking and system-health templates, a
"top flag movers" panel, a flag-impact dialog, and a view editor.

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
  ImpactViewsPage.tsx        # page shell / container (currently a stub)
  LazyImpactViewsPage.tsx    # lazy wrapper used by the route
  hooks/                     # NEW co-located getter hooks + chart card (PR 3)
  views/                     # view components & utilities (PR 2+)
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

**Current focus: get the goal-tracking view rendering with hardcoded dummy data first.**
Simulation/synthetic-data generators, the editor, localStorage CRUD, and the system-health
view are deferred to a later phase.

| PR | Contents |
|----|----------|
| **1** ✅ | `impactViews` flag (backend `experimental.ts` + frontend `UiFlags`), `/impact-views` route, gated nav item, stub page + this README. |
| **2** | Goal-view types + goal summary (no components, no API calls): `views/types.ts`, `computeGoalSummary(+test)`. |
| **2b** | Flag-event impact math: `computeFlagEventImpact(+test)`, `flagImpactFormatting`. |
| **3** | Goal-view display panels (render-only): `GoalSummaryPanel`, `TopFlagMoversPanel`, `FlagImpactDialog`, `FollowedFeaturesStrip`. |
| **4** | Chart card + getter: `hooks/MultimetricChartCard`, `hooks/useGroupedImpactMetricsData` + `sumSeriesByTimestamp(+test)`. |
| **5** | Goal chart + lists: `GoalTrackingViewChart` (dev simulation toggle stripped), `FollowedFeaturesList`, `useMergedFeatureEvents`. |
| **6** | Wire the dummy goal view: `fixtures/dummyGoalView.ts` (hardcoded `MetricView` + static series/events) and render it from `ImpactViewsPage` — no API calls. |
| **Deferred** | Real-data wiring; view editor + localStorage CRUD (`ViewEditorDialog`, `useImpactMetricViews`, `FeaturePicker`, `TemplatePickerDialog`, `ViewSwitcher`, `ImpactMetricViews`); system-health view (`SystemHealthViewChart`, `ViewChart`, `useAutoFollowedFeatureNames`, `useEnvironmentEvents`, `normalizeSeriesToBaseline`); the synthetic generator `simulateFlagContribution`. |

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
