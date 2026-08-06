import { useEffect, useMemo, useRef, useState } from 'react';
import {
    alpha,
    Box,
    Button,
    Chip,
    styled,
    Typography,
    useTheme,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useEventTracker } from 'hooks/useEventTracker.ts';
import {
    computeEvaluations,
    type IntroFlagConfig,
    type IntroUser,
    type IntroVariant,
    generateIntroUsers,
    summarize,
} from './introModel.js';
import { IntroUserGrid, type GridMode } from './IntroUserGrid.tsx';
import { IntroFlagView } from './IntroFlagView.tsx';
import { IntroImpactCharts } from './IntroImpactCharts.tsx';
import { IntroShowcase } from './IntroShowcase.tsx';
import {
    INTRO_RELEASE_PLAN_MILESTONE_MS,
    IntroReleasePlan,
    type IIntroReleaseMilestone,
    type ReleasePlanState,
} from './IntroReleasePlan.tsx';
import {
    INTRO_SAFEGUARD_ERROR_THRESHOLD,
    IntroSafeguard,
    type SafeguardState,
} from './IntroSafeguard.tsx';

const USER_COUNT = 15;
const FLAG_NAME = 'smart-search';

const VARIANT_POOL = [
    {
        name: 'A',
        label: 'Keyword search',
        placeholder: 'Search by keyword',
    },
    { name: 'B', label: 'Ask anything', placeholder: 'Ask any question' },
    {
        name: 'C',
        label: 'Quick find',
        placeholder: 'Find products, docs, or people',
    },
    {
        name: 'D',
        label: 'Guided search',
        placeholder: 'What would you like to find?',
    },
];

const evenWeights = (count: number): number[] =>
    Array.from(
        { length: count },
        (_, index) => Math.floor(100 / count) + (index < 100 % count ? 1 : 0),
    );

const makeVariants = (names: string[], palette: string[]): IntroVariant[] => {
    const weights = evenWeights(names.length);
    return names.map((name, index) => {
        const pooled = VARIANT_POOL.find((variant) => variant.name === name);
        const color = palette[index % palette.length];
        return {
            name,
            weight: weights[index],
            payload: pooled
                ? `{ "placeholder": "${pooled.placeholder}", "accent": "${color}" }`
                : undefined,
            color,
            label: pooled?.label,
            placeholder: pooled?.placeholder,
        };
    });
};

const ERROR_INCREMENT_MS = 900;
const MILESTONE_ERROR_GRACE_MS = 2_000;
const PROTECTED_RELEASE_MILESTONE_MS = 5_400;

interface IReleasePlanMilestone extends IIntroReleaseMilestone {
    targetPlans: IntroUser['plan'][];
    targetDevices: IntroUser['device'][];
}

const RELEASE_PLAN_MILESTONES: IReleasePlanMilestone[] = [
    {
        name: 'Preview with 40% of Free desktop users',
        rollout: 40,
        constraints: [
            { field: 'Plan', values: ['🥉 Free'] },
            { field: 'Device', values: ['🖥️ Desktop'] },
        ],
        targetPlans: ['free'],
        targetDevices: ['desktop'],
    },
    {
        name: 'Expand to 60% of Free + Pro desktop users',
        rollout: 60,
        constraints: [
            { field: 'Plan', values: ['🥉 Free', '🥈 Pro'] },
            { field: 'Device', values: ['🖥️ Desktop'] },
        ],
        targetPlans: ['free', 'pro'],
        targetDevices: ['desktop'],
    },
    {
        name: 'Reach 90% of all desktop users',
        rollout: 90,
        constraints: [{ field: 'Device', values: ['🖥️ Desktop'] }],
        targetPlans: [],
        targetDevices: ['desktop'],
    },
    {
        name: 'Release to everyone',
        rollout: 100,
        constraints: [],
        targetPlans: [],
        targetDevices: [],
    },
];

