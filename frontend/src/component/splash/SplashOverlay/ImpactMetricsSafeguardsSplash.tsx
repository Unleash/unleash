import { useEffect } from 'react';
import {
    Box,
    Button,
    IconButton,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UnleashLogo from 'assets/img/logoDarkWithText.svg?react';
import UnleashLogoWhite from 'assets/img/logoWithWhiteText.svg?react';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { useImpactMetricsCounter } from 'hooks/useImpactMetrics';

const DOCS_URL = 'https://docs.getunleash.io/reference/impact-metrics';
const TRACKING_HELP =
    'Tracks engagement with the impact metrics + safeguards announcement splash.';

const DialogCard = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: theme.shadows[5],
    maxWidth: theme.spacing(100),
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    margin: theme.spacing(2),
    position: 'relative',
    zIndex: 1,
}));

const HeaderRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    padding: theme.spacing(0.5),
}));

const StyledLogo = styled(UnleashLogo)(({ theme }) => ({
    height: theme.spacing(6),
}));

const StyledLogoWhite = styled(UnleashLogoWhite)(({ theme }) => ({
    height: theme.spacing(6),
}));

const ContentContainer = styled(Box)(({ theme }) => ({
    padding: `${theme.spacing(3)} ${theme.spacing(3)} ${theme.spacing(3.5)} ${theme.spacing(3)}`,
    overflowY: 'auto',
    flex: 1,
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
}));

const StyledDescription = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
}));

const DiagramContainer = styled(Box)(({ theme }) => ({
    width: '100%',
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(3, 2),
    marginBottom: theme.spacing(3),
    display: 'flex',
    justifyContent: 'center',
}));

const CYCLE_MS = 6000;

const StyledDiagram = styled('svg')(({ theme }) => ({
    width: '100%',
    maxWidth: 560,
    height: 'auto',
    display: 'block',

    '& .node-rect': {
        fill: theme.palette.background.paper,
        stroke: theme.palette.primary.main,
        strokeOpacity: 0.25,
        strokeWidth: 1.5,
    },
    '& .node-label': {
        fill: theme.palette.text.primary,
        fontSize: 14,
        fontWeight: 600,
        textAnchor: 'middle',
    },
    '& .node-sub': {
        fill: theme.palette.text.secondary,
        fontSize: 11,
        textAnchor: 'middle',
    },
    '& .axis-line': {
        stroke: theme.palette.divider,
        strokeWidth: 1,
    },
    '& .threshold-line': {
        stroke: theme.palette.error.main,
        strokeWidth: 1.5,
        strokeDasharray: '4 3',
        opacity: 0.7,
    },
    '& .threshold-label': {
        fill: theme.palette.error.main,
        fontSize: 10,
        fontWeight: 600,
        opacity: 0.85,
    },
    '& .metric-area': {
        fill: theme.palette.primary.main,
        fillOpacity: 0.12,
        clipPath: 'inset(0 100% 0 0)',
        animation: `revealMetric ${CYCLE_MS}ms ease-in-out infinite`,
    },
    '& .metric-line': {
        fill: 'none',
        stroke: theme.palette.primary.main,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeDasharray: 220,
        strokeDashoffset: 220,
        animation: `drawMetric ${CYCLE_MS}ms ease-in-out infinite`,
    },
    '& .breach-dot': {
        fill: theme.palette.error.main,
        opacity: 0,
        animation: `breachPulse ${CYCLE_MS}ms ease-in-out infinite`,
    },
    '& .arrow': {
        fill: theme.palette.primary.main,
        stroke: theme.palette.primary.main,
        opacity: 0.45,
    },
    '& .arrow-active': {
        animation: `arrowFlash ${CYCLE_MS}ms ease-in-out infinite`,
    },
    '& .arrow-active-2': {
        animation: `arrowFlash2 ${CYCLE_MS}ms ease-in-out infinite`,
    },
    '& .safeguard-pulse > *': {
        transformOrigin: 'center',
        transformBox: 'fill-box',
        animation: `safeguardTrigger ${CYCLE_MS}ms ease-in-out infinite`,
    },
    '& .safeguard-shield': {
        stroke: theme.palette.primary.main,
        fill: theme.palette.primary.main,
        fillOpacity: 0.08,
    },
    '& .safeguard-check': {
        stroke: theme.palette.primary.main,
    },
    '& .toggle-track': {
        fill: theme.palette.primary.main,
        animation: `toggleTrackFlip ${CYCLE_MS}ms ease-in-out infinite`,
    },
    '& .toggle-knob': {
        fill: theme.palette.common.white,
        animation: `toggleKnobSlide ${CYCLE_MS}ms ease-in-out infinite`,
    },

    '@keyframes drawMetric': {
        '0%, 5%': { strokeDashoffset: 220 },
        '55%, 100%': { strokeDashoffset: 0 },
    },
    '@keyframes revealMetric': {
        '0%, 5%': { clipPath: 'inset(0 100% 0 0)' },
        '55%, 100%': { clipPath: 'inset(0 0 0 0)' },
    },
    '@keyframes breachPulse': {
        '0%, 55%': { opacity: 0, r: 3 },
        '60%': { opacity: 1, r: 6 },
        '70%': { opacity: 1, r: 4 },
        '85%, 100%': { opacity: 1, r: 4 },
    },
    '@keyframes arrowFlash': {
        '0%, 60%': { opacity: 0.6 },
        '65%, 75%': { opacity: 1 },
        '85%, 100%': { opacity: 0.6 },
    },
    '@keyframes arrowFlash2': {
        '0%, 70%': { opacity: 0.6 },
        '75%, 85%': { opacity: 1 },
        '95%, 100%': { opacity: 0.6 },
    },
    '@keyframes safeguardTrigger': {
        '0%, 60%': { transform: 'scale(1)' },
        '70%': { transform: 'scale(1.08)' },
        '80%, 100%': { transform: 'scale(1)' },
    },
    '@keyframes toggleTrackFlip': {
        '0%, 75%': { fill: theme.palette.primary.main },
        '85%, 100%': { fill: theme.palette.action.disabled },
    },
    '@keyframes toggleKnobSlide': {
        '0%, 75%': { transform: 'translateX(0)' },
        '85%, 100%': { transform: 'translateX(-32px)' },
    },
}));

