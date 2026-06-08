import { useState, type FC } from 'react';
import { Box } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { createUuid } from 'utils/createUuid';
import useToast from 'hooks/useToast';
import { GoalSummaryPanel } from './views/GoalSummaryPanel/GoalSummaryPanel';
import { MultimetricChartCard } from './views/MultimetricChartCard/MultimetricChartCard';
import { FollowedFeaturesList } from './views/FollowedFeaturesList/FollowedFeaturesList';
import { ViewSwitcher } from './views/ViewSwitcher/ViewSwitcher';
import { ViewEditorDialog } from './views/ViewEditorDialog/ViewEditorDialog';
import { useGoalViewData } from './hooks/useGoalViewData';
import { DUMMY_VIEWS } from './fixtures/goalViewConfig';
import { TIME_RANGE_LABELS } from './constants';
import type { MetricView } from './views/types';

type ViewInput = Omit<MetricView, 'id' | 'createdAt' | 'updatedAt'>;

type EditorState =
    | { kind: 'closed' }
    | { kind: 'create' }
    | { kind: 'edit'; view: MetricView };

const createView = (input: ViewInput): MetricView => ({
    ...input,
    id: createUuid(),
    createdAt: 0,
    updatedAt: 0,
});

const replaceView = (views: MetricView[], id: string, input: ViewInput) =>
    views.map((view) => (view.id === id ? { ...view, ...input } : view));

export const ImpactViewsPage: FC = () => {
    const { setToastData } = useToast();
    const [views, setViews] = useState<MetricView[]>(DUMMY_VIEWS);
    const [activeViewId, setActiveViewId] = useState(DUMMY_VIEWS[0].id);
    const [editor, setEditor] = useState<EditorState>({ kind: 'closed' });

    const view =
        views.find((candidate) => candidate.id === activeViewId) ?? views[0];
    const data = useGoalViewData(view);
    const timeLabel = TIME_RANGE_LABELS[view.timeRange];

    const comingSoon = () =>
        setToastData({ type: 'success', text: 'Coming soon' });

    const openCreate = () => setEditor({ kind: 'create' });
    const openEdit = (view: MetricView) => setEditor({ kind: 'edit', view });
    const closeEditor = () => setEditor({ kind: 'closed' });

    const saveView = (input: ViewInput) => {
        if (editor.kind === 'edit') {
            setViews((views) => replaceView(views, editor.view.id, input));
        } else {
            const created = createView(input);
            setViews((views) => [...views, created]);
            setActiveViewId(created.id);
        }
        closeEditor();
    };

    return (
        <Box sx={{ pt: 2 }}>
            <PageHeader title='Impact views' />
            <ViewSwitcher
                views={views}
                activeViewId={activeViewId}
                onSelect={setActiveViewId}
                onCreate={openCreate}
                onEdit={openEdit}
                onDuplicate={comingSoon}
                onDelete={comingSoon}
            />
            <ViewEditorDialog
                open={editor.kind !== 'closed'}
                initialView={editor.kind === 'edit' ? editor.view : null}
                onClose={closeEditor}
                onSave={saveView}
            />
            <Box sx={{ mt: 3 }}>
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
                    totalsLabel='Goal'
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
                />
            </Box>
            <Box sx={{ mt: 3 }}>
                <FollowedFeaturesList features={data.resolvedFeatures} />
            </Box>
        </Box>
    );
};
