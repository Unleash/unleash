import type { CSSProperties, ReactNode } from 'react';
import {
    alpha,
    Box,
    Button,
    Chip,
    styled,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import ApprovalOutlinedIcon from '@mui/icons-material/ApprovalOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import LoopOutlinedIcon from '@mui/icons-material/LoopOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import SensorsIcon from '@mui/icons-material/Sensors';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import { Badge } from 'component/common/Badge/Badge';
import { StrategyEvaluationChip } from 'component/common/ConstraintsList/StrategyEvaluationChip/StrategyEvaluationChip';
import { FeatureLifecycleStageIcon } from 'component/common/FeatureLifecycle/FeatureLifecycleStageIcon';
import { IntegrationIcon } from 'component/integrations/IntegrationList/IntegrationIcon/IntegrationIcon.tsx';
import { PlaygroundResultChip } from 'component/playground/Playground/PlaygroundResultsTable/PlaygroundResultChip/PlaygroundResultChip.tsx';
import UnleashLogo from 'assets/icons/logoBg.svg?react';

const CONFETTI_COLORS = ['#6C65E5', '#E64678', '#73A239', '#E58B24', '#3C91CF'];
const CONFETTI_PIECES = Array.from({ length: 96 }, (_, index) => ({
    id: index,
    left: (index * 37) % 100,
    delay: (index % 16) * 0.045,
    duration: 2.2 + (index % 7) * 0.14,
    drift: ((index * 29) % 150) - 75,
    rotation: 360 + ((index * 47) % 540),
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
}));

const StyledRoot = styled(Box)(({ theme }) => ({
    position: 'relative',
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    padding: theme.spacing(3.5, 4),
    background: theme.palette.background.elevation1,
    overflowY: 'auto',
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        gap: theme.spacing(1.5),
    },
}));

const StyledHeading = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.75),
}));

const StyledFeatureGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: theme.spacing(1.5),
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr',
    },
}));

const StyledFeatureCard = styled('a')(({ theme }) => ({
    minWidth: 0,
    minHeight: 244,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    color: theme.palette.text.primary,
    background: theme.palette.background.paper,
    textDecoration: 'none',
    transition: theme.transitions.create(['border-color', 'background-color'], {
        duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
        borderColor: theme.palette.primary.main,
        background: alpha(theme.palette.primary.main, 0.04),
    },
    '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 2,
    },
}));

const StyledCardHeader = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '32px minmax(0, 1fr) 18px',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledIcon = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.primary.main,
    background: alpha(theme.palette.primary.main, 0.1),
    '& svg': {
        fontSize: 20,
    },
}));

const StyledCardTitle = styled(Typography)(({ theme }) => ({
    overflow: 'hidden',
    fontWeight: theme.typography.fontWeightBold,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

const StyledPreview = styled(Box)(({ theme }) => ({
    position: 'relative',
    height: 102,
    boxSizing: 'border-box',
    overflow: 'hidden',
    padding: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.background.elevation1,
}));

const StyledDescription = styled(Typography)(({ theme }) => ({
    display: '-webkit-box',
    overflow: 'hidden',
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: 1.45,
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
}));

const StyledLearnMore = styled(Typography)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.4),
    marginTop: 'auto',
    color: theme.palette.primary.main,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    '& svg': {
        fontSize: 14,
    },
}));

const StyledFooter = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    marginTop: 'auto',
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const StyledConfetti = styled(Box)({
    position: 'fixed',
    zIndex: 3000,
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
});

const StyledConfettiPiece = styled('span')({
    position: 'absolute',
    top: -14,
    width: 7,
    height: 11,
    borderRadius: 1,
    opacity: 0,
    animationName: 'introConfettiFall',
    animationTimingFunction: 'cubic-bezier(0.15, 0.72, 0.35, 1)',
    animationFillMode: 'forwards',
    '@keyframes introConfettiFall': {
        '0%': {
            opacity: 0,
            transform: 'translate3d(0, -3vh, 0) rotate(0deg)',
        },
        '8%': {
            opacity: 1,
        },
        '85%': {
            opacity: 1,
        },
        '100%': {
            opacity: 0,
            transform:
                'translate3d(var(--confetti-drift), 108vh, 0) rotate(var(--confetti-rotation))',
        },
    },
});

