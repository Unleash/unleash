import type { FC } from 'react';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { Button, Collapse, styled, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Add from '@mui/icons-material/Add';
import { useFeatureImpactMetrics } from 'hooks/api/getters/useFeatureImpactMetrics/useFeatureImpactMetrics';
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

    const { impactMetrics } = useFeatureImpactMetrics({
        projectId,
        featureName,
    });

    const expanded = impactMetricsAccordionState === 'open';
    const chartCount = impactMetrics.configs.length;

    const toggleExpanded = () => {
        if (!expanded) {
            trackEvent('flagpage-impact-metrics', {
                props: { eventType: 'impact-accordion-opened' },
            });
        }
        setImpactMetricsAccordionState(expanded ? 'closed' : 'open');
    };
    const onHeaderKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
        }
    };

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
