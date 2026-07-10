import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    Collapse,
    styled,
    Typography,
    useTheme,
} from '@mui/material';
import Confetti from 'react-confetti';
import { useEventTracker } from 'hooks/useEventTracker.ts';
import {
    computeEvaluations,
    DEMO_COUNTRIES,
    type DemoFlagConfig,
    type DemoUser,
    type DemoVariant,
    generateDemoUsers,
    summarize,
} from './demoModel.js';
import { UserGrid, type GridMode } from './UserGrid.tsx';
import { DemoFlagView } from './DemoFlagView.tsx';
import { ImpactCharts } from './ImpactCharts.tsx';

// Small enough that every character stays readable with a name under it; the
// stat header carries the precise percentage.
const USER_COUNT = 24;
const FLAG_NAME = 'new-checkout';

/**
 * The pool of variants the user can add from, in order. Each carries a JSON
 * payload so the demo can show that a variant is more than a name - the app
 * reads the payload at runtime, and the demo renders exactly what the payload
 * says (button text and colour).
 */
const VARIANT_POOL = [
    { name: 'A', cta: 'Buy now' },
    { name: 'B', cta: '⚡ 1-click checkout' },
    { name: 'C', cta: 'Quick pay' },
    { name: 'D', cta: 'Express checkout' },
];

/** Integer weights summing to 100, like Unleash's automatic even split. */
const evenWeights = (count: number): number[] =>
    Array.from(
        { length: count },
        (_, i) => Math.floor(100 / count) + (i < 100 % count ? 1 : 0),
    );

/**
 * Colours come from the theme's variant palette (by list position, like the
 * real variant UI) so the demo looks exactly like variants do in the product,
 * and the payload advertises the very colour being rendered.
 */
const makeVariants = (names: string[], palette: string[]): DemoVariant[] => {
    const weights = evenWeights(names.length);
    return names.map((name, i) => {
        const pooled = VARIANT_POOL.find((v) => v.name === name);
        const color = palette[i % palette.length];
        return {
            name,
            weight: weights[i],
            payload: pooled
                ? `{ "cta": "${pooled.cta}", "color": "${color}" }`
                : undefined,
            color,
            cta: pooled?.cta,
        };
    });
};

/** Delay between switching the feature on and the scripted bug report. */
const BUG_REPORT_DELAY_MS = 900;
/** Delay between switching the feature on and the first user hitting an error. */
const ERROR_START_DELAY_MS = 250;
/** Interval between increasing the errored users. */
const ERROR_INCREMENT_MS = 1000;

interface ITopic {
    key: string;
    mode: GridMode;
    title: string;
    valueTag: string;
    body: string;
}

const TOPICS: ITopic[] = [
    {
        key: 'onoff',
        mode: 'onoff',
        title: 'Flip a feature on and off',
        valueTag: 'Runtime control',
        body: 'Meet your users. You run an online store, and your new 1-click checkout just shipped - dark, behind a feature flag. Flip it on and watch every hand go up. Flip it off and it’s gone. No deploy either way.',
    },
    {
        key: 'rollout',
        mode: 'rollout',
        title: 'Release gradually, safely',
        valueTag: 'Progressive delivery',
        body: 'Going all-in on day one is how outages happen. Drag the slider to release to a small share of users first. The same people stay in as you grow it - nobody flips back off. That’s a controlled, consistent release.',
    },
    {
        key: 'target',
        mode: 'target',
        title: 'Target exactly who you want',
        valueTag: 'Precision targeting',
        body: 'Constraints narrow who a strategy applies to - and the rollout percentage then applies within that group, exactly like in Unleash. Pick countries in the constraint: matching users light up, and only the rollout’s share of them get the feature.',
    },
    {
        key: 'variants',
        mode: 'variants',
        title: 'Run an A/B test',
        valueTag: 'Experimentation',
        body: 'Everyone gets the new checkout, split into versions - their shirts show which. Each variant carries a JSON payload your app reads at runtime. Add or remove variants below, then click a person to see exactly what their app receives.',
    },
];

const StyledPanel = styled(Box)(({ theme }) => ({
    height: '100%',
    display: 'grid',
    gridTemplateColumns: 'minmax(340px, 2fr) 3fr',
    background: theme.palette.background.paper,
    // On smaller screens there's not enough room to fit both columns and the
    // internal scroll makes each section unusably short - so the panel just
    // grows to fit content and the dialog's paper handles the scroll.
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

// The step title and counter live in a fixed header so they don't scroll
// into (or under) the dialog's close button. Only the body, flag view, and
// alerts scroll below.
const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(5, 5, 2),
    flexShrink: 0,
}));