const StyledChartPreview = styled('svg')({
    position: 'absolute',
    inset: '20px 0 0',
    display: 'block',
    width: '100%',
    height: 'calc(100% - 20px)',
});

const StyledMetricGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: theme.spacing(0.75),
    height: '100%',
}));

const StyledMetricCard = styled(Box)(({ theme }) => ({
    minWidth: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: theme.spacing(0.4),
    padding: theme.spacing(0.65),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusSmall,
    background: theme.palette.background.paper,
}));

const StyledMetricHeader = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: 'success' | 'error' }>(({ theme, tone }) => ({
    minWidth: 0,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: theme.spacing(0.5),
    fontSize: 8,
    '& strong:first-of-type': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    '& .metric-value': {
        color: theme.palette[tone].main,
        fontSize: 10,
    },
}));

const StyledMetricChartArea = styled(Box)({
    position: 'relative',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    boxSizing: 'border-box',
});

const StyledMetricEventLine = styled('span', {
    shouldForwardProp: (prop) => prop !== 'position' && prop !== 'tone',
})<{ position: number; tone: 'enabled' | 'safeguard' }>(
    ({ theme, position, tone }) => {
        const color =
            tone === 'enabled'
                ? theme.palette.success.main
                : theme.palette.primary.main;
        return {
            position: 'absolute',
            zIndex: 1,
            top: 17,
            bottom: 4,
            left: `${position}%`,
            borderLeft: `1px dashed ${alpha(color, 0.55)}`,
        };
    },
);

const StyledMetricEvent = styled('span', {
    shouldForwardProp: (prop) => prop !== 'position' && prop !== 'tone',
})<{ position: number; tone: 'enabled' | 'safeguard' }>(
    ({ theme, position, tone }) => {
        const color =
            tone === 'enabled'
                ? theme.palette.success.main
                : theme.palette.primary.main;
        return {
            position: 'absolute',
            zIndex: 2,
            top: 0,
            left: `${position}%`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 18,
            height: 18,
            transform: 'translateX(-50%)',
            border: `1px solid ${color}`,
            borderRadius: '50%',
            color,
            background: theme.palette.background.paper,
            '& svg': {
                width: 14,
                height: 14,
            },
        };
    },
);

const StyledChange = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    marginTop: theme.spacing(0.75),
    padding: theme.spacing(0.6, 0.75),
    borderRadius: theme.shape.borderRadiusSmall,
    background: theme.palette.background.paper,
    fontSize: 10,
}));

const StyledLifecycle = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    height: '100%',
}));

const StyledLifecycleRow = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 58px 40px',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    boxSizing: 'border-box',
    height: 26,
    flexShrink: 0,
    padding: theme.spacing(0, 0.75),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusSmall,
    background: theme.palette.background.paper,
    fontSize: 9,
    '& svg': {
        display: 'block',
        width: 40,
        height: 20,
        alignSelf: 'center',
        justifySelf: 'center',
    },
}));

const StyledLifecycleStageName = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    textAlign: 'center',
    whiteSpace: 'nowrap',
}));

const StyledPlayground = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '0.9fr 1.1fr',
    gap: theme.spacing(0.75),
    height: '100%',
}));

const StyledCode = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateRows: '24px minmax(0, 1fr)',
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusSmall,
    background: theme.palette.background.paper,
}));

const StyledCodeHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 0.75),
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    fontSize: 8,
    fontWeight: theme.typography.fontWeightBold,
    '& svg': {
        width: 14,
        height: 14,
        padding: 2,
        borderRadius: '50%',
        color: theme.palette.background.paper,
        background: theme.palette.success.main,
    },
}));

