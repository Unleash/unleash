import type { FC } from 'react';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { Button, Collapse, styled, Typography } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Add from '@mui/icons-material/Add';
import { useFeatureImpactMetrics } from 'hooks/api/getters/useFeatureImpactMetrics/useFeatureImpactMetrics';
import { PlaceholderChart } from './ImpactDashboard/PlaceholderChart';
import { CompactChartCard } from './CompactChartCard';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const StyledContainer = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
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

const StyledEmptyDescription = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    maxWidth: '100%',
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
    const [expanded, setExpanded] = useLocalStorageState<string>(
        'impact-metrics-accordion:expanded',
        'false',
    );
    const { trackEvent } = usePlausibleTracker();

    const { impactMetrics } = useFeatureImpactMetrics({
        projectId,
        featureName,
    });

    const chartCount = impactMetrics.configs.length;
    const hasMetrics = chartCount > 0;

    const toggleExpanded = () => {
        if (expanded !== 'true') {
            trackEvent('flagpage-impact-metrics', {
                props: { eventType: 'impact-accordion-opened' },
            });
        }
        setExpanded(expanded === 'true' ? 'false' : 'true');
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
                    aria-expanded={expanded === 'true'}
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
                                onAddChart();
                            }}
                        >
                            Add impact metric
                        </StyledConnectButton>
                        {expanded === 'true' ? (
                            <ExpandLessIcon />
                        ) : (
                            <ExpandMoreIcon />
                        )}
                    </StyledRightSection>
                </StyledHeaderBar>
                <Collapse in={expanded === 'true'}>
                    <StyledExpandedContent>
                        <StyledEmptyDescription>
                            Connect your metrics to see how this feature affects
                            adoption, error counts, latency, and other key
                            indicators during rollout.
                        </StyledEmptyDescription>
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
                aria-expanded={expanded === 'true'}
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
                        {expanded === 'true' ? (
                            <ExpandLessIcon />
                        ) : (
                            <ExpandMoreIcon />
                        )}
                    </StyledImpactSection>
                </StyledRightSection>
            </StyledHeaderBar>

            <Collapse in={expanded === 'true'}>
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
