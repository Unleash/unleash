import { type FC, useState } from 'react';
import {
    Button,
    Collapse,
    IconButton,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
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

const StyledExpandButton = styled(IconButton)(({ theme }) => ({
    padding: theme.spacing(0.5),
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
    backgroundColor: theme.palette.background.elevation1,
}));

const StyledChartRow = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
}));

const StyledEmptyTopRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
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
    maxWidth: 500,
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

    // Use demo data or real data
    // Set to 0 to preview empty state, 2 for charts, or use impactMetrics.configs.length for real data
    const chartCount: number = 0;
    const hasMetrics = chartCount > 0;

    if (!hasMetrics) {
        return (
            <StyledContainer>
                <StyledHeaderBar>
                    <StyledImpactLabel>
                        <StyledImpactTitle>Impact metrics</StyledImpactTitle>
                        <Badge color='success' sx={{ ml: 1 }}>
                            New
                        </Badge>
                    </StyledImpactLabel>
                </StyledHeaderBar>
                <StyledEmptyStateContainer>
                    <StyledEmptyTopRow>
                        <StyledEmptyContent>
                            <StyledEmptyTitle>
                                Measure the impact of this feature
                            </StyledEmptyTitle>
                            <StyledEmptyDescription>
                                Connect your analytics to see how this feature
                                affects conversion rates, error rates, and other
                                key metrics during rollout.
                            </StyledEmptyDescription>
                        </StyledEmptyContent>
                        <StyledConnectButton
                            variant='outlined'
                            startIcon={<Add />}
                            onClick={onAddChart}
                        >
                            Connect metrics
                        </StyledConnectButton>
                    </StyledEmptyTopRow>
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
            </StyledContainer>
        );
    }

    return (
        <StyledContainer>
            <StyledHeaderBar>
                <StyledImpactLabel>
                    <StyledImpactIcon />
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
                        <Tooltip
                            title={expanded ? 'Hide metrics' : 'Show metrics'}
                        >
                            <StyledExpandButton
                                size='small'
                                onClick={() => setExpanded(!expanded)}
                            >
                                {expanded ? (
                                    <ExpandLessIcon />
                                ) : (
                                    <ExpandMoreIcon />
                                )}
                            </StyledExpandButton>
                        </Tooltip>
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
