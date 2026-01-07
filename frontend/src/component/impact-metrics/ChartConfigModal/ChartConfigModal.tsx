import type { FC } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    styled,
    useTheme,
    useMediaQuery,
    Divider,
} from '@mui/material';
import { ImpactMetricsControls } from './ImpactMetricsControls/ImpactMetricsControls.tsx';
import { useChartFormState } from '../hooks/useChartFormState.ts';
import type { ChartConfig } from '../types.ts';
import type { ImpactMetricsSeries } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { LabelsFilter } from './LabelFilter/LabelsFilter.tsx';
import { ImpactMetricsChart } from '../ImpactMetricsChart.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker.ts';

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
    const { formData, actions, isValid, currentAvailableLabels } =
        useChartFormState({
            open,
            initialConfig,
        });
    const theme = useTheme();
    const screenBreakpoint = useMediaQuery(theme.breakpoints.down('lg'));
    const { trackEvent } = usePlausibleTracker();

    const handleSave = () => {
        if (!isValid) return;

        onSave(actions.getConfigToSave());
        trackEvent('impact-metrics', {
            props: {
                eventType: 'chart added',
            },
        });
        onClose();
    };

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
                            value={formData.title}
                            onChange={(e) => actions.setTitle(e.target.value)}
                            fullWidth
                            variant='outlined'
                            size='small'
                        />

                        <ImpactMetricsControls
                            formData={formData}
                            actions={actions}
                            metricSeries={metricSeries}
                            loading={loading}
                        />
                    </StyledConfigPanel>
                    <StyledPreviewPanel>
                        <Box sx={(theme) => ({ padding: theme.spacing(1) })}>
                            <ImpactMetricsChart
                                key={screenBreakpoint ? 'small' : 'large'}
                                metricName={formData.metricName}
                                timeRange={formData.timeRange}
                                labelSelectors={formData.labelSelectors}
                                yAxisMin={formData.yAxisMin}
                                aggregationMode={formData.aggregationMode}
                                isPreview
                            />
                        </Box>
                    </StyledPreviewPanel>
                </Box>

                {currentAvailableLabels ? (
                    <LabelsFilter
                        labelSelectors={formData.labelSelectors}
                        onChange={actions.setLabelSelectors}
                        availableLabels={currentAvailableLabels}
                    />
                ) : null}
            </DialogContent>
            <Divider />
            <DialogActions sx={(theme) => ({ margin: theme.spacing(2, 3, 3) })}>
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
