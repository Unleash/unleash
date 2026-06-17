import { useMemo, useState, type FC } from 'react';
import { Box } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Badge } from 'component/common/Badge/Badge';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { GoalSummaryPanel } from './views/GoalSummaryPanel/GoalSummaryPanel';
import { MultimetricChartCard } from './views/MultimetricChartCard/MultimetricChartCard';
import { FollowedFeaturesList } from './views/FollowedFeaturesList/FollowedFeaturesList';
import { TopMoversPanel } from './views/TopMoversPanel/TopMoversPanel';
import { BrushSelectionPopover } from './views/BrushSelectionPopover/BrushSelectionPopover';
import { computeWindowSummary } from './views/computeWindowSummary';
import { computeFlagImpacts } from './views/computeFlagImpacts';
import { ViewSwitcher } from './views/ViewSwitcher/ViewSwitcher';
import { ViewEditorDialog } from './views/ViewEditorDialog/ViewEditorDialog';
import { ImpactMetricViewsEmptyState } from './views/ImpactMetricViewsEmptyState/ImpactMetricViewsEmptyState';
import { useGoalViewData } from './hooks/useGoalViewData';
import { useImpactMetricViews } from './hooks/useImpactMetricViews';
import { useWindowFlagEvents } from './hooks/useWindowFlagEvents';
import { deriveDateRange, filterEventsToWindow } from './hooks/windowEvents';
import { dummyWindowFlagEvents } from './hooks/dummyWindowFlagEvents';
import { TIME_RANGE_LABELS } from './constants';
import type { MetricView } from './views/types';
import type { TimeWindow } from 'component/impact-metrics/MultimetricChart/types';

type ViewInput = Omit<MetricView, 'id' | 'createdAt' | 'updatedAt'>;

type EditorState =
    | { type: 'closed' }
    | { type: 'create' }
    | { type: 'edit'; view: MetricView };

const ActiveView: FC<{ view: MetricView }> = ({ view }) => {
    const data = useGoalViewData(view);
    const timeLabel = TIME_RANGE_LABELS[view.timeRange];
    const goalAggregationMode =
        view.metrics.find((metric) => metric.goal)?.aggregationMode ?? 'avg';

    const [selection, setSelection] = useState<TimeWindow | null>(null);
    const [highlightedFlipMs, setHighlightedFlipMs] = useState<number | null>(
        null,
    );

    // All flag flips (not just followed) covering the visible window's date
    // range; the brush narrows to the exact window client-side. The range is
    // null until the chart window loads (start/end arrive empty at first).
    const dateRange = deriveDateRange(data.start, data.end);
    const windowFlags = useWindowFlagEvents(view.environment, dateRange);

    // TEMPORARY: dev-only preview events so the brush + popover show populated
    // rows in the sandbox. Remove with `dummyWindowFlagEvents.ts`.
    const allWindowEvents =
        import.meta.env.DEV && dateRange && windowFlags.events.length === 0
            ? dummyWindowFlagEvents(
                  Number.parseInt(data.start, 10) * 1000,
                  Number.parseInt(data.end, 10) * 1000,
                  view.environment,
              )
            : windowFlags.events;

    const windowSummary = useMemo(
        () =>
            selection
                ? computeWindowSummary({
                      goalSeries: data.goalSeries,
                      aggregationMode: goalAggregationMode,
                      window: selection,
                  })
                : null,
        [selection, data.goalSeries, goalAggregationMode],
    );

    // Per-flip goal Δ around each flag change in the window (works for
    // unfollowed flags too), ranked by |Δ%| — the meaningful per-row signal.
    const windowImpacts = useMemo(() => {
        if (!selection) return [];
        const events = filterEventsToWindow(allWindowEvents, selection);
        return computeFlagImpacts({
            events,
            goalSeries: data.goalSeries,
            aggregationMode: goalAggregationMode,
            visibleWindow: {
                minMs: selection.fromMs,
                maxMs: selection.toMs,
                rangeMs: selection.toMs - selection.fromMs,
            },
            timeRange: view.timeRange,
        });
    }, [
        selection,
        allWindowEvents,
        data.goalSeries,
        goalAggregationMode,
        view.timeRange,
    ]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <MultimetricChartCard
                title={data.goalLabel}
                subtitle={`Goal · ${timeLabel}`}
                timeRange={view.timeRange}
                aggregationMode={view.metrics[0]?.aggregationMode}
                stepSeries={data.stepSeries}
                stepTotals={data.stepTotals}
                featureEvents={data.featureEvents}
                start={data.start}
                end={data.end}
                loading={data.loading}
                chartHeightSpacing={{ base: 48, lg: 40, sm: 32 }}
                totalsLabel='Signals'
                selection={selection}
                onSelectionChange={setSelection}
                highlightedFlipMs={highlightedFlipMs}
                renderSelectionPopover={(anchorEl, isDragging) =>
                    selection && windowSummary ? (
                        <BrushSelectionPopover
                            anchorEl={anchorEl}
                            open={!isDragging}
                            selection={selection}
                            summary={windowSummary}
                            impacts={windowImpacts}
                            onClear={() => setSelection(null)}
                            onHoverFlip={setHighlightedFlipMs}
                        />
                    ) : null
                }
                totalsHeaderSlot={
                    data.goalSummary ? (
                        <GoalSummaryPanel
                            goalMetricLabel={data.goalLabel}
                            summary={data.goalSummary}
                            series={data.goalSeries}
                            timeLabel={timeLabel}
                        />
                    ) : null
                }
                totalsMiddleSlot={
                    <TopMoversPanel
                        impacts={data.flagImpacts}
                        timeRange={view.timeRange}
                        aggregationMode={goalAggregationMode}
                    />
                }
            />
            <FollowedFeaturesList features={data.resolvedFeatures} />
        </Box>
    );
};

