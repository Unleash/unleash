import type { FC } from 'react';
import { useMemo, useState, useCallback } from 'react';
import { Typography, Button, Paper, styled } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { PageHeader } from 'component/common/PageHeader/PageHeader.tsx';
import { useImpactMetricsMetadata } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { ChartConfigModal } from './ChartConfigModal/ChartConfigModal.tsx';
import { ChartItem } from './ChartItem.tsx';
import { GridLayoutWrapper, type GridItem } from './GridLayoutWrapper.tsx';
import { useImpactMetricsState } from './hooks/useImpactMetricsState.ts';
import type { ChartConfig, LayoutItem } from './types.ts';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import PermissionButton from 'component/common/PermissionButton/PermissionButton.tsx';
import { ADMIN } from '../providers/AccessProvider/permissions.ts';

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
    const { setToastApiError } = useToast();

    const {
        charts,
        layout,
        loading: settingsLoading,
        error: settingsError,
        addChart,
        updateChart,
        deleteChart,
        updateLayout,
    } = useImpactMetricsState();

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

    const handleSaveChart = async (config: Omit<ChartConfig, 'id'>) => {
        try {
            if (editingChart) {
                await updateChart(editingChart.id, config);
            } else {
                await addChart(config);
            }
            setModalOpen(false);
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const handleLayoutChange = useCallback(
        async (layout: any[]) => {
            try {
                await updateLayout(layout as LayoutItem[]);
            } catch (error) {
                setToastApiError(formatUnknownError(error));
            }
        },
        [updateLayout, setToastApiError],
    );

    const handleDeleteChart = useCallback(
        async (id: string) => {
            try {
                await deleteChart(id);
            } catch (error) {
                setToastApiError(formatUnknownError(error));
            }
        },
        [deleteChart],
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
                            onDelete={handleDeleteChart}
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
        [charts, layout, handleEditChart, handleDeleteChart],
    );

    const hasError = metadataError || settingsError;
    const isLoading = metadataLoading || settingsLoading;

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
                    <PermissionButton
                        variant='contained'
                        startIcon={<Add />}
                        onClick={handleAddChart}
                        disabled={isLoading || !!hasError}
                        permission={ADMIN}
                    >
                        Add Chart
                    </PermissionButton>
                }
            />

            {charts.length === 0 && !isLoading && !hasError ? (
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
                        disabled={isLoading || !!hasError}
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
                loading={metadataLoading || settingsLoading}
            />
        </>
    );
};