const StyledCodeBody = styled(Box)(({ theme }) => ({
    padding: theme.spacing(0.55, 0.75),
    color: theme.palette.text.secondary,
    fontFamily: 'monospace',
    fontSize: 8,
    lineHeight: 1.5,
}));

const StyledCodeKey = styled('span')(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const StyledCodeValue = styled('span')(({ theme }) => ({
    color: theme.palette.success.dark,
}));

const StyledPlaygroundResults = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusSmall,
    background: theme.palette.background.paper,
    fontSize: 10,
}));

const StyledPlaygroundRow = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'header',
})<{ header?: boolean }>(({ theme, header }) => ({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 30px 44px',
    alignItems: 'center',
    gap: theme.spacing(0.4),
    minHeight: header ? 24 : 30,
    padding: theme.spacing(0.4, 0.6),
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: header ? theme.palette.text.secondary : theme.palette.text.primary,
    fontSize: header ? 8 : 9,
    '&:last-of-type': {
        borderBottom: 'none',
    },
    '& > span': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
}));

const StyledPlaygroundResult = styled(Box)({
    display: 'flex',
    minWidth: 0,
    '& > span': {
        gap: 2,
        padding: '2px 4px',
        fontSize: 7,
        whiteSpace: 'nowrap',
    },
    '& svg': {
        width: 10,
        height: 10,
    },
});

const StyledTimeline = styled(Box)(({ theme }) => ({
    position: 'relative',
    height: '100%',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: '44%',
        right: 8,
        left: 8,
        height: 1,
        background: theme.palette.divider,
    },
}));

const StyledTimelineEvent = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'position' && prop !== 'tone',
})<{
    position: string;
    tone?: 'primary' | 'success' | 'warning' | 'neutral';
}>(({ theme, position, tone = 'primary' }) => {
    const palette =
        tone === 'primary' ? theme.palette.secondary : theme.palette[tone];

    return {
        position: 'absolute',
        top: '44%',
        left: position,
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        border: `1px solid ${palette.main}`,
        borderRadius: '50%',
        color: palette.main,
        background: palette.light,
        '& svg': {
            display: 'block',
            width: 18,
            height: 18,
            flexShrink: 0,
        },
    };
});

const StyledTimelineBadge = styled('span')(({ theme }) => ({
    position: 'absolute',
    top: -7,
    right: -7,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 14,
    height: 14,
    padding: '0 3px',
    border: `1px solid ${theme.palette.background.paper}`,
    borderRadius: '50%',
    color: theme.palette.primary.contrastText,
    background: theme.palette.background.alternative,
    fontSize: 8,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledTimelineLabel = styled('span', {
    shouldForwardProp: (prop) => prop !== 'position',
})<{ position: string }>(({ theme, position }) => ({
    position: 'absolute',
    left: position,
    bottom: 3,
    transform: 'translateX(-50%)',
    color: theme.palette.text.secondary,
    fontSize: 8,
    whiteSpace: 'nowrap',
}));

const StyledSegmentPreview = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.55),
    height: '100%',
}));

const StyledSegmentHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    paddingBottom: theme.spacing(0.35),
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontSize: 9,
}));

const StyledConstraintRow = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '42px 62px minmax(0, 1fr)',
    alignItems: 'center',
    gap: theme.spacing(0.4),
    fontSize: 9,
}));

const StyledSegmentValues = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 3,
    minWidth: 0,
    fontSize: 8,
});

const StyledSegmentValue = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 20,
    padding: theme.spacing(0.15, 0.65),
    borderRadius: theme.shape.borderRadiusLarge,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.elevation2,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
}));

const StyledIntegrationGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
    gap: theme.spacing(0.6),
    height: '100%',
}));

const StyledIntegration = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.65),
    minWidth: 0,
    padding: theme.spacing(0.4, 0.55),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusSmall,
    background: theme.palette.background.paper,
    fontSize: 8,
    '& .MuiAvatar-root': {
        display: 'block',
        width: 24,
        height: 24,
        marginRight: 0,
        flexShrink: 0,
    },
}));

