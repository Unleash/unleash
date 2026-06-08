import { useState, type FC } from 'react';
import { styled } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import type { ChartTimeRange } from 'component/impact-metrics/MultimetricChart/chartConfig';
import { createUuid } from 'utils/createUuid';
import useToast from 'hooks/useToast';
import { GoalSummaryPanel } from './views/GoalSummaryPanel/GoalSummaryPanel';
import { MultimetricChartCard } from './views/MultimetricChartCard/MultimetricChartCard';
import { FollowedFeaturesList } from './views/FollowedFeaturesList/FollowedFeaturesList';
import { ViewSwitcher } from './views/ViewSwitcher/ViewSwitcher';
import { ViewEditorDialog } from './views/ViewEditorDialog/ViewEditorDialog';
import { useGoalViewData } from './hooks/useGoalViewData';
import { DUMMY_VIEWS } from './fixtures/goalViewConfig';
import type { MetricView } from './views/types';

type ViewInput = Omit<MetricView, 'id' | 'createdAt' | 'updatedAt'>;

type EditorState =
    | { kind: 'closed' }
    | { kind: 'create' }
    | { kind: 'edit'; view: MetricView };

const TIME_RANGE_LABELS: Record<ChartTimeRange, string> = {
    hour: 'Last hour',
    day: 'Last 24 hours',
    week: 'Last 7 days',
    month: 'Last 30 days',
};

const StyledWrapper = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(2),
}));

const StyledCard = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

const StyledFeatures = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

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
            const edited = editor.view;
            setViews((current) =>
                current.map((candidate) =>
                    candidate.id === edited.id
                        ? { ...edited, ...input }
                        : candidate,
                ),
            );
        } else {
            const created: MetricView = {
                ...input,
                id: createUuid(),
                createdAt: 0,
                updatedAt: 0,
            };
            setViews((current) => [...current, created]);
            setActiveViewId(created.id);
        }
        closeEditor();
    };

    return (
        <StyledWrapper>
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
            <StyledCard>
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
            </StyledCard>
            <StyledFeatures>
                <FollowedFeaturesList features={data.resolvedFeatures} />
            </StyledFeatures>
        </StyledWrapper>
    );
};
