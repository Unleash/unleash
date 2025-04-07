import {
    Box,
    Button,
    Grid,
    Paper,
    styled,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useInstanceStats } from 'hooks/api/getters/useInstanceStats/useInstanceStats';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { formatAssetPath } from 'utils/formatPath';
import easyToDeploy from 'assets/img/easyToDeploy.png';
import { useNavigate } from 'react-router-dom';

const UI_SWITCH_WIDGET_RATIO_BREAKPOINT = 1505;

const StyledContainer = styled(Grid)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledInstanceWidget = styled(Paper)(({ theme }) => ({
    height: theme.spacing(44),
    padding: theme.spacing(3),
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    boxShadow: 'none',
    color: 'white',
    backgroundColor: theme.palette.web.main,
    overflow: 'hidden',
    [theme.breakpoints.down(UI_SWITCH_WIDGET_RATIO_BREAKPOINT)]: {
        height: theme.spacing(24),
    },
    [theme.breakpoints.down(800)]: {
        height: theme.spacing(30),
    },
}));

const StyledWidget = styled(Paper)(({ theme }) => ({
    minHeight: theme.spacing(44),
    padding: theme.spacing(3),
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    boxShadow: 'none',
    [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
    },
}));

const StyledHeader = styled(Typography)(({ theme }) => ({
    width: '100%',
    fontSize: theme.fontSizes.largeHeader,
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
}));

const StyledLicenseSection = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(6),
    [theme.breakpoints.down(UI_SWITCH_WIDGET_RATIO_BREAKPOINT)]: {
        marginBottom: theme.spacing(2),
    },
}));

const StyledParagraph = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    flexDirection: 'row',
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'space-between',
    [theme.breakpoints.down(UI_SWITCH_WIDGET_RATIO_BREAKPOINT)]: {
        maxWidth: theme.spacing(65),
    },
    [theme.breakpoints.down(800)]: {
        flexDirection: 'column',
        justifyContent: 'start',
    },
}));

const StyledParamName = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    fontWeight: 'bold',
}));

const StyledParamValue = styled('div')(({ theme }) => ({
    color: 'white',
}));

const InstanceStatsHeader = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
}));

const StyledGridContainer = styled(Grid)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    justifyContent: 'space-between',
    marginBottom: theme.spacing(7),
}));

const StyledGridItem = styled(Grid)(({ theme }) => ({
    width: theme.spacing(16),
    aspectRatio: '1 / 1',
    padding: theme.spacing(2),
    alignItems: 'center',
    borderRadius: `50%`,
    backgroundColor: theme.mode === 'light' ? '#F1F0FC' : '#302E42',
}));

const StyledGridItemContent = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
}));

export const StatNumber = styled(Typography)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontSize: theme.fontSizes.largeHeader,
    fontWeight: 'bold',
    marginTop: theme.spacing(1),
}));

export const StatText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.bodySize,
}));

const StyledLinkContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: theme.spacing(3),
}));

const ImageContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(-6),
    marginRight: theme.spacing(-10),
    [theme.breakpoints.down(UI_SWITCH_WIDGET_RATIO_BREAKPOINT)]: {
        marginTop: theme.spacing(-22),
        marginRight: theme.spacing(-12),
    },
}));

const StyledImg = styled('img')(({ theme }) => ({
    width: theme.spacing(33),
    transform: 'rotate(180deg)',
    clipPath: 'polygon(21% 28%, 100% 28%, 21% 94%)',
}));

interface IInstanceWidgetProps {
    plan: string;
    instanceId: string;
    version: string;
}

