import { useCallback, useEffect, useRef, useState } from 'react';
import {
    alpha,
    Box,
    Chip,
    IconButton,
    Paper,
    Popper,
    styled,
    Typography,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import {
    INTRO_PLANS,
    type IntroFlagConfig,
    type IntroUser,
    type IntroVariant,
    type UserEvaluation,
} from './introModel.js';
import { IntroAvatar, IntroCharacter } from './IntroCharacter.tsx';
import { getVariantSolidFill } from './introVariantColor.js';

export type GridMode =
    | 'rollout'
    | 'target'
    | 'variants'
    | 'impact'
    | 'safeguard';

const StyledGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: theme.spacing(1.25),
    [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
}));

const StyledPerson = styled('button', {
    shouldForwardProp: (prop) =>
        ![
            'selected',
            'stateColor',
            'stateBackground',
            'activationDelayMs',
            'errored',
        ].includes(prop as string),
})<{
    selected: boolean;
    stateColor?: string;
    stateBackground?: string;
    activationDelayMs: number;
    errored: boolean;
}>(
    ({
        theme,
        selected,
        stateColor,
        stateBackground,
        activationDelayMs,
        errored,
    }) => ({
        all: 'unset',
        boxSizing: 'border-box',
        cursor: 'pointer',
        display: 'grid',
        gridTemplateColumns: '48px minmax(0, 1fr) 54px',
        alignItems: 'center',
        gap: theme.spacing(1),
        minWidth: 0,
        padding: theme.spacing(0.9),
        borderRadius: theme.shape.borderRadiusMedium,
        backgroundColor: stateBackground ?? theme.palette.background.paper,
        border: `1px solid ${stateColor ?? theme.palette.divider}`,
        outline: selected
            ? `2px solid ${stateColor ?? theme.palette.primary.main}`
            : '2px solid transparent',
        outlineOffset: 1,
        transition: theme.transitions.create(
            ['background-color', 'border-color', 'outline-color'],
            {
                duration: theme.transitions.duration.standard,
                easing: theme.transitions.easing.easeOut,
                delay: errored ? 0 : activationDelayMs,
            },
        ),
        '&:hover': {
            borderColor: stateColor ?? theme.palette.primary.main,
        },
        '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
        },
        '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
            animation: 'none',
        },
    }),
);

const StyledAvatar = styled(Box)({
    width: 48,
    alignSelf: 'start',
});

const StyledIdentity = styled(Box)({
    minWidth: 0,
});

const StyledName = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

const StyledMeta = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

const StyledCountry = styled(StyledMeta)(({ theme }) => ({
    color: theme.palette.text.primary,
    marginTop: theme.spacing(0.125),
}));

