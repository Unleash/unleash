import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Dialog,
    FormControlLabel,
    styled,
    Switch,
    Typography,
    useTheme,
} from '@mui/material';
import Confetti from 'react-confetti';
import RolloutSlider from 'component/feature/StrategyTypes/RolloutSlider/RolloutSlider.tsx';
import { VariantsSplitPreview } from 'component/common/VariantsSplitPreview/VariantsSplitPreview.tsx';
import type { StrategyVariantSchema } from 'openapi';
import { useEventTracker } from 'hooks/useEventTracker.ts';
import {
    computeEvaluations,
    DEMO_COUNTRIES,
    type DemoFlagConfig,
    type DemoUser,
    generateDemoUsers,
    summarize,
} from './demoModel.js';
import { UserGrid, type GridMode } from './UserGrid.tsx';
import { SampleAppPreview } from './SampleAppPreview.tsx';

const USER_COUNT = 60;
const FLAG_NAME = 'new-checkout';

const DEFAULT_VARIANTS = [
    { name: 'A', weight: 50 },
    { name: 'B', weight: 50 },
];

interface ITopic {
    key: string;
    mode: GridMode;
    title: string;
    body: string;
}

const TOPICS: ITopic[] = [
    {
        key: 'onoff',
        mode: 'onoff',
        title: 'Flip a feature on and off',
        body: 'Imagine you run the online store on the right, and you just built a new 1-click checkout. A feature flag is a switch that controls it without deploying. Toggle it and watch every user get it instantly, then take it away just as fast.',
    },
    {
        key: 'rollout',
        mode: 'rollout',
        title: 'Release gradually, safely',
        body: 'You don’t have to go all-or-nothing. Drag the slider to roll the feature out to a percentage of your users. Watch how the same users stay in as you increase. Nobody flips back off. That’s a consistent, controlled release.',
    },
    {
        key: 'target',
        mode: 'target',
        title: 'Target exactly who you want',
        body: 'Switch the feature on for whole segments, here by country, no matter the rollout percentage. Perfect for betas, internal users, or a single region.',
    },
    {
        key: 'variants',
        mode: 'variants',
        title: 'Run an A/B test',
        body: 'The new feature has two versions, A and B. Everyone gets the feature, but each user sees just one version, so you can compare which works better.',
    },
];

const StyledPanel = styled(Box)(({ theme }) => ({
    height: '100%',
    display: 'grid',
    gridTemplateColumns: 'minmax(340px, 2fr) 3fr',
    background: theme.palette.background.paper,
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
        overflowY: 'auto',
    },
}));

const StyledLeft = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    padding: theme.spacing(5),
    gap: theme.spacing(2),
    borderRight: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('md')]: {
        borderRight: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
}));

// Scrolls when the panel is short (e.g. the over-app dialog) so the pinned
// footer nav below it never gets clipped.
const StyledScroll = styled(Box)(({ theme }) => ({
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
}));

const StyledRight = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(5),
    gap: theme.spacing(2),
    background: theme.palette.background.elevation1,
    overflowY: 'auto',
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

const StyledControls = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
}));

const StyledChips = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
}));

const StyledFooter = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(1.5),
    flexShrink: 0,
    paddingTop: theme.spacing(2),
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

interface IGridDemoProps {
    /** In the signup flow this navigates to the project; optional in the lab. */
    onComplete?: () => void;
    companyName?: string;
}

/**
 * The "god's-eye grid" demo variant, rendered as a panel that fills its
 * container. Wrapped in a full-screen dialog by `ClosedDemo` for the signup
 * flow, or dropped straight into the comparison lab.
 */
