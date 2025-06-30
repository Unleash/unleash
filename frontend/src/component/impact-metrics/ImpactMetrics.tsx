import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { PageHeader } from 'component/common/PageHeader/PageHeader.tsx';
import { useImpactMetricsMetadata } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { ChartConfigModal } from './ChartConfigModal.tsx';
import { ChartItem } from './ChartItem.tsx';
import { useUrlState } from './hooks/useUrlState.ts';
import type { ChartConfig } from './types.ts';

export const ImpactMetrics: FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingChart, setEditingChart] = useState<ChartConfig | undefined>();

    const { charts, addChart, updateChart, deleteChart } = useUrlState();

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
                    charts.length > 0 ? (
                        <Button
                            variant='contained'
                            startIcon={<Add />}
                            onClick={handleAddChart}
                            disabled={metadataLoading || !!hasError}
                        >
                            Add Chart
                        </Button>
                    ) : null
                }
            />
            <Box
                sx={(theme) => ({
                    display: 'flex',
                    flexDirection: 'column',
                    gap: theme.spacing(2),
                    width: '100%',
                })}
            >
                {charts.length === 0 && !metadataLoading && !hasError ? (
                    <Box
                        sx={(theme) => ({
                            textAlign: 'center',
                            py: theme.spacing(8),
                        })}
                    >
                        <Typography variant='h6' gutterBottom>
                            No charts configured
                        </Typography>
                        <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mb: 3 }}
                        >
                            Add your first impact metrics chart to start
                            tracking performance
                        </Typography>
                        <Button
                            variant='contained'
                            startIcon={<Add />}
                            onClick={handleAddChart}
                            disabled={metadataLoading || !!hasError}
                        >
                            Add Chart
                        </Button>
                    </Box>
                ) : (
                    charts.map((config) => (
                        <ChartItem
                            key={config.id}
                            config={config}
                            onEdit={handleEditChart}
                            onDelete={deleteChart}
                        />
                    ))
                )}

                <ChartConfigModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSaveChart}
                    initialConfig={editingChart}
                    metricSeries={metricSeries}
                    loading={metadataLoading}
                />
            </Box>
        </>
    );
};