const withReleaseMilestone = (
    current: IntroFlagConfig,
    index: number,
): IntroFlagConfig => {
    const milestone = RELEASE_PLAN_MILESTONES[index];
    return {
        ...current,
        environmentEnabled: true,
        rollout: milestone.rollout,
        targetCountryCodes: [],
        targetPlans: milestone.targetPlans,
        targetDevices: milestone.targetDevices,
        variantsEnabled: false,
    };
};

type TopicKey =
    | 'rollout'
    | 'target'
    | 'variants'
    | 'releasePlan'
    | 'impact'
    | 'safeguard';
type IncidentState = 'idle' | 'observing' | 'alert' | 'resolved';

interface ITopic {
    key: TopicKey;
    mode: GridMode;
    title: string;
    valueTag: string;
    body: string;
}

const TOPICS: ITopic[] = [
    {
        key: 'rollout',
        mode: 'rollout',
        title: 'Release Smart Search',
        valueTag: 'Gradual rollout',
        body: 'The code is already deployed, but nobody receives Smart Search yet. Choose how much of the production audience should receive it. The same people stay included as you expand.',
    },
    {
        key: 'target',
        mode: 'target',
        title: 'Target the right audience',
        valueTag: 'Targeting',
        body: 'Constraints narrow a rollout to the audience you intend. Combine country, plan, and device just as you would in an Unleash activation strategy.',
    },
    {
        key: 'variants',
        mode: 'variants',
        title: 'Compare experiences',
        valueTag: 'Variants',
        body: 'Offer different versions of Smart Search to the same audience. Adjust how traffic is split between them. Each person keeps the same variant, giving you a reliable way to compare what works best.',
    },
    {
        key: 'releasePlan',
        mode: 'impact',
        title: 'Automate the rollout',
        valueTag: 'Release plan',
        body: 'You have configured rollout, targeting, and variants by hand. A release plan saves those choices as reusable milestones, then advances them automatically or whenever your team is ready.',
    },
    {
        key: 'impact',
        mode: 'impact',
        title: 'Observe the release',
        valueTag: 'Impact metrics',
        body: 'Releases can fail in production. Impact metrics let you watch reliability as Smart Search reaches each audience. Enable production and follow the live signals.',
    },
    {
        key: 'safeguard',
        mode: 'safeguard',
        title: 'Automate the response',
        valueTag: 'Safeguards',
        body: 'You disabled Smart Search manually when errors rose. This time, a safeguard is watching the same impact metric. Re-enable production and see how Unleash responds automatically.',
    },
];

const CORE_TOPICS = TOPICS.slice(0, 3);

const StyledPanel = styled(Box)(({ theme }) => ({
    height: '100%',
    display: 'grid',
    gridTemplateColumns: 'minmax(360px, 2fr) minmax(560px, 3fr)',
    background: theme.palette.background.paper,
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
        height: 'auto',
    },
}));

const StyledLeft = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderRight: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('md')]: {
        borderRight: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(4, 4, 2),
    flexShrink: 0,
}));

const StyledScroll = styled(Box)(({ theme }) => ({
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
    padding: theme.spacing(0, 3, 2, 4),
    [theme.breakpoints.down('md')]: {
        flex: 'unset',
        minHeight: 'auto',
        overflow: 'visible',
        padding: theme.spacing(0, 4, 2),
    },
}));

const StyledRight = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    background: theme.palette.background.elevation1,
    overflowY: 'auto',
    [theme.breakpoints.down('md')]: {
        overflow: 'visible',
    },
}));

const StyledEyebrow = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledTitle = styled('h1')(({ theme }) => ({
    margin: 0,
    fontSize: theme.typography.h1.fontSize,
}));

const StyledTitleRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(1.5),
}));

const StyledFooter = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(1.5),
    flexShrink: 0,
    padding: theme.spacing(2, 4, 4),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const StyledDots = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    marginRight: 'auto',
}));

const StyledDot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
    width: theme.spacing(1),
    height: theme.spacing(1),
    borderRadius: '50%',
    background: active ? theme.palette.primary.main : theme.palette.divider,
}));