// Scrolls when the panel is short (e.g. the over-app dialog) so the pinned
// footer nav below it never gets clipped. Padding lives here (not on the
// parent) so the scrollbar sits at the panel edge; the smaller right padding
// keeps content away from it. On md-down the panel becomes single-column
// and StyledPanel takes over scrolling, so the internal scroll is disabled
// (otherwise flex:1 collapses to a tiny sliver of usable height).
const StyledScroll = styled(Box)(({ theme }) => ({
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(0, 4, 2, 5),
    [theme.breakpoints.down('md')]: {
        flex: 'unset',
        minHeight: 'auto',
        overflow: 'visible',
        padding: theme.spacing(0, 5, 2),
    },
}));

const StyledRight = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(5),
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
    padding: theme.spacing(2, 5, 5),
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

const StyledStatValue = styled('span')(({ theme }) => ({
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.primary.main,
    fontVariantNumeric: 'tabular-nums',
}));

const StyledFinish = styled(Box)(({ theme }) => ({
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: theme.spacing(8),
    gap: theme.spacing(2),
}));

/**
 * The scripted incident in step 1: after the user switches the feature on, a
 * bug report rolls in and they get to save the day with the kill switch.
 */
type BugPhase = 'idle' | 'armed' | 'alert' | 'resolved';

interface IClosedDemoProps {
    /** Called when the user finishes or skips the tour. */
    onComplete: () => void;
}

/**
 * The interactive quick-tour panel: a 4-step feature flag walkthrough (on/off,
 * gradual rollout, targeting, A/B variants). The left side is a miniature but
 * real-looking flag page that gains configuration as the tour progresses; the
 * right side is a crowd of illustrated users who raise their hands when the
 * flag reaches them. Fills its container; hosted in a dialog by
 * QuickTourDialog and inline in the signup dialog.
 */