export const ImpactViewsPage: FC = () => {
    const {
        views,
        activeView,
        activeViewId,
        setActiveViewId,
        addView,
        updateView,
        deleteView,
        duplicateView,
    } = useImpactMetricViews();
    const [editor, setEditor] = useState<EditorState>({ type: 'closed' });
    const [pendingDelete, setPendingDelete] = useState<MetricView | null>(null);

    const openCreate = () => setEditor({ type: 'create' });
    const openEdit = (view: MetricView) => setEditor({ type: 'edit', view });
    const closeEditor = () => setEditor({ type: 'closed' });

    const saveView = (input: ViewInput) => {
        if (editor.type === 'edit') {
            updateView(editor.view.id, input);
        } else {
            addView(input);
        }
        closeEditor();
    };

    const confirmDelete = () => {
        if (pendingDelete) deleteView(pendingDelete.id);
        setPendingDelete(null);
    };

    return (
        <Box sx={{ pt: 3, mt: -4 }}>
            {views.length === 0 ? (
                <ImpactMetricViewsEmptyState onCreate={openCreate} />
            ) : (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                    }}
                >
                    <PageHeader
                        title='Impact views'
                        actions={<Badge color='info'>Internal beta</Badge>}
                    />
                    <ViewSwitcher
                        views={views}
                        activeViewId={activeViewId}
                        onSelect={setActiveViewId}
                        onCreate={openCreate}
                        onEdit={openEdit}
                        onDuplicate={(view) => duplicateView(view.id)}
                        onDelete={setPendingDelete}
                    />
                    {activeView ? (
                        <ActiveView key={activeView.id} view={activeView} />
                    ) : null}
                </Box>
            )}

            <ViewEditorDialog
                open={editor.type !== 'closed'}
                initialView={editor.type === 'edit' ? editor.view : null}
                onClose={closeEditor}
                onSave={saveView}
            />

            <Dialogue
                open={pendingDelete !== null}
                title={
                    pendingDelete
                        ? `Delete "${pendingDelete.title}"?`
                        : 'Delete view?'
                }
                primaryButtonText='Delete'
                secondaryButtonText='Cancel'
                onClick={confirmDelete}
                onClose={() => setPendingDelete(null)}
            />
        </Box>
    );
};