const StyledIntegrationCopy = styled(Box)(({ theme }) => ({
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.35,
    '& strong': {
        overflow: 'hidden',
        color: theme.palette.text.primary,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    '& span': {
        color: theme.palette.text.secondary,
    },
}));

const StyledEdgePreview = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    gap: theme.spacing(0.65),
}));

const StyledEdgeHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    padding: theme.spacing(0.55, 0.75),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusSmall,
    background: theme.palette.background.paper,
    fontSize: 9,
    '& svg': {
        width: 22,
        height: 22,
        flexShrink: 0,
    },
}));

const StyledEdgeInstances = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.4),
}));

const StyledEdgeInstance = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '7px minmax(0, 1fr) 38px 40px',
    alignItems: 'center',
    gap: theme.spacing(0.4),
    padding: theme.spacing(0.35, 0.6),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusSmall,
    background: theme.palette.background.paper,
    fontSize: 8,
    '&::before': {
        content: '""',
        width: 5,
        height: 5,
        flexShrink: 0,
        borderRadius: '50%',
        background: theme.palette.success.main,
    },
    '& strong, & span': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    '& span': {
        color: theme.palette.text.secondary,
        textAlign: 'right',
    },
}));

const StyledAccessPreview = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: theme.spacing(0.35),
    height: '100%',
}));

const StyledAccessSectionLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: 8,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledAccessRow = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '20px minmax(0, 1fr) auto auto 14px',
    alignItems: 'center',
    gap: theme.spacing(0.4),
    minHeight: 29,
    padding: theme.spacing(0.35, 0.55),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    background: theme.palette.background.paper,
    fontSize: 8,
    '& > svg:first-of-type': {
        color: theme.palette.info.main,
        fontSize: 17,
    },
    '& > svg:last-of-type': {
        color: theme.palette.text.secondary,
        fontSize: 14,
    },
}));

const StyledAccessRole = styled(Badge)({
    padding: '2px 4px',
    fontSize: 7,
});

const StyledAccessPermissionCount = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: 7,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
}));

const StyledAccessName = styled('strong')({
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const StyledAccessProjectIcon = styled(TopicOutlinedIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const StyledAccessChevron = styled(ExpandMoreIcon)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: 14,
}));

const StyledAccessPersonIcon = styled(PersonOutlinedIcon)(({ theme }) => ({
    color: theme.palette.info.main,
    fontSize: 17,
}));

interface IIntroShowcaseProps {
    onReplay: () => void;
    onComplete: () => void;
}

interface IFeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    href: string;
    preview: ReactNode;
}

const FeatureCard = ({
    icon,
    title,
    description,
    href,
    preview,
}: IFeatureCardProps) => (
    <StyledFeatureCard
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        aria-label={`${title} documentation`}
        data-testid='QUICK_TOUR_INTRO_SHOWCASE_CARD'
    >
        <StyledCardHeader>
            <StyledIcon>{icon}</StyledIcon>
            <StyledCardTitle variant='body2'>{title}</StyledCardTitle>
            <LaunchOutlinedIcon color='action' sx={{ fontSize: 17 }} />
        </StyledCardHeader>
        <StyledPreview>{preview}</StyledPreview>
        <StyledDescription>{description}</StyledDescription>
        <StyledLearnMore>
            Explore in the docs <ArrowForwardIcon />
        </StyledLearnMore>
    </StyledFeatureCard>
);