export const GridDemo = ({ onComplete, companyName }: IGridDemoProps) => {
    const theme = useTheme();
    const { trackEvent } = useEventTracker();
    const users = useMemo(() => generateDemoUsers(USER_COUNT), []);

    const [topicIndex, setTopicIndex] = useState(0);
    const [finished, setFinished] = useState(false);
    const [selectedId, setSelectedId] = useState<string | undefined>();
    const [config, setConfig] = useState<DemoFlagConfig>({
        flagName: FLAG_NAME,
        environmentEnabled: true,
        rollout: 100,
        targetCountryCodes: [],
        variantsEnabled: false,
        variants: DEFAULT_VARIANTS,
    });

    useEffect(() => {
        trackEvent('closed-demo', { props: { eventType: 'start' } });
    }, [trackEvent]);

    const topic = TOPICS[topicIndex];

    const evaluations = useMemo(
        () => computeEvaluations(users, config),
        [users, config],
    );
    const stats = useMemo(
        () => summarize(users, evaluations),
        [users, evaluations],
    );

    const variantOrder = config.variants.map((v) => v.name);
    const variantAccent = (index: number) =>
        theme.palette.variants[index % theme.palette.variants.length];

    const selectedUser = users.find((u) => u.id === selectedId);
    const selectedEvaluation = selectedUser
        ? evaluations[users.indexOf(selectedUser)]
        : undefined;

    const applyTopicPreset = (index: number) => {
        const key = TOPICS[index].key;
        if (key === 'onoff') {
            setConfig((c) => ({
                ...c,
                environmentEnabled: true,
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
            setConfig((c) => ({
                ...c,
                environmentEnabled: true,
                rollout: 10,
                targetCountryCodes: ['US'],
                variantsEnabled: false,
            }));
        } else {
            setConfig((c) => ({
                ...c,
                environmentEnabled: true,
                rollout: 100,
                targetCountryCodes: [],
                variantsEnabled: true,
                variants: DEFAULT_VARIANTS,
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

    // In the signup flow onComplete navigates away; in the lab there's nowhere
    // to go, so completing just replays the tour.
    const complete = () => {
        if (onComplete) {
            onComplete();
        } else {
            setFinished(false);
            goToTopic(0);
        }
    };

    const handleSkip = () => {
        trackEvent('closed-demo', {
            props: { eventType: 'skip', topic: topic.key },
        });
        complete();
    };

    const setEnvironmentEnabled = (value: boolean) =>
        setConfig((c) => ({ ...c, environmentEnabled: value }));

    const setRollout = (value: number) =>
        setConfig((c) => ({ ...c, rollout: value }));

    const toggleCountry = (code: string) =>
        setConfig((c) => ({
            ...c,
            targetCountryCodes: c.targetCountryCodes.includes(code)
                ? c.targetCountryCodes.filter((x) => x !== code)
                : [...c.targetCountryCodes, code],
        }));

    const setSplit = (value: number) =>
        setConfig((c) => ({
            ...c,
            variants: [
                { name: 'A', weight: 100 - value },
                { name: 'B', weight: value },
            ],
        }));

    const previewVariants: StrategyVariantSchema[] = config.variants.map(
        (v) => ({
            name: v.name,
            weight: v.weight * 10,
            weightType: 'variable',
            stickiness: 'default',
        }),
    );

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
                            You just ran a gradual rollout, targeted a segment,
                            and split an A/B test, with no deploys and no code.
                            Ready to do it for real in your project?
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
                                onClick={complete}
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
                        <StyledScroll>
                            <StyledEyebrow>
                                {companyName
                                    ? `${companyName} · quick tour`
                                    : 'Quick tour'}{' '}
                                · {topicIndex + 1} of {TOPICS.length}
                            </StyledEyebrow>
                            <StyledTitle>{topic.title}</StyledTitle>
                            <Typography color='textSecondary'>
                                {topic.body}
                            </Typography>

                            <StyledControls>
                                {topic.mode === 'onoff' && (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={
                                                    config.environmentEnabled
                                                }
                                                onChange={(e) =>
                                                    setEnvironmentEnabled(
                                                        e.target.checked,
                                                    )
                                                }
                                                data-testid='CLOSED_DEMO_ONOFF_SWITCH'
                                            />
                                        }
                                        label={
                                            config.environmentEnabled
                                                ? 'Feature is ON, everyone sees it'
                                                : 'Feature is OFF, no one sees it'
                                        }
                                    />
                                )}

                                {topic.mode === 'rollout' && (
                                    <RolloutSlider
                                        name='Rollout %'
                                        value={config.rollout}
                                        onChange={(_, value) =>
                                            setRollout(value as number)
                                        }
                                        hideInput
                                        hideHelp
                                    />
                                )}

                                {topic.mode === 'target' && (
                                    <>
                                        <Typography variant='body2'>
                                            Rollout stays at{' '}
                                            <strong>{config.rollout}%</strong>.
                                            Targeted countries are always in:
                                        </Typography>
                                        <StyledChips>
                                            {DEMO_COUNTRIES.map((country) => {
                                                const active =
                                                    config.targetCountryCodes.includes(
                                                        country.code,
                                                    );
                                                return (
                                                    <Chip
                                                        key={country.code}
                                                        label={`${country.flag} ${country.code}`}
                                                        color={
                                                            active
                                                                ? 'primary'
                                                                : 'default'
                                                        }
                                                        variant={
                                                            active
                                                                ? 'filled'
                                                                : 'outlined'
                                                        }
                                                        onClick={() =>
                                                            toggleCountry(
                                                                country.code,
                                                            )
                                                        }
                                                    />
                                                );
                                            })}
                                        </StyledChips>
                                    </>
                                )}

                                {topic.mode === 'variants' && (
                                    <>
                                        <RolloutSlider
                                            name='Users on version B'
                                            value={
                                                config.variants.find(
                                                    (v) => v.name === 'B',
                                                )?.weight ?? 50
                                            }
                                            onChange={(_, value) =>
                                                setSplit(value as number)
                                            }
                                            hideInput
                                            hideHelp
                                        />
                                        <VariantsSplitPreview
                                            variants={previewVariants}
                                            selected={
                                                selectedEvaluation?.variant
                                            }
                                        />
                                    </>
                                )}
                            </StyledControls>
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
                            variantOrder={variantOrder}
                            selectedId={selectedId}
                            onSelect={(user: DemoUser) =>
                                setSelectedId(user.id)
                            }
                        />
                        <SampleAppPreview
                            user={selectedUser}
                            evaluation={selectedEvaluation}
                            mode={topic.mode}
                            variantOrder={variantOrder}
                            variantAccent={variantAccent}
                        />
                    </StyledRight>
                </>
            )}
        </StyledPanel>
    );
};

const StyledFullScreenDialog = styled(Dialog)({
    '& .MuiDialog-paper': {
        overflow: 'hidden',
    },
});

interface IClosedDemoProps {
    onComplete: () => void;
    companyName?: string;
}

/**
 * The closed demo as shown in the real signup flow: the grid variant wrapped in
 * a full-screen dialog.
 */
export const ClosedDemo = ({ onComplete, companyName }: IClosedDemoProps) => (
    <StyledFullScreenDialog open fullScreen>
        <GridDemo onComplete={onComplete} companyName={companyName} />
    </StyledFullScreenDialog>
);
