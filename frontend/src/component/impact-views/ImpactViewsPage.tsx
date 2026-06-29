import { useState, type FC } from 'react';
import { Box } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Badge } from 'component/common/Badge/Badge';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { GoalSummaryPanel } from './views/GoalSummaryPanel/GoalSummaryPanel';
import { MultimetricChartCard } from './views/MultimetricChartCard/MultimetricChartCard';
import { FollowedFeaturesList } from './views/FollowedFeaturesList/FollowedFeaturesList';
import { TopMoversPanel } from './views/TopMoversPanel/TopMoversPanel';
import { ViewSwitcher } from './views/ViewSwitcher/ViewSwitcher';
import { ViewEditorDialog } from './views/ViewEditorDialog/ViewEditorDialog';
import { ImpactMetricViewsEmptyState } from './views/ImpactMetricViewsEmptyState/ImpactMetricViewsEmptyState';
import { useGoalViewData } from './hooks/useGoalViewData';
import { useImpactMetricViews } from './hooks/useImpactMetricViews';
import { TIME_RANGE_LABELS } from './constants';
import type { MetricView } from './views/types';

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
                    view.showTopMovers ? (
                        <TopMoversPanel
                            impacts={data.flagImpacts}
                            timeRange={view.timeRange}
                            aggregationMode={goalAggregationMode}
                        />
                    ) : undefined
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
                    {activeView ? <ActiveView view={activeView} /> : null}
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
