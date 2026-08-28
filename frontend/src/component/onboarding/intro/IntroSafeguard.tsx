import { alpha, Box, Link, styled, Typography } from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

export type SafeguardState = 'ready' | 'monitoring' | 'triggered';
export const INTRO_SAFEGUARD_ERROR_THRESHOLD = 2;

const StyledRoot = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'state' && prop !== 'embedded',
})<{ state: SafeguardState; embedded: boolean }>(
    ({ theme, state, embedded }) => ({
        '--safeguard-border':
            state === 'triggered'
                ? theme.palette.error.main
                : alpha(theme.palette.primary.main, 0.24),
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(0.75),
        padding: theme.spacing(1.25, 1.5),
        margin: embedded ? theme.spacing(1.25, 1.5, 0) : 0,
        border: '1px solid var(--safeguard-border)',
        borderRadius: theme.shape.borderRadiusMedium,
        background:
            state === 'triggered'
                ? alpha(theme.palette.error.main, 0.08)
                : alpha(theme.palette.primary.main, 0.07),
        transition: theme.transitions.create(
            ['background-color', 'border-color'],
            { duration: theme.transitions.duration.standard },
        ),
    }),
);

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontWeight: theme.typography.fontWeightBold,
    '@keyframes safeguardPulse': {
        '0%, 100%': {
            transform: 'scale(1)',
        },
        '45%': {
            transform: 'scale(1.14)',
        },
    },
    '.safeguard-triggered & > svg:first-of-type': {
        animation: 'safeguardPulse 700ms ease-out',
    },
    '@media (prefers-reduced-motion: reduce)': {
        '.safeguard-triggered & > svg:first-of-type': {
            animation: 'none',
        },
    },
}));

const StyledSentence = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    fontSize: theme.typography.body2.fontSize,
}));

const StyledRuleRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
    whiteSpace: 'normal',
}));

const StyledValue = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 28,
    padding: theme.spacing(0.25, 0.75),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusSmall,
    color: theme.palette.text.primary,
    background: theme.palette.background.paper,
}));

interface IIntroSafeguardProps {
    state: SafeguardState;
    embedded?: boolean;
}

export const IntroSafeguard = ({
    state,
    embedded = false,
}: IIntroSafeguardProps) => (
    <StyledRoot
        state={state}
        embedded={embedded}
        data-testid='QUICK_TOUR_INTRO_SAFEGUARD'
        className={state === 'triggered' ? 'safeguard-triggered' : undefined}
    >
        <StyledHeader>
            <ShieldOutlinedIcon
                color={state === 'triggered' ? 'error' : 'primary'}
                fontSize='small'
            />
            <span>Safeguard</span>
            <HelpIcon
                htmlTooltip
                tooltip={
                    <>
                        <Typography
                            variant='body2'
                            component='p'
                            sx={{ mb: 1 }}
                        >
                            Safeguards use impact metrics to stop a release when
                            a defined threshold is crossed.
                        </Typography>
                        <Link
                            href='https://docs.getunleash.io/guides/getting-started-release-management#configure-a-safeguard'
                            target='_blank'
                            rel='noopener noreferrer'
                            variant='body2'
                        >
                            Read more in the documentation
                        </Link>
                    </>
                }
            />
        </StyledHeader>

        <StyledSentence>
            <StyledRuleRow>
                <span>Disable environment when</span>
                <StyledValue>errors</StyledValue>
                <span>exceeds</span>
                <StyledValue>{INTRO_SAFEGUARD_ERROR_THRESHOLD}</StyledValue>
                <span>in</span>
                <StyledValue>last minute</StyledValue>
            </StyledRuleRow>
        </StyledSentence>
    </StyledRoot>
);