const StyledStepList = styled('ol')(({ theme }) => ({
    margin: 0,
    padding: 0,
    listStyle: 'none',
    counterReset: 'step',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(4),
}));

const StyledStep = styled('li')(({ theme }) => ({
    counterIncrement: 'step',
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    '&::before': {
        content: 'counter(step)',
        flex: '0 0 auto',
        width: theme.spacing(3.5),
        height: theme.spacing(3.5),
        borderRadius: '50%',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: theme.typography.fontWeightBold,
        fontSize: theme.typography.body2.fontSize,
    },
}));

const StepText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
    paddingTop: theme.spacing(0.25),
}));

const ActionsRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
}));

interface ImpactMetricsSafeguardsSplashProps {
    onClose: () => void;
}

export const ImpactMetricsSafeguardsSplash = ({
    onClose,
}: ImpactMetricsSafeguardsSplashProps) => {
    const { increment: trackDisplayed } = useImpactMetricsCounter(
        'impactMetricsSafeguardsSplash_displayed',
        TRACKING_HELP,
    );
    const { increment: trackDocsClicked } = useImpactMetricsCounter(
        'impactMetricsSafeguardsSplash_docs_clicked',
        TRACKING_HELP,
    );
    const { increment: trackDismissed } = useImpactMetricsCounter(
        'impactMetricsSafeguardsSplash_dismissed',
        TRACKING_HELP,
    );

    useEffect(() => {
        trackDisplayed();
    }, [trackDisplayed]);

    const handleDocsClick = () => {
        trackDocsClicked();
        window.open(DOCS_URL, '_blank', 'noopener,noreferrer');
        onClose();
    };

    const handleDismiss = () => {
        trackDismissed();
        onClose();
    };

    return (
        <DialogCard>
            <HeaderRow>
                <ThemeMode
                    darkmode={<StyledLogoWhite aria-label='Unleash' />}
                    lightmode={<StyledLogo aria-label='Unleash' />}
                />
                <Tooltip title='Close' arrow>
                    <StyledCloseButton
                        onClick={handleDismiss}
                        size='small'
                        aria-label='close'
                    >
                        <CloseIcon />
                    </StyledCloseButton>
                </Tooltip>
            </HeaderRow>

            <ContentContainer>
                <StyledTitle variant='h1'>
                    Your safety net for every release
                </StyledTitle>

                <StyledDescription>
                    Connect your application metrics to your flags. If a release
                    moves the wrong number the wrong way, Unleash turns the flag
                    off in that environment automatically. No alerts to triage,
                    no manual rollback.
                </StyledDescription>

                <DiagramContainer>
                    <StyledDiagram
                        viewBox='0 0 600 200'
                        role='img'
                        aria-label='Animated diagram: an impact metric line crosses a threshold, triggers a safeguard, and turns the flag off in that environment.'
                    >
                        {/* Node 1: Metric */}
                        <g transform='translate(10, 20)'>
                            <rect
                                className='node-rect'
                                x='0'
                                y='0'
                                width='180'
                                height='160'
                                rx='10'
                            />
                            <text className='node-label' x='90' y='26'>
                                Your impact metric
                            </text>
                            <line
                                className='axis-line'
                                x1='20'
                                y1='116'
                                x2='160'
                                y2='116'
                            />
                            <line
                                className='threshold-line'
                                x1='20'
                                y1='76'
                                x2='160'
                                y2='76'
                            />
                            <text
                                className='threshold-label'
                                x='160'
                                y='72'
                                textAnchor='end'
                            >
                                threshold
                            </text>
                            <path
                                className='metric-area'
                                d='M20,110 L42,106 L66,102 L90,94 L112,86 L130,78 L144,62 L160,54 L160,116 L20,116 Z'
                            />
                            <path
                                className='metric-line'
                                d='M20,110 L42,106 L66,102 L90,94 L112,86 L130,78 L144,62 L160,54'
                            />
                            <circle
                                className='breach-dot'
                                cx='130'
                                cy='78'
                                r='4'
                            />
                            <text className='node-sub' x='90' y='148'>
                                checkout error rate
                            </text>
                        </g>

                        {/* Arrow 1 */}
                        <g
                            className='arrow arrow-active'
                            transform='translate(196, 100)'
                        >
                            <line
                                x1='0'
                                y1='0'
                                x2='28'
                                y2='0'
                                strokeWidth='2'
                            />
                            <polygon points='28,-5 36,0 28,5' stroke='none' />
                        </g>

                        {/* Node 2: Safeguard */}
                        <g transform='translate(238, 20)'>
                            <rect
                                className='node-rect'
                                x='0'
                                y='0'
                                width='140'
                                height='160'
                                rx='10'
                            />
                            <text className='node-label' x='70' y='26'>
                                Safeguard
                            </text>
                            <g
                                className='safeguard-pulse'
                                transform='translate(70, 86)'
                            >
                                <path
                                    className='safeguard-shield'
                                    d='M0,-22 C-6,-22 -13,-19 -18,-16 L-18,-1 C-18,10 -11,18 0,22 C11,18 18,10 18,-1 L18,-16 C13,-19 6,-22 0,-22 Z'
                                    strokeWidth='2'
                                    strokeLinejoin='round'
                                />
                                <path
                                    className='safeguard-check'
                                    d='M-7,-1 L-2,4 L8,-7'
                                    fill='none'
                                    strokeWidth='2.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </g>
                            <text className='node-sub' x='70' y='148'>
                                threshold crossed
                            </text>
                        </g>

                        {/* Arrow 2 */}
                        <g
                            className='arrow arrow-active-2'
                            transform='translate(384, 100)'
                        >
                            <line
                                x1='0'
                                y1='0'
                                x2='28'
                                y2='0'
                                strokeWidth='2'
                            />
                            <polygon points='28,-5 36,0 28,5' stroke='none' />
                        </g>

                        {/* Node 3: Flag */}
                        <g transform='translate(426, 20)'>
                            <rect
                                className='node-rect'
                                x='0'
                                y='0'
                                width='164'
                                height='160'
                                rx='10'
                            />
                            <text className='node-label' x='82' y='26'>
                                Flag in production
                            </text>
                            <g transform='translate(52, 78)'>
                                <rect
                                    className='toggle-track'
                                    x='0'
                                    y='0'
                                    width='60'
                                    height='28'
                                    rx='14'
                                />
                                <circle
                                    className='toggle-knob'
                                    cx='46'
                                    cy='14'
                                    r='10'
                                />
                            </g>
                            <text className='node-sub' x='82' y='148'>
                                automatically disabled
                            </text>
                        </g>
                    </StyledDiagram>
                </DiagramContainer>

                <StyledStepList>
                    <StyledStep>
                        <StepText variant='body1'>
                            <strong>Catch issues fast.</strong> Safeguards react
                            the moment a metric crosses your threshold.
                        </StepText>
                    </StyledStep>
                    <StyledStep>
                        <StepText variant='body1'>
                            <strong>Use metrics that matter to you.</strong>{' '}
                            Define them in your code: error rate, latency,
                            conversion, anything.
                        </StepText>
                    </StyledStep>
                    <StyledStep>
                        <StepText variant='body1'>
                            <strong>Roll back automatically.</strong> The bad
                            environment turns off on its own so you can
                            investigate calmly.
                        </StepText>
                    </StyledStep>
                </StyledStepList>

                <ActionsRow>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={handleDocsClick}
                    >
                        Read the docs
                    </Button>
                    <Button variant='text' onClick={handleDismiss}>
                        Cancel
                    </Button>
                </ActionsRow>
            </ContentContainer>
        </DialogCard>
    );
};