const ReliabilityPreview = () => {
    const theme = useTheme();
    const renderEvents = () => (
        <>
            <StyledMetricEventLine
                aria-hidden='true'
                position={32}
                tone='enabled'
            />
            <StyledMetricEvent
                role='img'
                aria-label='Production enabled'
                position={32}
                tone='enabled'
            >
                <ToggleOnIcon />
            </StyledMetricEvent>
            <StyledMetricEventLine
                aria-hidden='true'
                position={72}
                tone='safeguard'
            />
            <StyledMetricEvent
                role='img'
                aria-label='Safeguard disabled production'
                position={72}
                tone='safeguard'
            >
                <ShieldOutlinedIcon />
            </StyledMetricEvent>
        </>
    );

    return (
        <StyledMetricGrid>
            <StyledMetricCard>
                <StyledMetricHeader tone='success'>
                    <strong>Successful searches</strong>
                    <strong className='metric-value'>128</strong>
                </StyledMetricHeader>
                <StyledMetricChartArea>
                    {renderEvents()}
                    <StyledChartPreview
                        viewBox='0 0 112 40'
                        preserveAspectRatio='none'
                    >
                        {[4, 20, 36].map((y) => (
                            <line
                                key={y}
                                x1='0'
                                x2='112'
                                y1={y}
                                y2={y}
                                stroke='currentColor'
                                opacity='.08'
                            />
                        ))}
                        <path
                            d='M0 10 L40 10 L44 10.5 L48 11.5 L52 11 L56 13 L60 12.5 L64 15 L68 14.5 L72 18 L75 17.5 L78 22 L80 27 L82 13 L88 11 L96 10 L104 10.5 L112 9.8 L112 40 L0 40 Z'
                            fill={alpha(theme.palette.success.main, 0.12)}
                        />
                        <path
                            d='M0 10 L40 10 L44 10.5 L48 11.5 L52 11 L56 13 L60 12.5 L64 15 L68 14.5 L72 18 L75 17.5 L78 22 L80 27 L82 13 L88 11 L96 10 L104 10.5 L112 9.8'
                            fill='none'
                            stroke={theme.palette.success.main}
                            strokeWidth='1.8'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    </StyledChartPreview>
                </StyledMetricChartArea>
            </StyledMetricCard>
            <StyledMetricCard>
                <StyledMetricHeader tone='error'>
                    <strong>Search errors</strong>
                    <strong className='metric-value'>0</strong>
                </StyledMetricHeader>
                <StyledMetricChartArea>
                    {renderEvents()}
                    <StyledChartPreview
                        viewBox='0 0 112 40'
                        preserveAspectRatio='none'
                    >
                        {[4, 20, 36].map((y) => (
                            <line
                                key={y}
                                x1='0'
                                x2='112'
                                y1={y}
                                y2={y}
                                stroke='currentColor'
                                opacity='.08'
                            />
                        ))}
                        <path
                            d='M36 40 L40 39 L44 40 L48 36 L52 37 L56 32 L60 34 L64 29 L68 30 L72 23 L76 24 L79 16 L80 10 L82 32 L84 38 L88 40 L100 40 L112 40 Z'
                            fill={alpha(theme.palette.error.main, 0.12)}
                        />
                        <path
                            d='M0 40 L36 40 L40 39 L44 40 L48 36 L52 37 L56 32 L60 34 L64 29 L68 30 L72 23 L76 24 L79 16 L80 10 L82 32 L84 38 L88 40 L100 40 L112 40'
                            fill='none'
                            stroke={theme.palette.error.main}
                            strokeWidth='1.8'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                        <path
                            d='M0 10 L112 10'
                            fill='none'
                            stroke={theme.palette.error.main}
                            strokeDasharray='3 2'
                            opacity='.7'
                        />
                    </StyledChartPreview>
                </StyledMetricChartArea>
            </StyledMetricCard>
        </StyledMetricGrid>
    );
};

const ChangeRequestPreview = () => (
    <Box>
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
            }}
        >
            <Box sx={{ minWidth: 0 }}>
                <Typography
                    variant='caption'
                    sx={{ display: 'block', fontWeight: 'bold' }}
                >
                    Increase production rollout
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 8 }}>
                    production · 1 update
                </Typography>
            </Box>
            <Chip
                label='Approved'
                color='success'
                variant='outlined'
                size='small'
                sx={{ height: 20, fontSize: 9 }}
            />
        </Box>
        <StyledChange>
            <span>Gradual rollout</span>
            <span>
                <del>25%</del> → <strong>50%</strong>
            </span>
        </StyledChange>
        <StyledChange>
            <span>Approvals</span>
            <strong>2 of 2</strong>
        </StyledChange>
    </Box>
);

