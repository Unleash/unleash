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

| PR | Contents |
|----|----------|
| **1 (this PR)** | `impactViews` flag (backend `experimental.ts` + frontend `UiFlags`), `/impact-views` route, gated nav item, stub page + this README. |
| **2** | Types & pure utilities: `views/types.ts`, `flagImpactFormatting`, `normalizeSeriesToBaseline(+test)`, `computeGoalSummary(+test)`, `computeFlagEventImpact(+test)`, `simulateFlagContribution`. |
| **3** | New co-located getters + chart card: `hooks/useEnvironmentEvents`, `hooks/useGroupedImpactMetricsData` + `sumSeriesByTimestamp(+test)`, `hooks/MultimetricChartCard`. |
| **4** | View-local hooks: `views/useImpactMetricViews(+test)` (the localStorage CRUD core), `useAutoFollowedFeatureNames`, `useMergedFeatureEvents`. |
| **5** | Simple UI: `FeaturePicker`, `ImpactMetricViewsEmptyState`, `FollowedFeaturesStrip`, `TemplatePickerDialog`, `ViewSwitcher`. |
| **6** | Data-display panels: `GoalSummaryPanel`, `TopFlagMoversPanel(+test)`, `FlagImpactDialog(+test)`, `FollowedFeaturesList` (split if too large). |
| **7** | Chart views: `ViewChart`, `GoalTrackingViewChart`, `SystemHealthViewChart`. |
| **8** | Editor + wire live: `ViewEditorDialog` (split if needed), and replace this stub `ImpactViewsPage` with the full container driven by `useImpactMetricViews`. |

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