const InstanceWidget = ({
    plan,
    instanceId,
    version,
}: IInstanceWidgetProps) => {
    return (
        <StyledInstanceWidget>
            <StyledLicenseSection>
                <div>Current plan</div>
                <StyledHeader variant='h3'>{plan}</StyledHeader>
            </StyledLicenseSection>
            <StyledParagraph>
                <StyledParamName>Instance id</StyledParamName>
                <StyledParamValue>{instanceId}</StyledParamValue>
            </StyledParagraph>
            <StyledParagraph>
                <StyledParamName>Unleash version</StyledParamName>
                <StyledParamValue>{version}</StyledParamValue>
            </StyledParagraph>
            <ImageContainer>
                <StyledImg src={formatAssetPath(easyToDeploy)} />
            </ImageContainer>
        </StyledInstanceWidget>
    );
};

interface IInstanceStatsWidgetProps {
    users: number;
    featureToggles: number;
    projects: number;
    environments: number;
}

const InstanceStatsWidget = ({
    users,
    featureToggles,
    projects,
    environments,
}: IInstanceStatsWidgetProps) => {
    const navigate = useNavigate();

    return (
        <StyledWidget>
            <InstanceStatsHeader>Instance statistics</InstanceStatsHeader>
            <StyledGridContainer container>
                <StyledGridItem item>
                    <StyledGridItemContent>
                        <StatNumber>{users}</StatNumber>
                        <StatText>Users</StatText>
                    </StyledGridItemContent>
                </StyledGridItem>
                <StyledGridItem item>
                    <StyledGridItemContent>
                        <StatNumber>{featureToggles}</StatNumber>
                        <StatText>Feature flags</StatText>
                    </StyledGridItemContent>
                </StyledGridItem>
                <StyledGridItem item>
                    <StyledGridItemContent>
                        <StatNumber>{projects}</StatNumber>
                        <StatText>Projects</StatText>
                    </StyledGridItemContent>
                </StyledGridItem>
                <StyledGridItem item>
                    <StyledGridItemContent>
                        <StatNumber>{environments}</StatNumber>
                        <StatText>Environments</StatText>
                    </StyledGridItemContent>
                </StyledGridItem>
            </StyledGridContainer>
            <StyledLinkContainer>
                <Button
                    rel='noreferrer'
                    endIcon={<ArrowOutwardIcon />}
                    onClick={() => {
                        navigate('/admin/instance');
                    }}
                >
                    View all instance statistics
                </Button>
            </StyledLinkContainer>
        </StyledWidget>
    );
};

export const AdminHome = () => {
    const stats = useInstanceStats();
    const theme = useTheme();
    const isBreakpoint = useMediaQuery(
        theme.breakpoints.down(UI_SWITCH_WIDGET_RATIO_BREAKPOINT),
    );
    const breakpointedInstanceStatsWidgetSize = isBreakpoint ? 12 : 7;
    const breakpointedInstanceWidgetSize = isBreakpoint ? 12 : 5;
    const { isOss, isPro, isEnterprise } = useUiConfig();
    const plan = isOss()
        ? 'Open source'
        : isPro()
          ? 'Pro'
          : isEnterprise()
            ? 'Enterprise'
            : 'Unknown';
    return (
        <StyledContainer>
            {stats && !stats.loading && (
                <Grid container spacing={3}>
                    <Grid
                        item
                        md={breakpointedInstanceWidgetSize}
                        sm={12}
                        xs={12}
                    >
                        <InstanceWidget
                            plan={plan}
                            instanceId={stats.stats?.instanceId ?? 'unknown'}
                            version={
                                stats.stats?.versionEnterprise ?? 'unknown'
                            }
                        />
                    </Grid>
                    <Grid
                        item
                        md={breakpointedInstanceStatsWidgetSize}
                        sm={12}
                        xs={12}
                    >
                        <InstanceStatsWidget
                            environments={stats.stats?.environments ?? 0}
                            featureToggles={stats.stats?.featureToggles ?? 0}
                            projects={stats.stats?.projects ?? 0}
                            users={stats.stats?.users ?? 0}
                        />
                    </Grid>
                </Grid>
            )}
        </StyledContainer>
    );
};
