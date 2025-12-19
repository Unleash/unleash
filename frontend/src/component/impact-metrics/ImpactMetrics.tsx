import { type FC, useMemo } from 'react';
import { useState, useCallback } from 'react';
import { Typography, styled, Box } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader.tsx';
import { useImpactMetricsOptions } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { ChartConfigModal } from './ChartConfigModal/ChartConfigModal.tsx';
import { ChartItem } from './ChartItem.tsx';
import { PlausibleChartItem } from './PlausibleChartItem.tsx';
import { GridLayoutWrapper, type GridItem } from './GridLayoutWrapper.tsx';
import { useImpactMetricsState } from './hooks/useImpactMetricsState.ts';
import { ImpactMetricsEmptyState } from './ImpactMetricsEmptyState.tsx';
import type { ChartConfig } from './types.ts';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import PermissionButton from 'component/common/PermissionButton/PermissionButton.tsx';
import { ADMIN } from '../providers/AccessProvider/permissions.ts';
import { useUiFlag } from 'hooks/useUiFlag';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker.ts';

const _StyledDragHandle = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    cursor: 'move',
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.secondary,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.text.primary,
    },
}));

export const ImpactMetrics: FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingChart, setEditingChart] = useState<ChartConfig | undefined>();
    const { setToastApiError } = useToast();
    const plausibleMetricsEnabled = useUiFlag('plausibleMetrics');
    const { trackEvent } = usePlausibleTracker();
    const {
        charts,
        layout,
        loading: settingsLoading,
        error: settingsError,
        addChart,
        updateChart,
        deleteChart,
    } = useImpactMetricsState();

    const {
        metricOptions,
        loading: metadataLoading,
        error: metadataError,
    } = useImpactMetricsOptions();

    const handleAddChart = () => {
        setEditingChart(undefined);
        setModalOpen(true);
        trackEvent('impact-metrics', {
            props: {
                eventType: 'global chart modal open',
            },
        });
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

    const gridItems: GridItem[] = useMemo(() => {
        const items: GridItem[] = [];

        if (plausibleMetricsEnabled) {
            const plausibleChartItem: GridItem = {
                id: 'plausible-analytics',
                component: <PlausibleChartItem />,
                w: 6,
                h: 2,
            };
            items.push(plausibleChartItem);
        }

        const impactMetricsItems: GridItem[] = charts.map((config, _index) => {
            const existingLayout = layout?.find((item) => item.i === config.id);
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
        });

        return [...items, ...impactMetricsItems];
    }, [
        charts,
        layout,
        handleEditChart,
        handleDeleteChart,
        plausibleMetricsEnabled,
    ]);

    const hasError = metadataError || settingsError;
    const isLoading = metadataLoading || settingsLoading;
    const maxChartsReached = charts.length >= 20;
    const isDisabled = isLoading || !!hasError || maxChartsReached;

    console.log(charts, isLoading, hasError);

    const showEmptyState = charts.length === 0 && !isLoading;

    return (
        <>
            {showEmptyState ? (
                <ImpactMetricsEmptyState onAddChart={handleAddChart} />
            ) : (
                <>
                    <PageHeader
                        title='Impact metrics'
                        titleElement={
                            <Typography variant='h1' component='span'>
                                Impact metrics
                            </Typography>
                        }
                        actions={
                            <PermissionButton
                                variant='contained'
                                onClick={handleAddChart}
                                disabled={isDisabled}
                                permission={ADMIN}
                                tooltipProps={
                                    maxChartsReached
                                        ? {
                                              title: 'Maximum of 20 impact metrics charts allowed',
                                              arrow: true,
                                          }
                                        : undefined
                                }
                            >
                                New chart
                            </PermissionButton>
                        }
                    />
                    {gridItems.length > 0 && (
                        <GridLayoutWrapper items={gridItems} />
                    )}
                </>
            )}

            <ChartConfigModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveChart}
                initialConfig={editingChart}
                metricSeries={metricOptions}
                loading={metadataLoading || settingsLoading}
            />
        </>
    );
};
