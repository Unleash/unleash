import { type FC, useState } from 'react';
import { Button, Collapse, styled, Typography } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Add from '@mui/icons-material/Add';
import { useFeatureImpactMetrics } from 'hooks/api/getters/useFeatureImpactMetrics/useFeatureImpactMetrics';
import { DemoImpactDashboard } from './ImpactDashboard/DemoImpactDashboard';
import { PlaceholderChart } from './ImpactDashboard/PlaceholderChart';

// Demo mode flag - set to true to see mock data
const DEMO_MODE = false;

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
    padding: theme.spacing(1.5, 3),
    minHeight: 48,
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
    marginLeft: 'auto',
    color: theme.palette.action.active,
}));

const StyledImpactLabel = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
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
}));

const StyledEmptyStateContainer = styled('div')(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2, 3),
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

const StyledEmptyTopRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    flexWrap: 'wrap',
}));

const StyledEmptyContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

const StyledEmptyTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
}));

const StyledEmptyDescription = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    maxWidth: '100%',
}));

const StyledConnectButton = styled(Button)(({ theme }) => ({
    textTransform: 'none',
    whiteSpace: 'nowrap',
    flexShrink: 0,
}));

interface FeatureImpactHeaderProps {
    projectId: string;
    featureName: string;
    onAddChart?: () => void;
}

export const FeatureImpactHeader: FC<FeatureImpactHeaderProps> = ({
    projectId,
    featureName,
    onAddChart,
}) => {
    const [expanded, setExpanded] = useState(false);

    // Fetch impact metrics count
    const { impactMetrics } = useFeatureImpactMetrics({
        projectId,
        featureName,
    });

    const chartCount = DEMO_MODE ? 2 : 0;
    const hasMetrics = chartCount > 0;

    if (!hasMetrics) {
        return (
            <StyledContainer>
                <StyledHeaderBar
                    onClick={() => setExpanded(!expanded)}
                >
                    <StyledImpactLabel>
                        <StyledImpactTitle>
                            Measure the impact of this feature
                        </StyledImpactTitle>
                        <Badge color='success' sx={{ ml: 1 }}>
                            New
                        </Badge>
                    </StyledImpactLabel>
                    <StyledRightSection>
                        <StyledConnectButton
                            variant='outlined'
                            startIcon={<Add />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddChart?.();
                            }}
                        >
                            Connect metrics
                        </StyledConnectButton>
                        {expanded ? (
                            <ExpandLessIcon />
                        ) : (
                            <ExpandMoreIcon />
                        )}
                    </StyledRightSection>
                </StyledHeaderBar>
                <Collapse in={expanded}>
                    <StyledEmptyStateContainer>
                        <StyledEmptyDescription>
                            Connect your analytics to see how this feature
                            affects conversion rates, error rates, and other
                            key metrics during rollout.
                        </StyledEmptyDescription>
                        <StyledChartRow>
                            <PlaceholderChart
                                title='Conversion Rate'
                                change='+12.4%'
                                variant='upward'
                            />
                            <PlaceholderChart
                                title='Error Rate'
                                change='-0.8%'
                                variant='downward'
                            />
                            <PlaceholderChart
                                title='Latency (ms)'
                                change='+2ms'
                                variant='stable'
                            />
                        </StyledChartRow>
                    </StyledEmptyStateContainer>
                </Collapse>
            </StyledContainer>
        );
    }

    return (
        <StyledContainer>
            <StyledHeaderBar onClick={() => setExpanded(!expanded)}>
                <StyledImpactLabel>
                    <StyledImpactTitle>Impact metrics</StyledImpactTitle>
                    <Badge color='success' sx={{ ml: 1 }}>
                        New
                    </Badge>
                </StyledImpactLabel>

                <StyledRightSection>
                    <StyledImpactSection>
                        <StyledChartCount>
                            {chartCount} chart{chartCount !== 1 ? 's' : ''}
                        </StyledChartCount>
                        {expanded ? (
                            <ExpandLessIcon />
                        ) : (
                            <ExpandMoreIcon />
                        )}
                    </StyledImpactSection>
                </StyledRightSection>
            </StyledHeaderBar>

            <Collapse in={expanded}>
                <StyledExpandedContent>
                    <DemoImpactDashboard />
                </StyledExpandedContent>
            </Collapse>
        </StyledContainer>
    );
};
