import { useState, type FC } from 'react';
import { styled, Typography } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import useToast from 'hooks/useToast';
import { ViewSwitcher } from './ViewSwitcher';
import { ViewEditorDialog } from './ViewEditorDialog';
import { ViewChart } from './ViewChart';
import { ImpactMetricViewsEmptyState } from './ImpactMetricViewsEmptyState';
import { useImpactMetricViews } from './useImpactMetricViews';
import type { MetricView } from './types';

const StyledHeaderRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(2),
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

const StyledChartArea = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

export const ImpactMetricViews: FC = () => {
    const { setToastData } = useToast();
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

    const [editorOpen, setEditorOpen] = useState(false);
    const [editingView, setEditingView] = useState<MetricView | null>(null);

    const openCreate = () => {
        setEditingView(null);
        setEditorOpen(true);
    };

    const openEdit = (view: MetricView) => {
        setEditingView(view);
        setEditorOpen(true);
    };

    const handleSave = (
        input: Omit<MetricView, 'id' | 'createdAt' | 'updatedAt'>,
    ) => {
        if (editingView) {
            updateView(editingView.id, input);
            setToastData({
                type: 'success',
                text: `View "${input.title}" updated`,
            });
        } else {
            const created = addView(input);
            setToastData({
                type: 'success',
                text: `View "${created.title}" created`,
            });
        }
        setEditorOpen(false);
    };

    const handleDelete = (view: MetricView) => {
        const confirmed = window.confirm(
            `Delete view "${view.title}"? This can't be undone.`,
        );
        if (!confirmed) return;
        deleteView(view.id);
        setToastData({
            type: 'success',
            text: `View "${view.title}" deleted`,
        });
    };

    const handleDuplicate = (view: MetricView) => {
        const created = duplicateView(view.id);
        if (created) {
            setToastData({
                type: 'success',
                text: `View "${created.title}" created`,
            });
        }
    };

    if (views.length === 0) {
        return (
            <>
                <ImpactMetricViewsEmptyState onCreate={openCreate} />
                <ViewEditorDialog
                    open={editorOpen}
                    initialView={editingView}
                    onClose={() => setEditorOpen(false)}
                    onSave={handleSave}
                />
            </>
        );
    }

    return (
        <>
            <StyledHeaderRow>
                <PageHeader
                    title='Impact metrics'
                    titleElement={
                        <Typography variant='h1' component='span'>
                            Impact metrics
                        </Typography>
                    }
                />
                <StyledSubtitle>
                    Follow a set of features and their impact metrics together
                    on a single chart.
                </StyledSubtitle>
            </StyledHeaderRow>

            <ViewSwitcher
                views={views}
                activeViewId={activeViewId}
                onSelect={setActiveViewId}
                onCreate={openCreate}
                onEdit={openEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
            />

            <StyledChartArea>
                {activeView ? (
                    <ViewChart view={activeView} />
                ) : (
                    <Typography sx={{ color: 'text.secondary' }}>
                        Select a view above, or create a new one.
                    </Typography>
                )}
            </StyledChartArea>

            <ViewEditorDialog
                open={editorOpen}
                initialView={editingView}
                onClose={() => setEditorOpen(false)}
                onSave={handleSave}
            />
        </>
    );
};