export const ClosedDemo = ({ onComplete }: IClosedDemoProps) => {
    const { trackEvent } = useEventTracker();
    const theme = useTheme();
    // The demo's variant chips use complementary theme semantic colours so
    // A/B/C/D read as clearly distinct - and none of them collide with the
    // green/red exposure/error tints.
    const variantPalette = [
        theme.palette.primary.main,
        theme.palette.warning.main,
        theme.palette.info.main,
        theme.palette.error.main,
    ];
    const users = useMemo(() => generateDemoUsers(USER_COUNT), []);

    const [topicIndex, setTopicIndex] = useState(0);
    const [finished, setFinished] = useState(false);
    const [selectedId, setSelectedId] = useState<string | undefined>();
    const [bugPhase, setBugPhase] = useState<BugPhase>('idle');
    // Bug reports snowball: one user first, then a doubling wave until the
    // whole affected crowd is red.
    const [erroredCount, setErroredCount] = useState(0);
    // Step 1 starts with the feature OFF: the first impression is a calm,
    // greyscale crowd, and flipping the switch (the user's own action) raises
    // the hands.
    const [config, setConfig] = useState<DemoFlagConfig>(() => ({
        flagName: FLAG_NAME,
        environmentEnabled: false,
        rollout: 100,
        targetCountryCodes: [],
        variantsEnabled: false,
        variants: makeVariants(['A', 'B'], variantPalette),
    }));

    useEffect(() => {
        trackEvent('closed-demo', { props: { eventType: 'start' } });
    }, [trackEvent]);

    useEffect(() => {
        if (bugPhase !== 'armed') return;
        const timer = setTimeout(
            () => setBugPhase('alert'),
            BUG_REPORT_DELAY_MS,
        );
        return () => clearTimeout(timer);
    }, [bugPhase]);

    // Errors start ticking almost as soon as the feature flips on - well before
    // the scripted bug report shows up. That's the whole point: your users hit
    // the bug first, and only later does the report land in your inbox.
    const errorsActive = bugPhase === 'armed' || bugPhase === 'alert';
    useEffect(() => {
        if (!errorsActive) {
            setErroredCount(0);
            return;
        }
        let interval: ReturnType<typeof setInterval> | undefined;
        const startTimer = setTimeout(() => {
            let current = 1;
            setErroredCount(current);
            interval = setInterval(() => {
                current = Math.min(USER_COUNT, current * 2);
                setErroredCount(current);
                if (current >= USER_COUNT) clearInterval(interval);
            }, ERROR_INCREMENT_MS);
        }, ERROR_START_DELAY_MS);
        return () => {
            clearTimeout(startTimer);
            if (interval) clearInterval(interval);
        };
    }, [errorsActive]);

    const topic = TOPICS[topicIndex];

    const evaluations = useMemo(
        () => computeEvaluations(users, config),
        [users, config],
    );
    const stats = useMemo(
        () => summarize(users, evaluations),
        [users, evaluations],
    );

    const selectedUser = users.find((u) => u.id === selectedId);
    const selectedEvaluation = selectedUser
        ? evaluations[users.indexOf(selectedUser)]
        : undefined;

    const applyTopicPreset = (index: number) => {
        const key = TOPICS[index].key;
        if (key === 'onoff') {
            setConfig((c) => ({
                ...c,
                environmentEnabled: false,
                rollout: 100,
                targetCountryCodes: [],
                variantsEnabled: false,
            }));
        } else if (key === 'rollout') {
            setConfig((c) => ({
                ...c,
                environmentEnabled: true,
                rollout: 25,
                targetCountryCodes: [],
                variantsEnabled: false,
            }));
        } else if (key === 'target') {
            // Rollout at 50% makes the AND visible: all matching users are
            // highlighted, but only half of them raise a hand.
            setConfig((c) => ({
                ...c,
                environmentEnabled: true,
                rollout: 50,
                targetCountryCodes: ['US'],
                variantsEnabled: false,
            }));
        } else {
            setConfig((c) => ({
                ...c,
                environmentEnabled: true,
                rollout: 100,
                targetCountryCodes: DEMO_COUNTRIES.map(
                    (country) => country.code,
                ),
                variantsEnabled: true,
                variants: makeVariants(['A', 'B'], variantPalette),
            }));
        }
    };

    const goToTopic = (index: number) => {
        setTopicIndex(index);
        applyTopicPreset(index);
        trackEvent('closed-demo', {
            props: { eventType: 'topic', topic: TOPICS[index].key },
        });
    };

    const handleNext = () => {
        if (topicIndex < TOPICS.length - 1) {
            goToTopic(topicIndex + 1);
        } else {
            setFinished(true);
            trackEvent('closed-demo', { props: { eventType: 'finish' } });
        }
    };

    const handleSkip = () => {
        trackEvent('closed-demo', {
            props: { eventType: 'skip', topic: topic.key },
        });
        onComplete();
    };

    const setEnvironmentEnabled = (value: boolean) => {
        setConfig((c) => ({ ...c, environmentEnabled: value }));
        if (topic.key !== 'onoff') return;
        if (value && (bugPhase === 'idle' || bugPhase === 'resolved')) {
            // Re-arming from 'resolved' replays the whole incident, so the
            // user can flip the switch back and forth to inspect any beat.
            setBugPhase('armed');
        } else if (!value && bugPhase === 'alert') {
            setBugPhase('resolved');
            trackEvent('closed-demo', {
                props: { eventType: 'killswitch' },
            });
        }
    };

    const setRollout = (value: number) =>
        setConfig((c) => ({ ...c, rollout: value }));

    const toggleCountry = (code: string) =>
        setConfig((c) => {
            const isSelected = c.targetCountryCodes.includes(code);
            const next = isSelected
                ? c.targetCountryCodes.filter((x) => x !== code)
                : [...c.targetCountryCodes, code];
            // Deselecting the last chip would leave an empty "is any of"
            // constraint, which reads as "no country matches". Flip it to
            // every country instead - same effect as no constraint, but the
            // UI stays coherent.
            return {
                ...c,
                targetCountryCodes:
                    next.length === 0
                        ? DEMO_COUNTRIES.map((country) => country.code)
                        : next,
            };
        });

    const addVariant = () => {
        setConfig((c) => {
            const used = c.variants.map((v) => v.name);
            const nextName = VARIANT_POOL.find(
                (v) => !used.includes(v.name),
            )?.name;
            if (!nextName) return c;
            return {
                ...c,
                variants: makeVariants([...used, nextName], variantPalette),
            };
        });
        trackEvent('closed-demo', {
            props: { eventType: 'add-variant' },
        });
    };

    const removeVariant = (name: string) =>
        setConfig((c) => ({
            ...c,
            variants: makeVariants(
                c.variants.map((v) => v.name).filter((n) => n !== name),
                variantPalette,
            ),
        }));

    const setVariantWeights = (weights: number[]) =>
        setConfig((c) => ({
            ...c,
            variants: c.variants.map((v, i) => ({
                ...v,
                weight: weights[i] ?? v.weight,
            })),
        }));

    return (
        <StyledPanel>
            {finished ? (
                <>
                    <Confetti
                        recycle={false}
                        numberOfPieces={400}
                        gravity={0.3}
                        style={{ zIndex: 3000 }}
                    />
                    <StyledFinish data-public>
                        <StyledTitle>That’s feature flagging 🎉</StyledTitle>
                        <Typography
                            color='textSecondary'
                            sx={{ maxWidth: 520 }}
                        >
                            You just killed a broken feature in one click, ran a
                            gradual rollout, targeted a segment, and split an
                            A/B test - with no deploys and no code. Ready to do
                            it for real in your project?
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button
                                variant='outlined'
                                onClick={() => {
                                    setFinished(false);
                                    goToTopic(0);
                                }}
                            >
                                Replay
                            </Button>
                            <Button
                                variant='contained'
                                onClick={onComplete}
                                data-testid='CLOSED_DEMO_FINISH_BUTTON'
                            >
                                Start using Unleash
                            </Button>
                        </Box>
                    </StyledFinish>
                </>
            ) : (
                <>
                    <StyledLeft>
                        <StyledHeader>
                            <StyledEyebrow>
                                Quick tour · {topicIndex + 1} of {TOPICS.length}
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
                            <Typography color='textSecondary'>
                                {topic.body}
                            </Typography>

                            <DemoFlagView
                                config={config}
                                showStrategy={topicIndex >= 1}
                                showConstraints={topicIndex >= 2}
                                showVariants={topic.mode === 'variants'}
                                selectedVariant={selectedEvaluation?.variant}
                                onEnvironmentChange={setEnvironmentEnabled}
                                onRolloutChange={setRollout}
                                onToggleCountry={toggleCountry}
                                onAddVariant={addVariant}
                                onRemoveVariant={removeVariant}
                                onWeightsChange={setVariantWeights}
                            />

                            {topic.key === 'onoff' ? (
                                <>
                                    <Collapse
                                        in={bugPhase === 'alert'}
                                        mountOnEnter
                                        unmountOnExit
                                    >
                                        <Alert
                                            severity='error'
                                            data-testid='CLOSED_DEMO_BUG_ALERT'
                                        >
                                            <strong>
                                                🐛 Bug report: the new checkout
                                                is broken!
                                            </strong>{' '}
                                            Quick, turn the feature off.
                                        </Alert>
                                    </Collapse>
                                    <Collapse
                                        in={bugPhase === 'resolved'}
                                        mountOnEnter
                                        unmountOnExit
                                    >
                                        <Alert
                                            severity='success'
                                            data-testid='CLOSED_DEMO_BUG_RESOLVED'
                                        >
                                            <strong>
                                                Fixed in one click!{' '}
                                            </strong>{' '}
                                            Every one is safely back on the old
                                            checkout. You didn't even need to
                                            redeploy.
                                        </Alert>
                                    </Collapse>
                                </>
                            ) : null}

                            <ImpactCharts
                                key={topic.key}
                                topicKey={topic.key}
                                errorsActive={errorsActive}
                                config={config}
                                users={users}
                                evaluations={evaluations}
                            />
                        </StyledScroll>

                        <StyledFooter>
                            <StyledDots>
                                {TOPICS.map((t, i) => (
                                    <StyledDot
                                        key={t.key}
                                        active={i === topicIndex}
                                    />
                                ))}
                            </StyledDots>
                            <Button onClick={handleSkip} color='inherit'>
                                Skip
                            </Button>
                            {topicIndex > 0 && (
                                <Button
                                    variant='outlined'
                                    onClick={() => goToTopic(topicIndex - 1)}
                                >
                                    Back
                                </Button>
                            )}
                            <Button
                                variant='contained'
                                onClick={handleNext}
                                data-testid='CLOSED_DEMO_NEXT_BUTTON'
                            >
                                {topicIndex < TOPICS.length - 1
                                    ? 'Next'
                                    : 'Finish'}
                            </Button>
                        </StyledFooter>
                    </StyledLeft>

                    <StyledRight>
                        <StyledStat>
                            <StyledStatValue>{stats.enabled}</StyledStatValue>
                            <Typography color='textSecondary'>
                                of {stats.total} users see the feature (
                                {stats.percentage}%)
                            </Typography>
                        </StyledStat>
                        <UserGrid
                            users={users}
                            evaluations={evaluations}
                            mode={topic.mode}
                            variants={config.variants}
                            constraintsActive={
                                config.targetCountryCodes.length > 0
                            }
                            erroredCount={
                                topic.key === 'onoff' ? erroredCount : 0
                            }
                            selectedId={selectedId}
                            onSelect={(user: DemoUser | undefined) =>
                                setSelectedId(user?.id)
                            }
                        />
                    </StyledRight>
                </>
            )}
        </StyledPanel>
    );
};