const LifecyclePreview = () => (
    <StyledLifecycle>
        {[
            ['my-feature', 'live', 'Live'],
            ['recommendations', 'pre-live', 'Pre-live'],
            ['legacy-checkout', 'completed', 'Completed'],
        ].map(([name, stage, label]) => (
            <StyledLifecycleRow key={name}>
                <strong>{name}</strong>
                <StyledLifecycleStageName>{label}</StyledLifecycleStageName>
                <FeatureLifecycleStageIcon
                    stage={{
                        name: stage as
                            | 'initial'
                            | 'pre-live'
                            | 'live'
                            | 'completed'
                            | 'archived',
                    }}
                />
            </StyledLifecycleRow>
        ))}
    </StyledLifecycle>
);

const PlaygroundPreview = () => (
    <StyledPlayground>
        <StyledCode>
            <StyledCodeHeader>
                <span>JSON</span>
                <CheckCircleOutlineIcon />
            </StyledCodeHeader>
            <StyledCodeBody>
                <div>{'{'}</div>
                <div>
                    &nbsp; <StyledCodeKey>"country"</StyledCodeKey>:{' '}
                    <StyledCodeValue>"NO"</StyledCodeValue>,
                </div>
                <div>
                    &nbsp; <StyledCodeKey>"plan"</StyledCodeKey>:{' '}
                    <StyledCodeValue>"pro"</StyledCodeValue>
                </div>
                <div>{'}'}</div>
            </StyledCodeBody>
        </StyledCode>
        <StyledPlaygroundResults>
            <StyledPlaygroundRow header>
                <span>Feature</span>
                <span>Variant</span>
                <span>isEnabled</span>
            </StyledPlaygroundRow>
            <StyledPlaygroundRow>
                <span>
                    <strong>my-feature</strong>
                </span>
                <span>A</span>
                <StyledPlaygroundResult>
                    <PlaygroundResultChip enabled label='True' />
                </StyledPlaygroundResult>
            </StyledPlaygroundRow>
            <StyledPlaygroundRow>
                <span>recommendations</span>
                <span>-</span>
                <StyledPlaygroundResult>
                    <PlaygroundResultChip enabled={false} label='False' />
                </StyledPlaygroundResult>
            </StyledPlaygroundRow>
        </StyledPlaygroundResults>
    </StyledPlayground>
);

const EventTimelinePreview = () => (
    <StyledTimeline>
        <StyledTimelineEvent position='12%' tone='success'>
            <ToggleOnIcon />
        </StyledTimelineEvent>
        <StyledTimelineLabel position='12%'>Enabled</StyledTimelineLabel>
        <StyledTimelineEvent position='38%'>
            <MoreHorizIcon />
            <StyledTimelineBadge>3</StyledTimelineBadge>
        </StyledTimelineEvent>
        <StyledTimelineLabel position='38%'>3 changes</StyledTimelineLabel>
        <StyledTimelineEvent position='64%' tone='warning'>
            <SensorsIcon />
        </StyledTimelineEvent>
        <StyledTimelineLabel position='64%'>Signal</StyledTimelineLabel>
        <StyledTimelineEvent position='88%' tone='neutral'>
            <OutlinedFlagIcon />
        </StyledTimelineEvent>
        <StyledTimelineLabel position='88%'>Updated</StyledTimelineLabel>
    </StyledTimeline>
);

