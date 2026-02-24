import { type FC, useMemo, useState } from 'react';
import {
    Button,
    Collapse,
    MenuItem,
    Select,
    styled,
    Typography,
} from '@mui/material';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import { Badge } from 'component/common/Badge/Badge';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Add from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useFeatureImpactMetrics } from 'hooks/api/getters/useFeatureImpactMetrics/useFeatureImpactMetrics';
import { PlaceholderChart } from './ImpactDashboard/PlaceholderChart';
import { CompactChartCard } from './CompactChartCard';

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
    padding: theme.spacing(3, 3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    backgroundColor: theme.palette.background.elevation2,
}));

const StyledEmptyStateContainer = styled('div')(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(3, 3),
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

const StyledConnectButton = styled(Button)(({ theme }) => ({
    textTransform: 'none',
    whiteSpace: 'nowrap',
    flexShrink: 0,
}));

const StyledEnvDropdown = styled('div')({});

const StyledToolbar = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(-1.5),
    marginTop: theme.spacing(-1.5),
}));

const StyledMetricsLink = styled(Link)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
        textDecoration: 'underline',
    },
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

    const { feature } = useFeature(projectId, featureName);
    const envOptions = useMemo(() => {
        const sorted = [...feature.environments].sort((a, b) => {
            if (a.type === 'production' && b.type !== 'production') return -1;
            if (a.type !== 'production' && b.type === 'production') return 1;
            return 0;
        });
        return sorted.map((env) => ({
            key: env.name,
            label: env.name,
        }));
    }, [feature.environments]);

    const defaultEnv = envOptions[0]?.key ?? '';
    const [selectedEnv, setSelectedEnv] = useState<string>('');
    const activeEnv = selectedEnv || defaultEnv;

    const { impactMetrics } = useFeatureImpactMetrics({
        projectId,
        featureName,
    });

    const chartCount = impactMetrics.configs.length;
    const hasMetrics = chartCount > 0;

    const envDropdown = (
        <StyledEnvDropdown>
            <Select
                value={activeEnv}
                onChange={(e) => setSelectedEnv(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                size='small'
                variant='outlined'
                IconComponent={KeyboardArrowDownOutlined}
                sx={{ width: 'fit-content' }}
            >
                {envOptions.map((opt) => (
                    <MenuItem key={opt.key} value={opt.key}>
                        {opt.label}
                    </MenuItem>
                ))}
            </Select>
        </StyledEnvDropdown>
    );

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
                    <StyledRightSection sx={{ marginLeft: 'auto' }}>
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
                </StyledImpactLabel>
                <StyledRightSection sx={{ marginLeft: 'auto' }}>
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
                    <StyledToolbar>
                        {envDropdown}
                        <StyledMetricsLink
                            to={`/projects/${projectId}/features/${featureName}/metrics`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            View all metrics
                        </StyledMetricsLink>
                    </StyledToolbar>
                    <StyledChartRow>
                        {impactMetrics.configs.map((config) => (
                            <CompactChartCard
                                key={config.id}
                                config={config}
                            />
                        ))}
                    </StyledChartRow>
                </StyledExpandedContent>
            </Collapse>
        </StyledContainer>
    );
};
