import { Button, styled } from '@mui/material';
import Add from '@mui/icons-material/Add';
import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined';
import { PlaceholderChart } from './ImpactDashboard/PlaceholderChart';
import { useEventTracker } from 'hooks/useEventTracker';
import { useTrackFlagpageImpactMetrics } from 'component/impact-metrics/useImpactMetricsFunnel';
import { FeatureSetupGuideBanner } from '../FeatureOverview/FeatureSetupGuideBanner/FeatureSetupGuideBanner';

const StyledChartRow = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(2),
    [theme.breakpoints.down('lg')]: {
        gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr',
    },
}));

interface ImpactMetricsEmptyStateProps {
    onAddChart: () => void;
    onDismiss: () => void;
}

export const ImpactMetricsEmptyState = ({
    onAddChart,
    onDismiss,
}: ImpactMetricsEmptyStateProps) => {
    const { trackEvent } = useEventTracker();
    const { trackAddMetricClicked } = useTrackFlagpageImpactMetrics();

    return (
        <FeatureSetupGuideBanner
            variant='info'
            icon={<LightbulbOutlined />}
            aria-label='Measure the impact of this flag'
            title='Tip: Measure the impact of this flag'
            subtitle='Connect your metrics to see how this feature affects adoption, error counts, latency, and other key indicators during rollout.'
            actions={
                <>
                    <Button
                        variant='outlined'
                        startIcon={<Add />}
                        onClick={() => {
                            trackEvent('flagpage-impact-metrics', {
                                props: {
                                    eventType: 'add-impact-metric-clicked',
                                },
                            });
                            trackAddMetricClicked();
                            onAddChart();
                        }}
                        sx={{ textTransform: 'none' }}
                    >
                        Add impact metric
                    </Button>
                    <Button variant='text' onClick={onDismiss}>
                        Dismiss
                    </Button>
                </>
            }
        >
            <StyledChartRow>
                <PlaceholderChart
                    title='Adoption'
                    change='+1,204'
                    variant='upward'
                />
                <PlaceholderChart
                    title='Errors'
                    change='3'
                    variant='downward'
                />
                <PlaceholderChart
                    title='Latency (p95)'
                    change='~230ms'
                    variant='stable'
                />
            </StyledChartRow>
        </FeatureSetupGuideBanner>
    );
};