const StyledMiniPreview = styled(Box, {
    shouldForwardProp: (prop) =>
        !['smart', 'errored', 'restored', 'accent', 'delayMs'].includes(
            String(prop),
        ),
})<{
    smart: boolean;
    errored: boolean;
    restored: boolean;
    accent: string;
    delayMs: number;
}>(({ theme, smart, errored, restored, accent, delayMs }) => ({
    width: 56,
    height: 46,
    position: 'relative',
    overflow: 'hidden',
    justifySelf: 'center',
    alignSelf: 'center',
    padding: 3,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${
        errored
            ? theme.palette.error.main
            : smart
              ? alpha(accent, 0.75)
              : theme.palette.divider
    }`,
    backgroundColor: errored
        ? alpha(theme.palette.error.main, 0.12)
        : smart
          ? alpha(accent, 0.14)
          : theme.palette.background.elevation1,
    '&::after': {
        content: '""',
        position: 'absolute',
        zIndex: 2,
        inset: 0,
        width: '38%',
        pointerEvents: 'none',
        opacity: smart ? 0.65 : 0,
        transform: smart || errored ? 'translateX(300%)' : 'translateX(-120%)',
        background: `linear-gradient(90deg, transparent, ${alpha(
            theme.palette.common.white,
            0.45,
        )}, transparent)`,
        animation: restored
            ? `intro-restore-sweep 650ms ${theme.transitions.easing.easeOut}`
            : 'none',
        transition: theme.transitions.create(['transform', 'opacity'], {
            duration: 650,
            easing: theme.transitions.easing.easeOut,
            delay: errored ? 0 : delayMs,
        }),
    },
    '@keyframes intro-restore-sweep': {
        '0%': {
            opacity: 0,
            transform: 'translateX(300%)',
        },
        '20%': {
            opacity: 0.65,
        },
        '100%': {
            opacity: 0,
            transform: 'translateX(-120%)',
        },
    },
    transition: theme.transitions.create(['background-color', 'border-color'], {
        duration: theme.transitions.duration.standard,
        easing: theme.transitions.easing.easeOut,
        delay: errored ? 0 : delayMs,
    }),
    '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
    },
}));

const StyledMiniContent = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'visible' && prop !== 'delayMs',
})<{ visible: boolean; delayMs: number }>(({ theme, visible, delayMs }) => ({
    position: 'absolute',
    zIndex: 1,
    inset: 3,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    opacity: visible ? 1 : 0,
    transition: theme.transitions.create('opacity', {
        duration: theme.transitions.duration.shorter,
        easing: theme.transitions.easing.easeOut,
        delay: visible ? delayMs : 0,
    }),
    '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
    },
}));

const StyledMiniChrome = styled(Box)(({ theme }) => ({
    height: 5,
    display: 'flex',
    justifyContent: 'flex-start',
    gap: 2,
    '& span': {
        width: 3,
        height: 3,
        borderRadius: 999,
        background: theme.palette.text.secondary,
        opacity: 0.55,
    },
}));

const StyledMiniSearch = styled(Box, {
    shouldForwardProp: (prop) =>
        !['smart', 'accent', 'delayMs'].includes(String(prop)),
})<{ smart: boolean; accent: string; delayMs: number }>(
    ({ theme, smart, accent, delayMs }) => ({
        height: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 3px',
        borderRadius: 999,
        color: smart ? accent : theme.palette.text.secondary,
        backgroundColor: smart
            ? alpha(accent, 0.22)
            : alpha(theme.palette.text.secondary, 0.1),
        fontSize: 6,
        lineHeight: 1,
        transition: theme.transitions.create(['background-color', 'color'], {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeOut,
            delay: delayMs,
        }),
        '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
        },
    }),
);

const StyledMiniResults = styled(Box)({
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'repeat(3, 1fr)',
    gap: 2,
});

const StyledMiniSparkle = styled('span', {
    shouldForwardProp: (prop) =>
        !['visible', 'accent', 'delayMs'].includes(String(prop)),
})<{ visible: boolean; accent: string; delayMs: number }>(
    ({ theme, visible, accent, delayMs }) => ({
        opacity: visible ? 1 : 0,
        color: accent,
        transition: theme.transitions.create(['opacity', 'color'], {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeOut,
            delay: delayMs,
        }),
        '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
        },
    }),
);

const StyledMiniResult = styled('span', {
    shouldForwardProp: (prop) =>
        !['smart', 'accent', 'delayMs'].includes(String(prop)),
})<{ smart: boolean; accent: string; delayMs: number }>(
    ({ theme, smart, accent, delayMs }) => ({
        display: 'block',
        minWidth: 0,
        borderRadius: 2,
        backgroundColor: smart
            ? alpha(accent, 0.48)
            : alpha(theme.palette.text.secondary, 0.22),
        transition: theme.transitions.create('background-color', {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeOut,
            delay: delayMs,
        }),
        '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
        },
    }),
);

const StyledMiniError = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'visible',
})<{ visible: boolean }>(({ theme, visible }) => ({
    position: 'absolute',
    zIndex: 1,
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: visible ? 1 : 0,
    color: theme.palette.error.main,
    fontWeight: theme.typography.fontWeightBold,
    transition: theme.transitions.create('opacity', {
        duration: theme.transitions.duration.shorter,
        easing: theme.transitions.easing.easeOut,
    }),
    '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
    },
}));

const POPOVER_OFFSET = 8;
const POPOVER_VIEWPORT_PADDING = 16;

const StyledPopoverContent = styled(Box)(({ theme }) => ({
    boxSizing: 'border-box',
    width: theme.spacing(50),
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'inherit',
    display: 'flex',
    flexDirection: 'column',
}));

const StyledPopoverHeader = styled(Box)(({ theme }) => ({
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: theme.spacing(3.5),
    padding: theme.spacing(2, 2, 1.5),
}));

const StyledPopoverBody = styled(Box)(({ theme }) => ({
    minHeight: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    padding: theme.spacing(0, 2, 2),
    '& > *': {
        flexShrink: 0,
    },
}));

const StyledPopoverTitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledPopoverClose = styled(IconButton)(({ theme }) => ({
    width: 28,
    height: 28,
    padding: theme.spacing(0.5),
    margin: theme.spacing(-0.75, -0.75, -0.75, 0),
    borderRadius: '50%',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const StyledEvaluationPanel = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(1.25),
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.background.elevation1,
    fontSize: theme.fontSizes.smallBody,
    lineHeight: 1.45,
}));

const StyledExplanation = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledContext = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    paddingTop: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const StyledContextLabel = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledContextJson = styled('pre')(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(0.75, 1),
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
    lineHeight: 1.45,
    overflowX: 'auto',
    '& .json-key': {
        color: theme.palette.primary.main,
    },
    '& .json-string': {
        color: theme.palette.success.main,
    },
    '& .json-punctuation': {
        color: theme.palette.text.secondary,
    },
}));

const StyledSearchPreview = styled(Box, {
    shouldForwardProp: (prop) =>
        !['smart', 'errored', 'restored', 'accent'].includes(String(prop)),
})<{ smart: boolean; errored: boolean; restored: boolean; accent: string }>(
    ({ theme, smart, errored, restored, accent }) => {
        const activeColor = errored ? theme.palette.error.main : accent;
        const enhanced = smart || errored;

        return {
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(1),
            padding: theme.spacing(1.5),
            borderRadius: theme.shape.borderRadiusLarge,
            border: `1px solid ${
                enhanced ? activeColor : theme.palette.divider
            }`,
            backgroundColor: enhanced
                ? alpha(activeColor, 0.06)
                : theme.palette.background.elevation1,
            transition: theme.transitions.create(
                ['background-color', 'border-color'],
                {
                    duration: errored
                        ? theme.transitions.duration.shorter
                        : 480,
                    easing: theme.transitions.easing.easeOut,
                },
            ),
            '& > *': {
                position: 'relative',
                zIndex: 1,
            },
            '&::after': {
                content: '""',
                position: 'absolute',
                zIndex: 2,
                inset: 0,
                width: '38%',
                pointerEvents: 'none',
                opacity: smart ? 0.65 : 0,
                transform:
                    smart || errored ? 'translateX(300%)' : 'translateX(-120%)',
                background: `linear-gradient(90deg, transparent, ${alpha(
                    theme.palette.common.white,
                    0.35,
                )}, transparent)`,
                animation: restored
                    ? `intro-popover-restore-sweep 650ms ${theme.transitions.easing.easeOut}`
                    : 'none',
                transition: theme.transitions.create(['transform', 'opacity'], {
                    duration: 650,
                    easing: theme.transitions.easing.easeOut,
                }),
            },
            '@keyframes intro-popover-restore-sweep': {
                '0%': {
                    opacity: 0,
                    transform: 'translateX(300%)',
                },
                '20%': {
                    opacity: 0.65,
                },
                '100%': {
                    opacity: 0,
                    transform: 'translateX(-120%)',
                },
            },
            '@media (prefers-reduced-motion: reduce)': {
                transition: 'none',
                '& *': {
                    transition: 'none !important',
                },
                '&::after': {
                    display: 'none',
                },
            },
        };
    },
);

const StyledPreviewHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
}));

const StyledPreviewActions = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledExperienceChip = styled(Chip, {
    shouldForwardProp: (prop) =>
        !['smart', 'errored', 'accent'].includes(String(prop)),
})<{ smart: boolean; errored: boolean; accent: string }>(
    ({ theme, smart, errored, accent }) => ({
        minWidth: 118,
        transition: theme.transitions.create(
            ['background-color', 'border-color', 'color'],
            {
                duration: errored
                    ? theme.transitions.duration.shorter
                    : theme.transitions.duration.standard,
                easing: theme.transitions.easing.easeOut,
            },
        ),
        ...(smart || errored
            ? {
                  backgroundColor: errored
                      ? theme.palette.error.main
                      : getVariantSolidFill(accent),
                  color: theme.palette.common.white,
                  '&:hover': {
                      backgroundColor: errored
                          ? theme.palette.error.main
                          : getVariantSolidFill(accent),
                  },
              }
            : {}),
    }),
);

const StyledSearchInput = styled(Box, {
    shouldForwardProp: (prop) =>
        !['smart', 'errored', 'accent'].includes(String(prop)),
})<{ smart: boolean; errored: boolean; accent: string }>(
    ({ theme, smart, errored, accent }) => {
        const activeColor = errored ? theme.palette.error.main : accent;
        const enhanced = smart || errored;

        return {
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing(0.75),
            padding: theme.spacing(0.85, 1.1),
            borderRadius: 999,
            border: `1px solid ${
                enhanced ? alpha(activeColor, 0.65) : theme.palette.divider
            }`,
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            fontSize: theme.fontSizes.smallBody,
            transition: theme.transitions.create(
                ['border-color', 'background-color'],
                {
                    duration: errored
                        ? theme.transitions.duration.shorter
                        : 480,
                    easing: theme.transitions.easing.easeOut,
                },
            ),
        };
    },
);

const StyledFullSparkle = styled('span', {
    shouldForwardProp: (prop) => !['visible', 'accent'].includes(String(prop)),
})<{ visible: boolean; accent: string }>(({ theme, visible, accent }) => ({
    marginLeft: 'auto',
    opacity: visible ? 1 : 0,
    color: accent,
    transition: theme.transitions.create(['opacity', 'color'], {
        duration: 420,
        easing: theme.transitions.easing.easeOut,
    }),
}));

const StyledPreviewBody = styled(Box)({
    position: 'relative',
    height: 240,
    overflow: 'hidden',
});

const StyledPreviewState = styled(Box, {
    shouldForwardProp: (prop) => !['visible', 'animate'].includes(String(prop)),
})<{ visible: boolean; animate: boolean }>(({ theme, visible, animate }) => ({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: theme.spacing(1),
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? 'auto' : 'none',
    transition: animate
        ? theme.transitions.create('opacity', {
              duration: 420,
              easing: theme.transitions.easing.easeOut,
          })
        : 'none',
}));

const StyledClassicMeta = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 33,
    padding: '7px 0',
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledAiSummary = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'accent',
})<{ accent: string }>(({ theme, accent }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    boxSizing: 'border-box',
    height: 52,
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadiusMedium,
    color: theme.palette.text.primary,
    background: alpha(accent, 0.14),
    border: `1px solid ${alpha(accent, 0.45)}`,
    fontSize: theme.fontSizes.smallerBody,
    lineHeight: 1.45,
    transition: theme.transitions.create(['background-color', 'border-color'], {
        duration: 480,
        easing: theme.transitions.easing.easeOut,
    }),
}));

const StyledSuggestionRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
}));

const StyledErrorSummary = styled(Box)(({ theme }) => ({
    boxSizing: 'border-box',
    minHeight: 84,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1.25),
    borderRadius: theme.shape.borderRadiusMedium,
    color: theme.palette.error.main,
    background: alpha(theme.palette.error.main, 0.1),
    border: `1px solid ${alpha(theme.palette.error.main, 0.5)}`,
    fontSize: theme.fontSizes.smallerBody,
    lineHeight: 1.45,
    '& svg': {
        flexShrink: 0,
    },
}));

const StyledErroredResults = styled(Box)({
    opacity: 0.42,
    filter: 'saturate(0.35)',
});

const StyledResults = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.75),
}));

const StyledResult = styled(Box, {
    shouldForwardProp: (prop) => !['smart', 'accent'].includes(String(prop)),
})<{ smart: boolean; accent: string }>(({ theme, smart, accent }) => ({
    display: 'grid',
    gridTemplateColumns: '38px 1fr',
    gap: theme.spacing(0.75),
    minWidth: 0,
    padding: theme.spacing(0.7),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${smart ? alpha(accent, 0.35) : theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: theme.transitions.create('border-color', {
        duration: 480,
        easing: theme.transitions.easing.easeOut,
    }),
}));

const StyledResultImage = styled(Box, {
    shouldForwardProp: (prop) => !['smart', 'accent'].includes(String(prop)),
})<{ smart: boolean; accent: string }>(({ theme, smart, accent }) => ({
    height: 34,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: smart ? alpha(accent, 0.5) : theme.palette.divider,
    transition: theme.transitions.create('background-color', {
        duration: 480,
        easing: theme.transitions.easing.easeOut,
    }),
}));

const StyledResultCopy = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
}));

const StyledResultLine = styled(Box, {
    shouldForwardProp: (prop) =>
        !['width', 'smart', 'accent'].includes(String(prop)),
})<{ width: string; smart: boolean; accent: string }>(
    ({ theme, width, smart, accent }) => ({
        width,
        height: 5,
        borderRadius: 999,
        backgroundColor: smart ? alpha(accent, 0.5) : theme.palette.divider,
        transition: theme.transitions.create('background-color', {
            duration: 480,
            easing: theme.transitions.easing.easeOut,
        }),
    }),
);

type TargetingConfig = Pick<
    IntroFlagConfig,
    'targetCountryCodes' | 'targetPlans'
>;

const naturalList = (items: string[]): string => {
    if (items.length < 2) return items[0] ?? '';
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;
};

const constraintCountLabel = (count: number): string => {
    if (count === 1) return 'the constraint';
    if (count === 2) return 'both constraints';
    if (count === 3) return 'all three constraints';
    return `all ${count} constraints`;
};

const constraintExplanation = (
    user: IntroUser,
    targeting: TargetingConfig,
):
    | { activeCount: number; matches: true; values: string[] }
    | { activeCount: number; matches: false; failures: string[] } => {
    const activeCount = [
        targeting.targetCountryCodes.length > 0,
        Boolean(targeting.targetPlans?.length),
    ].filter(Boolean).length;
    const values: string[] = [];
    const failures: string[] = [];
    const plan =
        INTRO_PLANS.find((option) => option.value === user.plan)?.label ??
        user.plan;

    if (targeting.targetCountryCodes.length > 0) {
        if (targeting.targetCountryCodes.includes(user.country.code)) {
            values.push(user.country.label);
        } else {
            failures.push(
                `${user.country.label} is not one of the targeted countries`,
            );
        }
    }
    if (targeting.targetPlans?.length) {
        if (targeting.targetPlans.includes(user.plan)) {
            values.push(`the ${plan} plan`);
        } else {
            failures.push(`${plan} is not one of the targeted plans`);
        }
    }

    return failures.length
        ? { activeCount, matches: false, failures }
        : { activeCount, matches: true, values };
};

const evaluationReason = (
    user: IntroUser,
    evaluation: UserEvaluation | undefined,
    rollout: number,
    environmentEnabled: boolean,
    errored: boolean,
    targeting: TargetingConfig,
    variant?: IntroVariant,
    explainVariantAllocation = false,
): string => {
    if (!evaluation) return `${user.name} has not been evaluated.`;
    if (!environmentEnabled) {
        return `${user.name} sees Classic Search because production is disabled.`;
    }
    const constraints = constraintExplanation(user, targeting);
    if (!constraints.matches) {
        return `${user.name} sees Classic Search because ${naturalList(constraints.failures)}.`;
    }
    if (!evaluation.enabled) {
        if (constraints.activeCount > 0) {
            const count = constraintCountLabel(constraints.activeCount);
            return `${user.name} matches ${count}: ${naturalList(constraints.values)}, but sees Classic Search because the rollout does not include their bucket (${rollout} < ${evaluation.rolloutBucket}).`;
        }
        return `${user.name} sees Classic Search because the rollout does not include their bucket (${rollout} < ${evaluation.rolloutBucket}).`;
    }
    if (errored) {
        const experience = variant?.label
            ? `the ${variant.label} variant (${variant.name})`
            : 'Smart Search';
        return `${user.name} gets ${experience}, but their search request returned an error.`;
    }
    const experience = variant?.label
        ? `the ${variant.label} variant (${variant.name})`
        : 'Smart Search';
    const allocation =
        variant && explainVariantAllocation
            ? ` Variant ${variant.name} has a ${Math.round(variant.weight)}% allocation, and ${user.name}'s assignment stays sticky.`
            : '';
    if (constraints.activeCount > 0) {
        const count = constraintCountLabel(constraints.activeCount);
        return `${user.name} gets ${experience} because ${naturalList(constraints.values)} match ${count}, and the rollout includes their bucket (${rollout} ≥ ${evaluation.rolloutBucket}).${allocation}`;
    }
    return `${user.name} gets ${experience} because the rollout includes their bucket (${rollout} ≥ ${evaluation.rolloutBucket}).${allocation}`;
};

interface IIntroUserGridProps {
    users: IntroUser[];
    evaluations: UserEvaluation[];
    mode: GridMode;
    variants?: IntroVariant[];
    environmentEnabled: boolean;
    rollout: number;
    targeting: TargetingConfig;
    erroredUserIds?: readonly string[];
    selectedId?: string;
    onSelect: (user: IntroUser | undefined) => void;
}

/**
 * Stable context cards. Identity stays vivid; exposure is conveyed by the
 * experience strip, raised arm, border, and a detailed app preview.
 */
export const IntroUserGrid = ({
    users,
    evaluations,
    mode,
    variants = [],
    environmentEnabled,
    rollout,
    targeting,
    erroredUserIds = [],
    selectedId,
    onSelect,
}: IIntroUserGridProps) => {
    const erroredUserIdSet = new Set(erroredUserIds);

    const theme = useTheme();
    const [openUserId, setOpenUserId] = useState<string | undefined>();
    const [restoredUserIds, setRestoredUserIds] = useState<Set<string>>(
        () => new Set(),
    );
    const [popoverMaxHeight, setPopoverMaxHeight] = useState<
        number | undefined
    >();
    const previousErroredUserIds = useRef<Set<string>>(new Set());
    const restoreAnimationTimer = useRef<number | undefined>(undefined);
    const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
    const setButtonRef = useCallback(
        (userId: string) => (node: HTMLButtonElement | null) => {
            if (node) buttonRefs.current.set(userId, node);
            else buttonRefs.current.delete(userId);
        },
        [],
    );

    useEffect(() => {
        const currentErroredUserIds = new Set(erroredUserIds);
        const restored = [...previousErroredUserIds.current].filter(
            (userId) => !currentErroredUserIds.has(userId),
        );
        previousErroredUserIds.current = currentErroredUserIds;

        if (restored.length > 0) {
            window.clearTimeout(restoreAnimationTimer.current);
            setRestoredUserIds(new Set(restored));
            restoreAnimationTimer.current = window.setTimeout(
                () => setRestoredUserIds(new Set()),
                700,
            );
        }
    }, [erroredUserIds]);

    useEffect(
        () => () => window.clearTimeout(restoreAnimationTimer.current),
        [],
    );

    const openUser = users.find((user) => user.id === openUserId);
    const openEvaluation = openUser
        ? evaluations[users.indexOf(openUser)]
        : undefined;
    const openPlan = openUser
        ? INTRO_PLANS.find((option) => option.value === openUser.plan)
        : undefined;
    const openVariant = openEvaluation?.variant
        ? variants.find((variant) => variant.name === openEvaluation.variant)
        : undefined;
    const openSmart =
        Boolean(environmentEnabled && openEvaluation?.enabled) &&
        !erroredUserIdSet.has(openUser?.id ?? '');
    const openErrored = erroredUserIdSet.has(openUser?.id ?? '');
    const openRestored = restoredUserIds.has(openUser?.id ?? '');

    const closePreview = () => {
        setOpenUserId(undefined);
        onSelect(undefined);
    };

    const preview = (
        smart: boolean,
        variant: IntroVariant | undefined,
        errored: boolean,
        restored: boolean,
    ) => {
        const accent = variant?.color ?? theme.palette.primary.main;
        const renderResults = (count: number, resultSmart: boolean) => (
            <StyledResults>
                {Array.from({ length: count }, (_, index) => (
                    <StyledResult
                        key={index}
                        smart={resultSmart}
                        accent={accent}
                    >
                        <StyledResultImage
                            smart={resultSmart}
                            accent={accent}
                        />
                        <StyledResultCopy>
                            <StyledResultLine
                                width='62%'
                                smart={resultSmart}
                                accent={accent}
                            />
                            <StyledResultLine
                                width='88%'
                                smart={resultSmart}
                                accent={accent}
                            />
                        </StyledResultCopy>
                    </StyledResult>
                ))}
            </StyledResults>
        );

        return (
            <StyledSearchPreview
                smart={smart}
                errored={errored}
                restored={restored}
                accent={accent}
            >
                <StyledPreviewHeader>
                    <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                        {smart || errored ? '✦ Smart Search' : 'Classic Search'}
                    </Typography>
                    <StyledPreviewActions>
                        <StyledExperienceChip
                            label={
                                errored
                                    ? 'Search error'
                                    : smart
                                      ? variant?.label
                                          ? `${variant.name} · ${variant.label}`
                                          : 'AI-powered'
                                      : 'Current experience'
                            }
                            size='small'
                            smart={smart}
                            errored={errored}
                            accent={accent}
                            variant={smart || errored ? 'filled' : 'outlined'}
                        />
                    </StyledPreviewActions>
                </StyledPreviewHeader>
                <StyledSearchInput
                    smart={smart}
                    errored={errored}
                    accent={accent}
                    data-testid='QUICK_TOUR_INTRO_SEARCH_INPUT'
                >
                    <span>⌕</span>
                    <span>
                        {smart ? (variant?.placeholder ?? 'Search') : 'Search'}
                    </span>
                    <StyledFullSparkle
                        visible={smart && !errored}
                        accent={accent}
                    >
                        ✦
                    </StyledFullSparkle>
                </StyledSearchInput>
                <StyledPreviewBody>
                    <StyledPreviewState
                        visible={!smart && !errored}
                        animate={!errored}
                        aria-hidden={smart || errored}
                    >
                        <StyledClassicMeta>
                            <span>128 results</span>
                            <span>Sorted by relevance</span>
                        </StyledClassicMeta>
                        {renderResults(4, false)}
                    </StyledPreviewState>
                    <StyledPreviewState
                        visible={smart}
                        animate={!errored}
                        aria-hidden={!smart}
                    >
                        <StyledAiSummary accent={accent}>
                            <span>✦</span>
                            <span>
                                An instant answer generated from the most
                                relevant results.
                            </span>
                        </StyledAiSummary>
                        <StyledSuggestionRow>
                            <Chip label='Top match' size='small' />
                            <Chip label='Suggested' size='small' />
                            <Chip label='Recent' size='small' />
                        </StyledSuggestionRow>
                        {renderResults(3, true)}
                    </StyledPreviewState>
                    <StyledPreviewState
                        visible={errored}
                        animate={!errored}
                        aria-hidden={!errored}
                    >
                        <StyledErrorSummary data-testid='QUICK_TOUR_INTRO_ERROR_PREVIEW'>
                            <ErrorOutlineIcon />
                            <span>
                                Smart Search returned an error. The rest of the
                                application is still working.
                            </span>
                        </StyledErrorSummary>
                        <StyledErroredResults>
                            {renderResults(3, false)}
                        </StyledErroredResults>
                    </StyledPreviewState>
                </StyledPreviewBody>
            </StyledSearchPreview>
        );
    };

    return (
        <>
            <StyledGrid data-testid='QUICK_TOUR_INTRO_USER_GRID'>
                {users.map((user, index) => {
                    const evaluation = evaluations[index];
                    const plan =
                        INTRO_PLANS.find(
                            (option) => option.value === user.plan,
                        ) ?? INTRO_PLANS[0];
                    const enabled = evaluation?.enabled ?? false;
                    const variant = evaluation?.variant;
                    const configuredVariant = variant
                        ? variants.find((item) => item.name === variant)
                        : undefined;
                    const errored = erroredUserIdSet.has(user.id);
                    const stateColor = errored
                        ? theme.palette.error.main
                        : (configuredVariant?.color ??
                          (enabled ? theme.palette.primary.main : undefined));
                    const stateBackground = stateColor
                        ? alpha(stateColor, errored ? 0.12 : 0.08)
                        : undefined;

                    const experienceLabel = errored
                        ? 'Search unavailable'
                        : !environmentEnabled || !enabled
                          ? 'Classic Search'
                          : configuredVariant?.label
                            ? `${configuredVariant.name} · ${configuredVariant.label}`
                            : 'Smart Search';
                    const smart = environmentEnabled && enabled && !errored;
                    const previewAccent =
                        configuredVariant?.color ?? theme.palette.primary.main;
                    const activationDelayMs = Math.min(index * 18, 400);
                    const restored = restoredUserIds.has(user.id);
                    const previewDelayMs = restored ? 0 : activationDelayMs;

                    return (
                        <StyledPerson
                            key={user.id}
                            ref={setButtonRef(user.id)}
                            type='button'
                            aria-label={`${user.name}, ${user.country.label}: ${experienceLabel}`}
                            selected={selectedId === user.id}
                            stateColor={stateColor}
                            stateBackground={stateBackground}
                            activationDelayMs={activationDelayMs}
                            errored={errored}
                            onClick={(event) => {
                                const anchorBottom =
                                    event.currentTarget.getBoundingClientRect()
                                        .bottom;
                                setPopoverMaxHeight(
                                    Math.max(
                                        0,
                                        window.innerHeight -
                                            anchorBottom -
                                            POPOVER_OFFSET -
                                            POPOVER_VIEWPORT_PADDING,
                                    ),
                                );
                                setOpenUserId(user.id);
                                onSelect(user);
                            }}
                        >
                            <StyledAvatar>
                                <IntroCharacter
                                    look={user.look}
                                    raised={enabled && environmentEnabled}
                                    index={index}
                                />
                            </StyledAvatar>
                            <StyledIdentity>
                                <StyledName variant='body2'>
                                    {user.name}
                                </StyledName>
                                <StyledCountry>
                                    {user.country.flag} {user.country.label}
                                </StyledCountry>
                                <StyledMeta>{plan.label}</StyledMeta>
                            </StyledIdentity>
                            <StyledMiniPreview
                                smart={smart}
                                errored={errored}
                                restored={restored}
                                accent={previewAccent}
                                delayMs={previewDelayMs}
                                aria-hidden
                                data-testid='QUICK_TOUR_INTRO_MINI_PREVIEW'
                                data-experience={
                                    errored
                                        ? 'error'
                                        : smart
                                          ? 'smart'
                                          : 'classic'
                                }
                            >
                                <StyledMiniContent
                                    visible={!errored}
                                    delayMs={previewDelayMs}
                                >
                                    <StyledMiniChrome>
                                        <span />
                                        <span />
                                        <span />
                                    </StyledMiniChrome>
                                    <StyledMiniSearch
                                        smart={smart}
                                        accent={previewAccent}
                                        delayMs={previewDelayMs}
                                    >
                                        <span>⌕</span>
                                        <StyledMiniSparkle
                                            visible={smart}
                                            accent={previewAccent}
                                            delayMs={previewDelayMs}
                                        >
                                            ✦
                                        </StyledMiniSparkle>
                                    </StyledMiniSearch>
                                    <StyledMiniResults>
                                        {Array.from(
                                            { length: 3 },
                                            (_, resultIndex) => (
                                                <StyledMiniResult
                                                    key={resultIndex}
                                                    smart={smart}
                                                    accent={previewAccent}
                                                    delayMs={previewDelayMs}
                                                />
                                            ),
                                        )}
                                    </StyledMiniResults>
                                </StyledMiniContent>
                                <StyledMiniError visible={errored}>
                                    !
                                </StyledMiniError>
                            </StyledMiniPreview>
                        </StyledPerson>
                    );
                })}
            </StyledGrid>

            <Popper
                open={Boolean(openUserId && openUser)}
                anchorEl={
                    openUserId ? buttonRefs.current.get(openUserId) : undefined
                }
                placement='bottom'
                sx={{ zIndex: (theme) => theme.zIndex.modal }}
                modifiers={[
                    {
                        name: 'offset',
                        options: { offset: [0, 8] },
                    },
                    {
                        name: 'preventOverflow',
                        options: { padding: 16 },
                    },
                ]}
            >
                {openUser ? (
                    <Paper
                        elevation={8}
                        data-testid='QUICK_TOUR_INTRO_POPOVER'
                        data-max-height={popoverMaxHeight}
                        sx={{
                            maxHeight: popoverMaxHeight,
                            overflow: 'hidden',
                        }}
                    >
                        <StyledPopoverContent>
                            <StyledPopoverHeader>
                                <StyledPopoverTitle variant='caption'>
                                    Experience details
                                </StyledPopoverTitle>
                                <StyledPopoverClose
                                    size='small'
                                    aria-label='Close full preview'
                                    onClick={closePreview}
                                >
                                    <CloseIcon fontSize='small' />
                                </StyledPopoverClose>
                            </StyledPopoverHeader>

                            <StyledPopoverBody data-testid='QUICK_TOUR_INTRO_POPOVER_BODY'>
                                {preview(
                                    openSmart,
                                    openVariant,
                                    openErrored,
                                    openRestored,
                                )}

                                <StyledEvaluationPanel>
                                    <StyledExplanation>
                                        <IntroAvatar look={openUser.look} />
                                        <span>
                                            {evaluationReason(
                                                openUser,
                                                openEvaluation,
                                                rollout,
                                                environmentEnabled,
                                                openErrored,
                                                targeting,
                                                openVariant,
                                                mode === 'variants',
                                            )}
                                        </span>
                                    </StyledExplanation>
                                    <StyledContext>
                                        <StyledContextLabel variant='caption'>
                                            Context
                                        </StyledContextLabel>
                                        <StyledContextJson>
                                            <span className='json-punctuation'>
                                                {'{\n'}
                                            </span>
                                            {'  '}
                                            <span className='json-key'>
                                                "Country"
                                            </span>
                                            <span className='json-punctuation'>
                                                {': '}
                                            </span>
                                            <span className='json-string'>
                                                {`"${openUser.country.flag} ${openUser.country.code}"`}
                                            </span>
                                            <span className='json-punctuation'>
                                                {',\n'}
                                            </span>
                                            {'  '}
                                            <span className='json-key'>
                                                "Plan"
                                            </span>
                                            <span className='json-punctuation'>
                                                {': '}
                                            </span>
                                            <span className='json-string'>
                                                {`"${openPlan?.label}"`}
                                            </span>
                                            <span className='json-punctuation'>
                                                {'\n}'}
                                            </span>
                                        </StyledContextJson>
                                    </StyledContext>
                                </StyledEvaluationPanel>
                            </StyledPopoverBody>
                        </StyledPopoverContent>
                    </Paper>
                ) : null}
            </Popper>
        </>
    );
};