const StyledStat = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(1),
}));

const StyledAudienceHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.35),
}));

const StyledStatValue = styled('span')(({ theme }) => ({
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.primary.main,
    fontVariantNumeric: 'tabular-nums',
}));

const StyledOutcome = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'severity',
})<{ severity: 'success' | 'error' }>(({ theme, severity }) => {
    const borderColor =
        severity === 'error'
            ? theme.palette.error.border
            : theme.palette.success.border;
    const backgroundColor =
        severity === 'error'
            ? theme.palette.error.light
            : theme.palette.success.light;
    return {
        display: 'flex',
        alignItems: 'flex-start',
        gap: theme.spacing(1.25),
        padding: theme.spacing(1.35, 1.5),
        border: `1px solid ${borderColor}`,
        borderRadius: theme.shape.borderRadiusMedium,
        color: theme.palette.text.primary,
        backgroundColor,
        fontSize: theme.fontSizes.smallBody,
        lineHeight: 1.45,
    };
});

const StyledOutcomeIcon = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'severity',
})<{ severity: 'success' | 'error' }>(({ theme, severity }) => {
    const color =
        severity === 'error'
            ? theme.palette.error.main
            : theme.palette.success.main;
    return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        flexShrink: 0,
        borderRadius: '50%',
        color,
        background: alpha(color, 0.14),
        '& svg': {
            fontSize: 18,
        },
    };
});

const StyledOutcomeCopy = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
}));

interface IIntroProps {
    onComplete: () => void;
    /** Fires when the user reaches the end of the tour (after the last topic), not on Skip or backdrop close. The showcase that follows is an optional victory-lap step. */
    onFinish?: () => void;
    advancedStepsEnabled: boolean;
}