const SegmentsPreview = () => (
    <StyledSegmentPreview>
        <StyledSegmentHeader>
            <strong>north-america-paid-users</strong>
            <span>Used in 8 strategies</span>
        </StyledSegmentHeader>
        <StyledConstraintRow>
            <span>Country</span>
            <StrategyEvaluationChip
                label='is one of'
                sx={{
                    fontSize: 8,
                    '& .MuiChip-label': { px: 0.6 },
                }}
            />
            <StyledSegmentValues>
                <StyledSegmentValue>🇺🇸 US</StyledSegmentValue>
                <StyledSegmentValue>🇨🇦 CA</StyledSegmentValue>
            </StyledSegmentValues>
        </StyledConstraintRow>
        <StyledConstraintRow>
            <span>Plan</span>
            <StrategyEvaluationChip
                label='is one of'
                sx={{
                    fontSize: 8,
                    '& .MuiChip-label': { px: 0.6 },
                }}
            />
            <StyledSegmentValues>
                <StyledSegmentValue>Pro</StyledSegmentValue>
                <StyledSegmentValue>Enterprise</StyledSegmentValue>
            </StyledSegmentValues>
        </StyledConstraintRow>
    </StyledSegmentPreview>
);

const IntegrationsPreview = () => (
    <StyledIntegrationGrid>
        {[
            ['slack-app', 'Slack', 'Enabled'],
            ['jira', 'Jira', 'Enabled'],
            ['datadog', 'Datadog', 'Configure'],
            ['teams', 'Teams', 'Configure'],
        ].map(([icon, name, status]) => (
            <StyledIntegration key={name}>
                <IntegrationIcon name={icon} />
                <StyledIntegrationCopy>
                    <strong>{name}</strong>
                    <span>{status}</span>
                </StyledIntegrationCopy>
            </StyledIntegration>
        ))}
    </StyledIntegrationGrid>
);

const EnterpriseEdgePreview = () => (
    <StyledEdgePreview>
        <StyledEdgeHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <UnleashLogo />
                <Box>
                    <strong>Connected Edge instances</strong>
                    <Box sx={{ color: 'text.secondary', fontSize: 8 }}>
                        Last reported just now
                    </Box>
                </Box>
            </Box>
            <strong>2 connected</strong>
        </StyledEdgeHeader>
        <StyledEdgeInstances>
            <StyledEdgeInstance>
                <strong>edge-eu-1</strong>
                <span>EU</span>
                <span>14 ms</span>
            </StyledEdgeInstance>
            <StyledEdgeInstance>
                <strong>edge-us-1</strong>
                <span>US</span>
                <span>21 ms</span>
            </StyledEdgeInstance>
        </StyledEdgeInstances>
    </StyledEdgePreview>
);

const EnterpriseAccessPreview = () => (
    <StyledAccessPreview>
        <StyledAccessSectionLabel>Instance access</StyledAccessSectionLabel>
        <StyledAccessRow>
            <StyledAccessPersonIcon />
            <StyledAccessName>Root access</StyledAccessName>
            <StyledAccessRole color='info'>Editor</StyledAccessRole>
            <StyledAccessPermissionCount>
                28 / 32 permissions
            </StyledAccessPermissionCount>
            <StyledAccessChevron />
        </StyledAccessRow>
        <StyledAccessSectionLabel>Project access</StyledAccessSectionLabel>
        <StyledAccessRow>
            <StyledAccessProjectIcon />
            <StyledAccessName>my-feature</StyledAccessName>
            <StyledAccessRole color='secondary'>Member</StyledAccessRole>
            <StyledAccessPermissionCount>
                18 / 20 permissions
            </StyledAccessPermissionCount>
            <StyledAccessChevron />
        </StyledAccessRow>
    </StyledAccessPreview>
);

