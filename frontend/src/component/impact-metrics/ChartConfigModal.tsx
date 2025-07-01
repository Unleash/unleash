import type { FC } from 'react';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    styled,
} from '@mui/material';
import { ImpactMetricsControls } from './ImpactMetricsControls/ImpactMetricsControls.tsx';
import { ImpactMetricsChartPreview } from './ImpactMetricsChartPreview.tsx';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import type { ChartConfig } from './types.ts';
import type { ImpactMetricsSeries } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';

export const StyledConfigPanel = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    [theme.breakpoints.down('lg')]: {
        flex: 'none',
    },
    [theme.breakpoints.up('lg')]: {
        flex: '0 0 400px',
    },
}));

export const StyledPreviewPanel = styled(Box)(({ theme }) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    [theme.breakpoints.down('lg')]: {
        minHeight: '300px',
    },
    [theme.breakpoints.up('lg')]: {
        minHeight: '400px',
    },
}));

export interface ChartConfigModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (config: Omit<ChartConfig, 'id'>) => void;
    initialConfig?: ChartConfig;
    metricSeries: (ImpactMetricsSeries & { name: string })[];
    loading?: boolean;
}

export const ChartConfigModal: FC<ChartConfigModalProps> = ({
    open,
    onClose,
    onSave,
    initialConfig,
    metricSeries,
    loading = false,
}) => {
    const [title, setTitle] = useState(initialConfig?.title || '');
    const [selectedSeries, setSelectedSeries] = useState(
        initialConfig?.selectedSeries || '',
    );
    const [selectedRange, setSelectedRange] = useState<
        'hour' | 'day' | 'week' | 'month'
    >(initialConfig?.selectedRange || 'day');
    const [beginAtZero, setBeginAtZero] = useState(
        initialConfig?.beginAtZero || false,
    );
    const [selectedLabels, setSelectedLabels] = useState<
        Record<string, string[]>
    >(initialConfig?.selectedLabels || {});

    const {
        data: { labels: currentAvailableLabels },
    } = useImpactMetricsData(
        selectedSeries
            ? {
                  series: selectedSeries,
                  range: selectedRange,
              }
            : undefined,
    );

    useEffect(() => {
        if (open && initialConfig) {
            setTitle(initialConfig.title || '');
            setSelectedSeries(initialConfig.selectedSeries);
            setSelectedRange(initialConfig.selectedRange);
            setBeginAtZero(initialConfig.beginAtZero);
            setSelectedLabels(initialConfig.selectedLabels);
        } else if (open && !initialConfig) {
            setTitle('');
            setSelectedSeries('');
            setSelectedRange('day');
            setBeginAtZero(false);
            setSelectedLabels({});
        }
    }, [open, initialConfig]);

    const handleSave = () => {
        if (!selectedSeries) return;

        onSave({
            title: title || undefined,
            selectedSeries,
            selectedRange,
            beginAtZero,
            selectedLabels,
        });
        onClose();
    };

    const handleSeriesChange = (series: string) => {
        setSelectedSeries(series);
        setSelectedLabels({});
    };

    const isValid = selectedSeries.length > 0;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth='lg'
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    minHeight: '600px',
                    maxHeight: '90vh',
                },
            }}
        >
            <DialogTitle>
                {initialConfig ? 'Edit Chart' : 'Add New Chart'}
            </DialogTitle>
            <DialogContent>
                <Box
                    sx={(theme) => ({
                        display: 'flex',
                        flexDirection: { xs: 'column', lg: 'row' },
                        gap: theme.spacing(3),
                        pt: theme.spacing(1),
                        height: '100%',
                    })}
                >
                    <StyledConfigPanel>
                        <TextField
                            label='Chart Title (optional)'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            fullWidth
                            variant='outlined'
                            size='small'
                        />

                        <ImpactMetricsControls
                            selectedSeries={selectedSeries}
                            onSeriesChange={handleSeriesChange}
                            selectedRange={selectedRange}
                            onRangeChange={setSelectedRange}
                            beginAtZero={beginAtZero}
                            onBeginAtZeroChange={setBeginAtZero}
                            metricSeries={metricSeries}
                            loading={loading}
                            selectedLabels={selectedLabels}
                            onLabelsChange={setSelectedLabels}
                            availableLabels={currentAvailableLabels}
                        />
                    </StyledConfigPanel>
                    <StyledPreviewPanel>
                        <ImpactMetricsChartPreview
                            selectedSeries={selectedSeries}
                            selectedRange={selectedRange}
                            selectedLabels={selectedLabels}
                            beginAtZero={beginAtZero}
                        />
                    </StyledPreviewPanel>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSave}
                    variant='contained'
                    disabled={!isValid}
                >
                    {initialConfig ? 'Update' : 'Add Chart'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