// Unleash Intro
export const Intro = ({
    onComplete,
    onFinish,
    advancedStepsEnabled,
}: IIntroProps) => {
    const { trackEvent } = useEventTracker();
    const theme = useTheme();
    const variantPalette = [
        theme.palette.primary.main,
        theme.palette.warning.main,
        theme.palette.success.main,
        theme.palette.charts.C1,
    ];
    const users = useMemo(() => generateIntroUsers(USER_COUNT), []);
    const topics = advancedStepsEnabled ? TOPICS : CORE_TOPICS;

    const [topicIndex, setTopicIndex] = useState(0);
    const [finished, setFinished] = useState(false);
    const [selectedId, setSelectedId] = useState<string | undefined>();
    const [incidentState, setIncidentState] = useState<IncidentState>('idle');
    const [erroredCount, setErroredCount] = useState(0);
    const [exposureOrder, setExposureOrder] = useState<string[]>([]);
    const [metricSampleIndex, setMetricSampleIndex] = useState(0);
    const milestoneErrorGraceStartedAt = useRef(Date.now());
    const [releasePlanState, setReleasePlanState] =
        useState<ReleasePlanState>('ready');
    const [releaseMilestoneIndex, setReleaseMilestoneIndex] = useState(0);
    const [safeguardState, setSafeguardState] =
        useState<SafeguardState>('ready');
    const [config, setConfig] = useState<IntroFlagConfig>(() => ({
        flagName: FLAG_NAME,
        environmentEnabled: true,
        rollout: 0,
        targetCountryCodes: [],
        targetPlans: [],
        targetDevices: [],
        variantsEnabled: false,
        variants: makeVariants(['A', 'B'], variantPalette),
    }));

    const topic = topics[topicIndex];
    const evaluations = useMemo(
        () => computeEvaluations(users, config),
        [users, config],
    );
    const stats = useMemo(
        () => summarize(users, evaluations),
        [users, evaluations],
    );

    useEffect(() => {
        if (
            (topic.key !== 'impact' && topic.key !== 'safeguard') ||
            !config.environmentEnabled
        ) {
            return;
        }

        const enabledUserIds = users
            .filter((_, index) => evaluations[index]?.enabled)
            .map((user) => user.id);
        setExposureOrder((current) => {
            const seen = new Set(current);
            const newlyExposed = enabledUserIds.filter(
                (userId) => !seen.has(userId),
            );
            return newlyExposed.length > 0
                ? [...current, ...newlyExposed]
                : current;
        });
    }, [config.environmentEnabled, evaluations, topic.key, users]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: restart the error grace period whenever the active release milestone advances
    useEffect(() => {
        if (
            (topic.key === 'impact' || topic.key === 'safeguard') &&
            config.environmentEnabled
        ) {
            milestoneErrorGraceStartedAt.current = Date.now();
        }
    }, [config.environmentEnabled, releaseMilestoneIndex, topic.key]);

    useEffect(() => {
        trackEvent('quick-tour-demo', { props: { eventType: 'start' } });
    }, [trackEvent]);

    useEffect(() => {
        if (
            !['releasePlan', 'impact', 'safeguard'].includes(topic.key) ||
            releasePlanState !== 'running'
        ) {
            return;
        }
        const timer = setTimeout(
            () => {
                const nextMilestone =
                    RELEASE_PLAN_MILESTONES[releaseMilestoneIndex + 1];
                if (nextMilestone) {
                    const nextIndex = releaseMilestoneIndex + 1;
                    setReleaseMilestoneIndex(nextIndex);
                    setConfig((current) => ({
                        ...current,
                        rollout: nextMilestone.rollout,
                        targetPlans: nextMilestone.targetPlans,
                        targetDevices: nextMilestone.targetDevices,
                    }));
                    if (nextIndex === RELEASE_PLAN_MILESTONES.length - 1) {
                        setReleasePlanState('advanced');
                    }
                } else {
                    setReleasePlanState('advanced');
                }
            },
            topic.key === 'releasePlan'
                ? INTRO_RELEASE_PLAN_MILESTONE_MS
                : PROTECTED_RELEASE_MILESTONE_MS,
        );
        return () => clearTimeout(timer);
    }, [releaseMilestoneIndex, releasePlanState, topic.key]);

    useEffect(() => {
        if (
            topic.key !== 'safeguard' ||
            safeguardState !== 'monitoring' ||
            erroredCount <= INTRO_SAFEGUARD_ERROR_THRESHOLD
        ) {
            return;
        }
        setIncidentState('resolved');
        setSafeguardState('triggered');
        setReleasePlanState('triggered');
        setConfig((current) => ({
            ...current,
            environmentEnabled: false,
        }));
        trackEvent('quick-tour-demo', {
            props: { eventType: 'safeguard-auto-disable' },
        });
    }, [erroredCount, safeguardState, topic.key, trackEvent]);

    useEffect(() => {
        if (
            topic.key === 'impact' &&
            incidentState === 'observing' &&
            erroredCount >= 3
        ) {
            setIncidentState('alert');
        }
    }, [erroredCount, incidentState, topic.key]);

    const errorsActive =
        (topic.key === 'impact' &&
            (incidentState === 'observing' || incidentState === 'alert')) ||
        (topic.key === 'safeguard' && safeguardState === 'monitoring');

    useEffect(() => {
        if (topic.key !== 'impact' && topic.key !== 'safeguard') return;
        const interval = setInterval(() => {
            setMetricSampleIndex((current) => current + 1);
            const milestoneGraceElapsed =
                Date.now() - milestoneErrorGraceStartedAt.current >=
                MILESTONE_ERROR_GRACE_MS;
            if (errorsActive && milestoneGraceElapsed) {
                const exposedAudience = Math.min(
                    stats.enabled,
                    topic.key === 'safeguard'
                        ? INTRO_SAFEGUARD_ERROR_THRESHOLD + 1
                        : USER_COUNT,
                );
                setErroredCount((current) =>
                    Math.min(exposedAudience, current + 1),
                );
            }
        }, ERROR_INCREMENT_MS);
        return () => clearInterval(interval);
    }, [errorsActive, stats.enabled, topic.key]);

    const selectedUser = users.find((user) => user.id === selectedId);
    const selectedEvaluation = selectedUser
        ? evaluations[users.indexOf(selectedUser)]
        : undefined;

    const applyTopicPreset = (index: number) => {
        const key = topics[index].key;
        setConfig((current) => {
            if (key === 'rollout') {
                return {
                    ...current,
                    environmentEnabled: true,
                    rollout: 0,
                    targetCountryCodes: [],
                    targetPlans: [],
                    targetDevices: [],
                    variantsEnabled: false,
                };
            }
            if (key === 'target') {
                return {
                    ...current,
                    environmentEnabled: true,
                    rollout: 100,
                    targetCountryCodes: ['NO', 'US'],
                    targetPlans: ['pro', 'enterprise'],
                    targetDevices: ['desktop'],
                    variantsEnabled: false,
                };
            }
            if (key === 'variants') {
                return {
                    ...current,
                    environmentEnabled: true,
                    rollout: 100,
                    targetCountryCodes: [],
                    targetPlans: [],
                    targetDevices: [],
                    variantsEnabled: true,
                    variants: makeVariants(['A', 'B'], variantPalette),
                };
            }
            if (key === 'releasePlan') {
                return {
                    ...current,
                    environmentEnabled: false,
                    rollout: 0,
                    targetCountryCodes: [],
                    targetPlans: [],
                    targetDevices: [],
                    variantsEnabled: false,
                };
            }
            if (key === 'impact') {
                return {
                    ...withReleaseMilestone(current, 0),
                    environmentEnabled: false,
                };
            }
            if (key === 'safeguard') {
                return {
                    ...withReleaseMilestone(current, 0),
                    environmentEnabled: false,
                };
            }
            return {
                ...current,
                environmentEnabled: true,
                rollout: 100,
                targetCountryCodes: [],
                targetPlans: [],
                targetDevices: [],
                variantsEnabled: true,
            };
        });
    };

    const goToTopic = (index: number) => {
        setTopicIndex(index);
        applyTopicPreset(index);
        setSelectedId(undefined);
        setIncidentState('idle');
        setErroredCount(0);
        setExposureOrder([]);
        setMetricSampleIndex(0);
        setReleaseMilestoneIndex(0);
        setReleasePlanState(
            topics[index].key === 'releasePlan'
                ? 'ready'
                : topics[index].key === 'impact'
                  ? 'ready'
                  : topics[index].key === 'safeguard'
                    ? 'ready'
                    : 'ready',
        );
        setSafeguardState('ready');
        trackEvent('quick-tour-demo', {
            props: { eventType: 'topic', topic: topics[index].key },
        });
    };

    const handleNext = () => {
        if (topicIndex < topics.length - 1) {
            goToTopic(topicIndex + 1);
        } else {
            setFinished(true);
            onFinish?.();
            trackEvent('quick-tour-demo', { props: { eventType: 'finish' } });
        }
    };

    const handleSkip = () => {
        trackEvent('quick-tour-demo', {
            props: { eventType: 'skip', topic: topic.key },
        });
        onComplete();
    };

    const setEnvironmentEnabled = (enabled: boolean) => {
        setConfig((current) => ({
            ...current,
            environmentEnabled: enabled,
        }));
        if (topic.key === 'releasePlan') {
            if (enabled && releasePlanState === 'ready') {
                setReleaseMilestoneIndex(0);
                setConfig((current) => withReleaseMilestone(current, 0));
                setReleasePlanState('running');
                trackEvent('quick-tour-demo', {
                    props: { eventType: 'release-plan-start' },
                });
            } else if (enabled && releasePlanState === 'paused') {
                setReleasePlanState(
                    releaseMilestoneIndex === RELEASE_PLAN_MILESTONES.length - 1
                        ? 'advanced'
                        : 'running',
                );
            } else if (!enabled && releasePlanState === 'running') {
                setReleasePlanState('paused');
            }
        } else if (topic.key === 'impact' && !enabled) {
            setIncidentState(erroredCount > 0 ? 'resolved' : 'idle');
            setErroredCount(0);
            setReleasePlanState('paused');
            trackEvent('quick-tour-demo', {
                props: { eventType: 'manual-production-disable' },
            });
        } else if (topic.key === 'impact' && enabled) {
            setReleaseMilestoneIndex(0);
            setConfig((current) => withReleaseMilestone(current, 0));
            setErroredCount(0);
            setExposureOrder([]);
            setIncidentState('observing');
            setReleasePlanState('running');
            trackEvent('quick-tour-demo', {
                props: { eventType: 'impact-production-enable' },
            });
        } else if (topic.key === 'safeguard' && !enabled) {
            setErroredCount(0);
            setIncidentState('idle');
            setSafeguardState('ready');
            setReleasePlanState('paused');
        } else if (
            topic.key === 'safeguard' &&
            enabled &&
            safeguardState !== 'monitoring'
        ) {
            setReleaseMilestoneIndex(0);
            setConfig((current) => withReleaseMilestone(current, 0));
            setErroredCount(0);
            setExposureOrder([]);
            setIncidentState('observing');
            setSafeguardState('monitoring');
            setReleasePlanState('running');
            trackEvent('quick-tour-demo', {
                props: { eventType: 'safeguard-retry' },
            });
        }
    };

    const startReleaseMilestone = (index: number) => {
        const startingIncident =
            topic.key === 'impact' &&
            (!config.environmentEnabled ||
                incidentState === 'idle' ||
                incidentState === 'resolved');

        if (startingIncident) {
            setErroredCount(0);
            setExposureOrder([]);
            setIncidentState('observing');
        }
        if (
            topic.key === 'safeguard' &&
            (!config.environmentEnabled || safeguardState !== 'monitoring')
        ) {
            setErroredCount(0);
            setExposureOrder([]);
            setIncidentState('observing');
            setSafeguardState('monitoring');
        }
        setReleaseMilestoneIndex(index);
        setConfig((current) => withReleaseMilestone(current, index));
        setReleasePlanState(
            index === RELEASE_PLAN_MILESTONES.length - 1
                ? 'advanced'
                : 'running',
        );
        trackEvent('quick-tour-demo', {
            props: { eventType: 'release-plan-milestone-start', index },
        });
    };

    const setRollout = (value: number) => {
        setConfig((current) => ({ ...current, rollout: value }));
    };

    const toggleCountry = (code: string) => {
        setConfig((current) => ({
            ...current,
            targetCountryCodes: current.targetCountryCodes.includes(code)
                ? current.targetCountryCodes.filter((item) => item !== code)
                : [...current.targetCountryCodes, code],
        }));
    };

    const togglePlan = (plan: IntroUser['plan']) => {
        setConfig((current) => ({
            ...current,
            targetPlans: current.targetPlans?.includes(plan)
                ? current.targetPlans.filter((item) => item !== plan)
                : [...(current.targetPlans ?? []), plan],
        }));
    };

    const toggleDevice = (device: IntroUser['device']) => {
        setConfig((current) => ({
            ...current,
            targetDevices: current.targetDevices?.includes(device)
                ? current.targetDevices.filter((item) => item !== device)
                : [...(current.targetDevices ?? []), device],
        }));
    };

    const addVariant = () => {
        setConfig((current) => {
            const used = current.variants.map((variant) => variant.name);
            const nextName = VARIANT_POOL.find(
                (variant) => !used.includes(variant.name),
            )?.name;
            if (!nextName) return current;
            return {
                ...current,
                variants: makeVariants([...used, nextName], variantPalette),
            };
        });
    };

    const setVariantWeights = (weights: number[]) => {
        setConfig((current) => ({
            ...current,
            variants: current.variants.map((variant, index) => ({
                ...variant,
                weight: weights[index] ?? variant.weight,
            })),
        }));
    };

    const canContinue = true;

    if (finished) {
        return (
            <IntroShowcase
                onComplete={onComplete}
                onReplay={() => {
                    setFinished(false);
                    goToTopic(0);
                }}
            />
        );
    }

    return (
        <StyledPanel>
            <StyledLeft>
                <StyledHeader>
                    <StyledEyebrow>
                        Unleash Intro · {topicIndex + 1} of {topics.length}
                    </StyledEyebrow>
                    <StyledTitleRow>
                        <StyledTitle>{topic.title}</StyledTitle>
                        <Chip
                            label={topic.valueTag}
                            size='small'
                            color='primary'
                            variant='outlined'
                        />
                    </StyledTitleRow>
                </StyledHeader>

                <StyledScroll>
                    <Typography
                        color='textSecondary'
                        sx={{
                            display: '-webkit-box',
                            minHeight: '4.5em',
                            maxHeight: '4.5em',
                            overflow: 'hidden',
                            lineHeight: 1.5,
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3,
                        }}
                    >
                        {topic.body}
                    </Typography>

                    {topic.key === 'releasePlan' ||
                    topic.key === 'impact' ||
                    topic.key === 'safeguard' ? (
                        <IntroReleasePlan
                            environmentEnabled={config.environmentEnabled}
                            milestones={RELEASE_PLAN_MILESTONES}
                            activeMilestoneIndex={releaseMilestoneIndex}
                            state={releasePlanState}
                            detailed={
                                topic.key === 'releasePlan' ||
                                topic.key === 'impact' ||
                                topic.key === 'safeguard'
                            }
                            interactive={
                                topic.key === 'releasePlan' ||
                                topic.key === 'impact' ||
                                topic.key === 'safeguard'
                            }
                            automationDelayMinutes={
                                topic.key === 'releasePlan' ? 30 : 15
                            }
                            autoExpandActive={topic.key === 'releasePlan'}
                            milestoneDurationMs={
                                topic.key === 'releasePlan'
                                    ? INTRO_RELEASE_PLAN_MILESTONE_MS
                                    : PROTECTED_RELEASE_MILESTONE_MS
                            }
                            onEnvironmentChange={setEnvironmentEnabled}
                            onStartMilestone={startReleaseMilestone}
                            environmentChildren={
                                topic.key === 'safeguard' ? (
                                    <IntroSafeguard
                                        state={safeguardState}
                                        embedded
                                    />
                                ) : null
                            }
                        >
                            {topic.key === 'impact' ||
                            topic.key === 'safeguard' ? (
                                <>
                                    <IntroImpactCharts
                                        key={topic.key}
                                        topicKey={topic.key}
                                        errorCount={erroredCount}
                                        environmentEnabled={
                                            config.environmentEnabled
                                        }
                                        safeguardTriggered={
                                            safeguardState === 'triggered'
                                        }
                                        sampleIndex={metricSampleIndex}
                                        activeMilestoneIndex={
                                            releaseMilestoneIndex
                                        }
                                        activeMilestoneName={
                                            RELEASE_PLAN_MILESTONES[
                                                releaseMilestoneIndex
                                            ].name
                                        }
                                    />
                                </>
                            ) : null}
                        </IntroReleasePlan>
                    ) : (
                        <IntroFlagView
                            config={config}
                            showConstraints={topic.key !== 'rollout'}
                            showVariants={topic.key === 'variants'}
                            selectedVariant={selectedEvaluation?.variant}
                            onEnvironmentChange={setEnvironmentEnabled}
                            onRolloutChange={setRollout}
                            onToggleCountry={toggleCountry}
                            onTogglePlan={togglePlan}
                            onToggleDevice={toggleDevice}
                            onAddVariant={addVariant}
                            onWeightsChange={setVariantWeights}
                        />
                    )}
                </StyledScroll>

                <StyledFooter>
                    <StyledDots>
                        {topics.map((item, index) => (
                            <StyledDot
                                key={item.key}
                                active={index === topicIndex}
                            />
                        ))}
                    </StyledDots>
                    <Button onClick={handleSkip} color='inherit'>
                        Skip
                    </Button>
                    {topicIndex > 0 ? (
                        <Button
                            variant='outlined'
                            onClick={() => goToTopic(topicIndex - 1)}
                        >
                            Back
                        </Button>
                    ) : null}
                    <Button
                        variant='contained'
                        onClick={handleNext}
                        disabled={!canContinue}
                        data-testid='QUICK_TOUR_INTRO_NEXT_BUTTON'
                    >
                        {topicIndex < topics.length - 1 ? 'Next' : 'Finish'}
                    </Button>
                </StyledFooter>
            </StyledLeft>

            <StyledRight>
                <StyledAudienceHeader>
                    <StyledStat>
                        <StyledStatValue data-testid='QUICK_TOUR_INTRO_ENABLED_COUNT'>
                            {stats.enabled}
                        </StyledStatValue>
                        <Typography color='textSecondary'>
                            of {stats.total} people get Smart Search
                        </Typography>
                    </StyledStat>
                    <Typography variant='body2' color='textSecondary'>
                        Each card previews the experience that person receives
                        in real time. Select one for more details.
                    </Typography>
                </StyledAudienceHeader>
                <IntroUserGrid
                    users={users}
                    evaluations={evaluations}
                    mode={topic.mode}
                    variants={config.variants}
                    environmentEnabled={config.environmentEnabled}
                    rollout={config.rollout}
                    targeting={{
                        targetCountryCodes: config.targetCountryCodes,
                        targetPlans: config.targetPlans,
                        targetDevices: config.targetDevices,
                    }}
                    erroredUserIds={
                        config.environmentEnabled &&
                        (topic.key === 'impact' || topic.key === 'safeguard')
                            ? exposureOrder.slice(0, erroredCount)
                            : []
                    }
                    selectedId={selectedId}
                    onSelect={(user: IntroUser | undefined) => {
                        setSelectedId(user?.id);
                    }}
                />
                {topic.key === 'impact' &&
                (incidentState === 'alert' || incidentState === 'resolved') ? (
                    <StyledOutcome
                        severity={
                            incidentState === 'alert' ? 'error' : 'success'
                        }
                        data-testid={
                            incidentState === 'alert'
                                ? 'QUICK_TOUR_INTRO_MANUAL_GUIDANCE'
                                : 'QUICK_TOUR_INTRO_MANUAL_RECOVERY'
                        }
                    >
                        <StyledOutcomeIcon
                            severity={
                                incidentState === 'alert' ? 'error' : 'success'
                            }
                        >
                            {incidentState === 'alert' ? (
                                <ErrorOutlineIcon />
                            ) : (
                                <CheckCircleOutlineIcon />
                            )}
                        </StyledOutcomeIcon>
                        <StyledOutcomeCopy>
                            <strong>
                                {incidentState === 'alert'
                                    ? 'Search errors are rising'
                                    : 'Issue contained with one click'}
                            </strong>
                            <span>
                                {incidentState === 'alert'
                                    ? 'Disable production to stop the release and return affected users to Classic Search in real time.'
                                    : 'Users return to a working Classic Search in real time without waiting for a fix or redeployment, giving your team space to investigate and resolve the issue properly.'}
                            </span>
                        </StyledOutcomeCopy>
                    </StyledOutcome>
                ) : null}
                {topic.key === 'safeguard' && safeguardState === 'triggered' ? (
                    <StyledOutcome
                        severity='success'
                        data-testid='QUICK_TOUR_INTRO_AUTO_RECOVERY'
                    >
                        <StyledOutcomeIcon severity='success'>
                            <ShieldOutlinedIcon />
                        </StyledOutcomeIcon>
                        <StyledOutcomeCopy>
                            <strong>Issue contained automatically</strong>
                            <span>
                                The safeguard disabled production when errors
                                crossed the threshold. Users return to a working
                                Classic Search in real time without waiting for
                                a fix or redeployment.
                            </span>
                        </StyledOutcomeCopy>
                    </StyledOutcome>
                ) : null}
            </StyledRight>
        </StyledPanel>
    );
};
