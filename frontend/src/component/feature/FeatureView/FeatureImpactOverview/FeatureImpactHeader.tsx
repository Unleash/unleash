import type { FC } from 'react';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { Button, Collapse, styled, Typography } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Add from '@mui/icons-material/Add';
import { useFeatureImpactMetrics } from 'hooks/api/getters/useFeatureImpactMetrics/useFeatureImpactMetrics';
import { CompactChartCard } from './CompactChartCard';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useTrackFlagpageImpactMetrics } from 'component/impact-metrics/useImpactMetricsFunnel';
import {
    MultimetricChartCard,
    type MultimetricChartCardProps,
} from './MultimetricChartCard';

// Dev-only seed to verify the new presentational card renders in isolation.
// Will be removed once the data container lands on a follow-up branch.
const makeDummyStepSeries = (
    stepIndex: number,
    baseScale: number,
): [number, number][] => {
    const now = Math.floor(Date.now() / 1000);
    const intervalSec = 60 * 60;
    const points: [number, number][] = [];
    for (let i = 24; i >= 0; i--) {
        const ts = now - i * intervalSec;
        const hour = new Date(ts * 1000).getHours();
        const diurnal =
            hour >= 9 && hour <= 17
                ? 0.4 + Math.sin(((hour - 9) / 8) * Math.PI) * 0.6
                : hour >= 6 && hour < 9
                  ? 0.3
                  : hour > 17 && hour <= 22
                    ? 0.5
                    : 0.1;
        const noise = 0.75 + Math.sin(ts / 1000 + stepIndex) * 0.25;
        points.push([ts, Math.round(baseScale * diurnal * noise)]);
    }
    return points;
};

const DUMMY_MULTIMETRIC_PROPS: MultimetricChartCardProps = {
    title: 'Checkout flow',
    timeRange: 'day',
    stepCount: 5,
    stepTotals: [
        {
            label: 'Viewed checkout',
            value: 1204,
            previousStepPercentage: null,
        },
        {
            label: 'Added payment',
            value: 720,
            previousStepPercentage: 59.8,
        },
        {
            label: 'Applied coupon',
            value: 512,
            previousStepPercentage: 71.1,
        },
        {
            label: 'Purchased',
            value: 360,
            previousStepPercentage: 70.3,
        },
        {
            label: 'Rated purchase',
            value: 84,
            previousStepPercentage: 23.3,
        },
    ],
    stepSeries: [
        { label: 'Viewed checkout', data: makeDummyStepSeries(0, 50) },
        { label: 'Added payment', data: makeDummyStepSeries(1, 30) },
        { label: 'Applied coupon', data: makeDummyStepSeries(2, 22) },
        { label: 'Purchased', data: makeDummyStepSeries(3, 15) },
        { label: 'Rated purchase', data: makeDummyStepSeries(4, 4) },
    ],
    featureEvents: [
        {
            id: 1,
            timestamp: Date.now() - 6 * 3600 * 1000,
            type: 'feature-environment-enabled',
            label: 'Enabled',
            createdBy: 'alice@company.io',
        },
        {
            id: 2,
            timestamp: Date.now() - 2 * 3600 * 1000,
            type: 'feature-environment-disabled',
            label: 'Disabled',
            createdBy: 'bob@company.io',
        },
    ],
    start: String(Math.floor((Date.now() - 24 * 3600 * 1000) / 1000)),
    end: String(Math.floor(Date.now() / 1000)),
    href: '/projects/default/features/demo/metrics',
};

