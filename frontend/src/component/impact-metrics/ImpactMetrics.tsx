import type { FC } from 'react';
import { useMemo, useState, useCallback } from 'react';
import { Typography, Button, Paper, styled } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { PageHeader } from 'component/common/PageHeader/PageHeader.tsx';
import { useImpactMetricsMetadata } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { ChartConfigModal } from './ChartConfigModal.tsx';
import { ChartItem } from './ChartItem.tsx';
import { GridLayoutWrapper, type GridItem } from './GridLayoutWrapper.tsx';
import { useImpactMetricsState } from './hooks/useImpactMetricsState.ts';
import type { ChartConfig, LayoutItem } from './types.ts';

const StyledEmptyState = styled(Paper)(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(8),
    backgroundColor: theme.palette.background.default,
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    boxShadow: 'none',
}));

export const ImpactMetrics: FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingChart, setEditingChart] = useState<ChartConfig | undefined>();

    const { charts, layout, addChart, updateChart, deleteChart, updateLayout } =
        useImpactMetricsState();

    const {
        metadata,
        loading: metadataLoading,
        error: metadataError,
    } = useImpactMetricsMetadata();

    const metricSeries = useMemo(() => {
        if (!metadata?.series) {
            return [];
        }
        return Object.entries(metadata.series).map(([name, rest]) => ({
            name,
            ...rest,
        }));
    }, [metadata]);

    const handleAddChart = () => {
        setEditingChart(undefined);
        setModalOpen(true);
    };

    const handleEditChart = (config: ChartConfig) => {
        setEditingChart(config);
        setModalOpen(true);
    };

    const handleSaveChart = (config: Omit<ChartConfig, 'id'>) => {
        if (editingChart) {
            updateChart(editingChart.id, config);
        } else {
            addChart(config);
        }
        setModalOpen(false);
    };

    const handleLayoutChange = useCallback(
        (layout: any[]) => {
            updateLayout(layout as LayoutItem[]);
        },
        [updateLayout],
    );

    const gridItems: GridItem[] = useMemo(
        () =>
            charts.map((config, index) => {
                const existingLayout = layout?.find(
                    (item) => item.i === config.id,
                );
                return {
                    id: config.id,
                    component: (
                        <ChartItem
                            config={config}
                            onEdit={handleEditChart}
                            onDelete={deleteChart}
                        />
                    ),
                    w: existingLayout?.w ?? 6,
                    h: existingLayout?.h ?? 4,
                    x: existingLayout?.x,
                    y: existingLayout?.y,
                    minW: 4,
                    minH: 2,
                    maxW: 12,
                    maxH: 8,
                };
            }),
        [charts, layout, handleEditChart, deleteChart],
    );

    const hasError = metadataError;

    return (
        <>
            <PageHeader
                title='Impact Metrics'
                titleElement={
                    <Typography variant='h1' component='span'>
                        Impact Metrics
                    </Typography>
                }
                actions={
                    <Button
                        variant='contained'
                        startIcon={<Add />}
                        onClick={handleAddChart}
                        disabled={metadataLoading || !!hasError}
                    >
                        Add Chart
                    </Button>
                }
            />

            {charts.length === 0 && !metadataLoading && !hasError ? (
                <StyledEmptyState>
                    <Typography variant='h6' gutterBottom>
                        No charts configured
                    </Typography>
                    <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mb: 3 }}
                    >
                        Add your first impact metrics chart to start tracking
                        performance with a beautiful drag-and-drop grid layout
                    </Typography>
                    <Button
                        variant='contained'
                        startIcon={<Add />}
                        onClick={handleAddChart}
                        disabled={metadataLoading || !!hasError}
                    >
                        Add Chart
                    </Button>
                </StyledEmptyState>
            ) : charts.length > 0 ? (
                <GridLayoutWrapper
                    items={gridItems}
                    onLayoutChange={handleLayoutChange}
                />
            ) : null}

            <ChartConfigModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveChart}
                initialConfig={editingChart}
                metricSeries={metricSeries}
                loading={metadataLoading}
            />
        </>
    );
};