export const IntroShowcase = ({
    onReplay,
    onComplete,
}: IIntroShowcaseProps) => {
    const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

    return (
        <StyledRoot data-public data-testid='QUICK_TOUR_INTRO_SHOWCASE'>
            {!reduceMotion ? (
                <StyledConfetti data-testid='QUICK_TOUR_INTRO_CONFETTI'>
                    {CONFETTI_PIECES.map((piece) => (
                        <StyledConfettiPiece
                            key={piece.id}
                            style={
                                {
                                    left: `${piece.left}%`,
                                    background: piece.color,
                                    animationDelay: `${piece.delay}s`,
                                    animationDuration: `${piece.duration}s`,
                                    '--confetti-drift': `${piece.drift}px`,
                                    '--confetti-rotation': `${piece.rotation}deg`,
                                } as CSSProperties
                            }
                        />
                    ))}
                </StyledConfetti>
            ) : null}

            <StyledHeader>
                <StyledHeading>
                    <Typography variant='h1'>Tour complete!</Typography>
                    <Typography color='textSecondary'>
                        What do you want to do next?
                    </Typography>
                </StyledHeading>
            </StyledHeader>

            <StyledFeatureGrid>
                <FeatureCard
                    icon={<ShieldOutlinedIcon />}
                    title='Impact metrics & safeguards'
                    description='Connect production signals to releases and automatically stop unhealthy changes.'
                    href='https://docs.getunleash.io/concepts/impact-metrics'
                    preview={<ReliabilityPreview />}
                />
                <FeatureCard
                    icon={<ApprovalOutlinedIcon />}
                    title='Change requests'
                    description='Review, approve, schedule, and audit production changes before they take effect.'
                    href='https://docs.getunleash.io/concepts/change-requests'
                    preview={<ChangeRequestPreview />}
                />
                <FeatureCard
                    icon={<LoopOutlinedIcon />}
                    title='Feature lifecycle'
                    description='Follow flags from definition to cleanup and keep technical debt under control.'
                    href='https://docs.getunleash.io/concepts/feature-flags#feature-flag-lifecycle'
                    preview={<LifecyclePreview />}
                />
                <FeatureCard
                    icon={<ScienceOutlinedIcon />}
                    title='Playground'
                    description='Test real contexts and understand exactly why a flag or variant was evaluated.'
                    href='https://docs.getunleash.io/concepts/playground'
                    preview={<PlaygroundPreview />}
                />
                <FeatureCard
                    icon={<HistoryOutlinedIcon />}
                    title='Event Timeline'
                    description='Correlate releases, configuration changes, and external signals in one timeline.'
                    href='https://docs.getunleash.io/concepts/events#event-timeline'
                    preview={<EventTimelinePreview />}
                />
                <FeatureCard
                    icon={<DonutLargeOutlinedIcon />}
                    title='Segments'
                    description='Define an audience once, reuse it across releases, and keep every targeting rule in sync.'
                    href='https://docs.getunleash.io/concepts/segments'
                    preview={<SegmentsPreview />}
                />
                <FeatureCard
                    icon={<IntegrationInstructionsOutlinedIcon />}
                    title='Integrations'
                    description='Connect feature changes to the tools your teams already use to build, observe, and collaborate.'
                    href='https://docs.getunleash.io/integrate'
                    preview={<IntegrationsPreview />}
                />
                <FeatureCard
                    icon={<PublicOutlinedIcon />}
                    title='Enterprise Edge'
                    description='Deliver resilient, low-latency flag evaluation across regions and private infrastructure.'
                    href='https://docs.getunleash.io/unleash-edge'
                    preview={<EnterpriseEdgePreview />}
                />
                <FeatureCard
                    icon={<GroupOutlinedIcon />}
                    title='Access management'
                    description='Manage secure access with SSO, SCIM, service accounts, groups, and granular role-based permissions.'
                    href='https://docs.getunleash.io/guides/user-management-access-controls'
                    preview={<EnterpriseAccessPreview />}
                />
            </StyledFeatureGrid>

            <StyledFooter>
                <Box sx={{ display: 'flex', gap: 1.5, marginLeft: 'auto' }}>
                    <Button variant='outlined' onClick={onReplay}>
                        Replay intro
                    </Button>
                    <Button
                        variant='contained'
                        onClick={onComplete}
                        data-testid='QUICK_TOUR_INTRO_FINISH_BUTTON'
                    >
                        Create feature flag
                    </Button>
                </Box>
            </StyledFooter>
        </StyledRoot>
    );
};