const StyledContainer = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${theme.palette.divider}`,
}));

const StyledHeaderBar = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2, 3),
    minHeight: theme.spacing(8),
    cursor: 'pointer',
}));

const StyledImpactSection = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
}));

const StyledRightSection = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    color: theme.palette.action.active,
}));

const StyledImpactLabel = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    minHeight: theme.spacing(5),
}));

const StyledImpactTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
}));

const StyledChartCount = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

const StyledExpandedContent = styled('div')(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    backgroundColor: theme.palette.background.elevation2,
}));

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

const StyledConnectButton = styled(Button)({
    textTransform: 'none',
    whiteSpace: 'nowrap',
    flexShrink: 0,
});

const StyledFooter = styled('div')(({ theme }) => ({
    padding: theme.spacing(2, 3, 2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    background: theme.palette.background.elevation1,
    borderTop: `1px solid ${theme.palette.divider}`,
}));

interface FeatureImpactHeaderProps {
    projectId: string;
    featureName: string;
    onAddChart: () => void;
}

export const FeatureImpactHeader: FC<FeatureImpactHeaderProps> = ({
    projectId,
    featureName,
    onAddChart,
}) => {
    const [impactMetricsAccordionState, setImpactMetricsAccordionState] =
        useLocalStorageState<'open' | 'closed'>(
            'impact-metrics-accordion:expanded',
            'closed',
        );
    const { trackEvent } = usePlausibleTracker();
    const { trackAccordionOpened, trackAddMetricClicked } =
        useTrackFlagpageImpactMetrics();

    const { impactMetrics } = useFeatureImpactMetrics({
        projectId,
        featureName,
    });

    const expanded = impactMetricsAccordionState === 'open';
    const chartCount = impactMetrics.configs.length;
    const hasMetrics = chartCount > 0;

    const toggleExpanded = () => {
        if (!expanded) {
            trackEvent('flagpage-impact-metrics', {
                props: { eventType: 'impact-accordion-opened' },
            });
            trackAccordionOpened();
        }
        setImpactMetricsAccordionState(expanded ? 'closed' : 'open');
    };
    const onHeaderKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
        }
    };

    if (!hasMetrics) {
        return (
            <StyledContainer>
                <StyledHeaderBar
                    role='button'
                    tabIndex={0}
                    aria-expanded={expanded}
                    aria-label='Toggle impact metrics details'
                    onClick={toggleExpanded}
                    onKeyDown={onHeaderKeyDown}
                >
                    <StyledImpactLabel>
                        <StyledImpactTitle>
                            Measure the impact of this feature
                        </StyledImpactTitle>
                        <Badge color='success' sx={{ ml: 1 }}>
                            New
                        </Badge>
                    </StyledImpactLabel>
                    <StyledRightSection sx={{ marginLeft: 'auto' }}>
                        <StyledConnectButton
                            variant='outlined'
                            startIcon={<Add />}
                            onClick={(e) => {
                                e.stopPropagation();
                                trackEvent('flagpage-impact-metrics', {
                                    props: {
                                        eventType: 'add-impact-metric-clicked',
                                    },
                                });
                                trackAddMetricClicked();
                                onAddChart();
                            }}
                        >
                            Add impact metric
                        </StyledConnectButton>
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </StyledRightSection>
                </StyledHeaderBar>
                <Collapse in={expanded}>
                    <StyledExpandedContent>
                        <MultimetricChartCard {...DUMMY_MULTIMETRIC_PROPS} />
                    </StyledExpandedContent>
                </Collapse>
            </StyledContainer>
        );
    }

    return (
        <StyledContainer>
            <StyledHeaderBar
                role='button'
                tabIndex={0}
                aria-expanded={expanded}
                aria-label='Toggle impact metrics details'
                onClick={toggleExpanded}
                onKeyDown={onHeaderKeyDown}
            >
                <StyledImpactLabel>
                    <StyledImpactTitle>Impact metrics</StyledImpactTitle>
                </StyledImpactLabel>
                <StyledRightSection sx={{ marginLeft: 'auto' }}>
                    <StyledImpactSection>
                        <StyledChartCount>
                            {chartCount} chart{chartCount !== 1 ? 's' : ''}
                        </StyledChartCount>
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </StyledImpactSection>
                </StyledRightSection>
            </StyledHeaderBar>

            <Collapse in={expanded}>
                <StyledExpandedContent>
                    <StyledChartRow>
                        {impactMetrics.configs.map((config) => (
                            <CompactChartCard
                                key={config.id}
                                config={config}
                                projectId={projectId}
                                featureName={featureName}
                            />
                        ))}
                    </StyledChartRow>
                    <MultimetricChartCard {...DUMMY_MULTIMETRIC_PROPS} />
                </StyledExpandedContent>
                <StyledFooter>
                    <Button
                        variant='outlined'
                        startIcon={<Add />}
                        onClick={(e) => {
                            e.stopPropagation();
                            trackEvent('flagpage-impact-metrics', {
                                props: {
                                    eventType: 'add-impact-metric-clicked',
                                },
                            });
                            trackAddMetricClicked();
                            onAddChart();
                        }}
                        sx={{ textTransform: 'none', marginLeft: 'auto' }}
                    >
                        Add impact metric
                    </Button>
                </StyledFooter>
            </Collapse>
        </StyledContainer>
    );
};
