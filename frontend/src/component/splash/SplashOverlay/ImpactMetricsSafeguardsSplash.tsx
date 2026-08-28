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
import { useEventTracker } from 'hooks/useEventTracker';

const DOCS_URL = 'https://docs.getunleash.io/concepts/impact-metrics';
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

const DiagramContainer = styled(Box)(({ theme }) => ({
    width: '100%',
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(8, 2),
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const CYCLE_MS = 6000;

const StyledDiagram = styled('svg')(({ theme }) => ({
    width: '100%',
    maxWidth: 620,
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
    },
    '& .safeguard-shield': {
        stroke: theme.palette.primary.main,
        fill: theme.palette.primary.main,
        fillOpacity: 0.08,
        strokeWidth: 2,
        animation: `safeguardTrigger ${CYCLE_MS}ms ease-in-out infinite, safeguardShieldFill ${CYCLE_MS}ms ease-in-out infinite`,
    },
    '& .safeguard-check': {
        stroke: theme.palette.primary.main,
        animation: `safeguardTrigger ${CYCLE_MS}ms ease-in-out infinite, safeguardCheckFlash ${CYCLE_MS}ms ease-in-out infinite`,
    },
    '& .safeguard-glow': {
        fill: theme.palette.error.main,
        opacity: 0,
        animation: `safeguardGlow ${CYCLE_MS}ms ease-in-out infinite`,
        transformOrigin: 'center',
        transformBox: 'fill-box',
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
        '0%, 53%': { opacity: 0, r: 3 },
        '57%': { opacity: 1, r: 7 },
        '63%': { opacity: 1, r: 4 },
        '100%': { opacity: 1, r: 4 },
    },
    '@keyframes arrowFlash': {
        '0%, 57%': { opacity: 0.45 },
        '62%, 68%': { opacity: 1 },
        '74%, 100%': { opacity: 0.45 },
    },
    '@keyframes arrowFlash2': {
        '0%, 78%': { opacity: 0.45 },
        '82%, 88%': { opacity: 1 },
        '94%, 100%': { opacity: 0.45 },
    },
    '@keyframes safeguardTrigger': {
        '0%, 67%': { transform: 'scale(1)' },
        '72%': { transform: 'scale(1.25)' },
        '78%': { transform: 'scale(0.95)' },
        '84%, 100%': { transform: 'scale(1.05)' },
    },
    '@keyframes safeguardShieldFill': {
        '0%, 67%': {
            fill: theme.palette.primary.main,
            stroke: theme.palette.primary.main,
            fillOpacity: 0.08,
            strokeWidth: 2,
        },
        '72%': {
            fill: theme.palette.error.main,
            stroke: theme.palette.error.main,
            fillOpacity: 0.95,
            strokeWidth: 3,
        },
        '84%, 100%': {
            fill: theme.palette.error.main,
            stroke: theme.palette.error.main,
            fillOpacity: 0.85,
            strokeWidth: 2.5,
        },
    },
    '@keyframes safeguardCheckFlash': {
        '0%, 67%': {
            stroke: theme.palette.primary.main,
            strokeWidth: 2.5,
        },
        '72%, 84%': {
            stroke: theme.palette.common.white,
            strokeWidth: 3.5,
        },
        '100%': {
            stroke: theme.palette.common.white,
            strokeWidth: 3,
        },
    },
    '@keyframes safeguardGlow': {
        '0%, 67%': { opacity: 0, transform: 'scale(0.8)' },
        '72%': { opacity: 0.45, transform: 'scale(1.6)' },
        '84%, 100%': { opacity: 0, transform: 'scale(2)' },
    },
    '@keyframes toggleTrackFlip': {
        '0%, 88%': { fill: theme.palette.primary.main },
        '92%, 100%': { fill: theme.palette.action.disabled },
    },
    '@keyframes toggleKnobSlide': {
        '0%, 88%': { transform: 'translateX(0)' },
        '92%, 100%': { transform: 'translateX(-32px)' },
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
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

const StepTitle = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
}));

const StepBody = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
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
    const { trackEvent } = useEventTracker();
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
        trackEvent('impact-metrics-safeguards-splash', {
            props: { eventType: 'displayed' },
        });
    }, [trackDisplayed, trackEvent]);

    const handleDocsClick = () => {
        trackDocsClicked();
        trackEvent('impact-metrics-safeguards-splash', {
            props: { eventType: 'docs-click' },
        });
        window.open(DOCS_URL, '_blank', 'noopener,noreferrer');
        onClose();
    };

    const handleDismiss = () => {
        trackDismissed();
        trackEvent('impact-metrics-safeguards-splash', {
            props: { eventType: 'dismissed' },
        });
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

                <DiagramContainer>
                    <StyledDiagram
                        viewBox='0 0 660 200'
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
                            <text className='node-label' x='90' y='24'>
                                Your impact metric
                            </text>
                            <text className='node-sub' x='90' y='42'>
                                checkout error rate
                            </text>
                            <line
                                className='axis-line'
                                x1='18'
                                y1='140'
                                x2='162'
                                y2='140'
                            />
                            <line
                                className='threshold-line'
                                x1='18'
                                y1='96'
                                x2='162'
                                y2='96'
                            />
                            <text
                                className='threshold-label'
                                x='162'
                                y='92'
                                textAnchor='end'
                            >
                                threshold
                            </text>
                            <path
                                className='metric-area'
                                d='M18,134 L42,130 L66,124 L90,116 L114,108 L132,100 L146,84 L162,76 L162,140 L18,140 Z'
                            />
                            <path
                                className='metric-line'
                                d='M18,134 L42,130 L66,124 L90,116 L114,108 L132,100 L146,84 L162,76'
                            />
                            <circle
                                className='breach-dot'
                                cx='132'
                                cy='100'
                                r='4'
                            />
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
                                width='180'
                                height='160'
                                rx='10'
                            />
                            <text className='node-label' x='90' y='24'>
                                Safeguard
                            </text>
                            <text className='node-sub' x='90' y='42'>
                                threshold crossed
                            </text>
                            <circle
                                className='safeguard-glow'
                                cx='90'
                                cy='108'
                                r='30'
                            />
                            <g
                                className='safeguard-pulse'
                                transform='translate(90, 108)'
                            >
                                <path
                                    className='safeguard-shield'
                                    d='M0,-26 C-7,-26 -15,-22 -22,-19 L-22,-1 C-22,12 -13,21 0,26 C13,21 22,12 22,-1 L22,-19 C15,-22 7,-26 0,-26 Z'
                                    strokeLinejoin='round'
                                />
                                <path
                                    className='safeguard-check'
                                    d='M-9,-1 L-3,5 L10,-8'
                                    fill='none'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </g>
                        </g>

                        {/* Arrow 2 */}
                        <g
                            className='arrow arrow-active-2'
                            transform='translate(424, 100)'
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
                        <g transform='translate(466, 20)'>
                            <rect
                                className='node-rect'
                                x='0'
                                y='0'
                                width='180'
                                height='160'
                                rx='10'
                            />
                            <text className='node-label' x='90' y='24'>
                                Flag in production
                            </text>
                            <text className='node-sub' x='90' y='42'>
                                automatically disabled
                            </text>
                            <g transform='translate(60, 96)'>
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
                        </g>
                    </StyledDiagram>
                </DiagramContainer>

                <StyledStepList>
                    <StyledStep>
                        <StepText variant='body1'>
                            <StepTitle>Catch issues fast</StepTitle>
                            <StepBody>
                                Safeguards react the moment a metric crosses
                                your threshold.
                            </StepBody>
                        </StepText>
                    </StyledStep>
                    <StyledStep>
                        <StepText variant='body1'>
                            <StepTitle>
                                Use metrics that matter to you
                            </StepTitle>
                            <StepBody>
                                Define them in your code: error rate, latency,
                                conversion, anything.
                            </StepBody>
                        </StepText>
                    </StyledStep>
                    <StyledStep>
                        <StepText variant='body1'>
                            <StepTitle>Roll back automatically</StepTitle>
                            <StepBody>
                                The bad environment turns off on its own so you
                                can investigate calmly.
                            </StepBody>
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
