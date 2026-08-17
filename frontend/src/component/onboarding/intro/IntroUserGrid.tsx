import { useCallback, useEffect, useRef, useState } from 'react';
import {
    alpha,
    Box,
    IconButton,
    keyframes,
    styled,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import {
    INTRO_PLANS,
    type IntroFlagConfig,
    type IntroUser,
    type IntroVariant,
    type UserEvaluation,
} from './introModel.js';
import { avatarForIndex } from './introAvatars.ts';

export type GridMode =
    | 'rollout'
    | 'target'
    | 'variants'
    | 'impact'
    | 'safeguard';

const GRID_COL_GAP = 8;
const GRID_ROW_GAP = 10;

interface GridFit {
    cols: number;
    avatar: number;
    showMeta: boolean;
    tileH: number;
}

// Picks column count + avatar size (and whether meta fits) to fill the box
// without overflowing.
export const gridFit = (n: number, width: number, height: number): GridFit => {
    const PAD = 14;
    let best: (GridFit & { score: number }) | null = null;
    for (let cols = 1; cols <= n; cols++) {
        const tileW = (width - GRID_COL_GAP * (cols - 1)) / cols;
        if (tileW < 46) continue;
        const rows = Math.ceil(n / cols);
        const budget = (height - GRID_ROW_GAP * (rows - 1)) / rows;
        if (budget < 34) continue;
        const modes = [
            { showMeta: true, textH: 15 + 13 + 10, minW: 56 },
            { showMeta: false, textH: 15 + 4, minW: 0 },
        ];
        for (const mode of modes) {
            if (tileW < mode.minW) continue;
            const cellH = Math.min(budget, tileW * 1.45);
            const avatar = Math.min(
                Math.round(tileW - 12),
                Math.round(cellH - mode.textH - PAD),
                64,
            );
            if (avatar < 20) continue;
            const orphans = (cols - (n % cols)) % cols;
            const score = avatar * 10 + (mode.showMeta ? 3 : 0) - orphans * 14;
            if (!best || score > best.score) {
                best = {
                    cols,
                    avatar,
                    showMeta: mode.showMeta,
                    tileH: Math.floor(cellH),
                    score,
                };
            }
            break;
        }
    }
    if (best) return best;
    const cols = Math.max(
        1,
        Math.ceil(Math.sqrt((n * width) / Math.max(height, 1))),
    );
    const rows = Math.ceil(n / cols);
    const budget = Math.max(24, (height - GRID_ROW_GAP * (rows - 1)) / rows);
    const tileW = (width - GRID_COL_GAP * (cols - 1)) / cols;
    return {
        cols,
        avatar: Math.max(
            16,
            Math.min(Math.round(tileW - 8), Math.round(budget - 19)),
        ),
        showMeta: false,
        tileH: Math.floor(budget),
    };
};

const StyledGrid = styled(Box)({
    flex: 1,
    minHeight: 0,
    display: 'grid',
    alignContent: 'space-evenly',
    columnGap: `${GRID_COL_GAP}px`,
    rowGap: `${GRID_ROW_GAP}px`,
});

const StyledPerson = styled('button', {
    shouldForwardProp: (prop) =>
        !['selected', 'dimmed', 'enabled', 'accent'].includes(prop as string),
})<{
    selected: boolean;
    dimmed: boolean;
    enabled: boolean;
    accent: string;
}>(({ theme, selected, dimmed, enabled, accent }) => {
    // Pulse the card's coloured ring when a user turns on.
    const ringPulse = keyframes({
        from: { boxShadow: `inset 0 0 0 3px ${accent}` },
        to: { boxShadow: `inset 0 0 0 1.5px ${accent}` },
    });
    const ring = selected
        ? `inset 0 0 0 2px ${theme.palette.primary.main}`
        : `inset 0 0 0 1.5px ${enabled ? accent : theme.palette.divider}`;
    return {
        all: 'unset',
        boxSizing: 'border-box',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(0.25),
        minWidth: 0,
        padding: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadiusMedium,
        backgroundColor: enabled
            ? alpha(accent, 0.05)
            : theme.palette.background.elevation2,
        boxShadow: ring,
        opacity: dimmed ? 0.6 : 1,
        transition: theme.transitions.create(
            ['opacity', 'box-shadow', 'transform', 'background-color'],
            { duration: theme.transitions.duration.shorter },
        ),
        ...(enabled &&
            !selected && { animation: `${ringPulse} 0.55s ease-out` }),
        '&:hover': {
            backgroundColor: enabled
                ? alpha(accent, 0.1)
                : theme.palette.background.paper,
            boxShadow: selected
                ? `inset 0 0 0 2px ${theme.palette.primary.main}`
                : `inset 0 0 0 1.5px ${
                      enabled ? accent : theme.palette.neutral.border
                  }`,
            transform: 'translateY(-1px)',
            opacity: 1,
        },
        '&:focus-visible': {
            boxShadow: `inset 0 0 0 2px ${theme.palette.primary.main}`,
            opacity: 1,
        },
        '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
            animation: 'none',
        },
    };
});

const StyledAvatarWrap = styled(Box)({
    position: 'relative',
    lineHeight: 0,
    flex: 'none',
});

const StyledAvatarImg = styled(Box, {
    shouldForwardProp: (prop) =>
        !['avatarUrl', 'hue', 'enabled', 'size'].includes(prop as string),
})<{
    avatarUrl: string;
    hue: number;
    enabled: boolean;
    size: number;
}>(({ theme, avatarUrl, hue, enabled, size }) => ({
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: enabled
        ? `hsl(${hue}, 55%, 92%)`
        : theme.palette.background.elevation1,
    backgroundImage: `url('${avatarUrl}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    boxShadow: `0 0 0 1px ${alpha(theme.palette.common.black, 0.2)}`,
    filter: enabled ? 'none' : 'grayscale(0.85)',
    opacity: enabled ? 1 : 0.5,
    transition: theme.transitions.create(['filter', 'opacity']),
}));

const StyledStatusBadge = styled('span', {
    shouldForwardProp: (prop) => prop !== 'experience',
})<{ experience: 'smart' | 'classic' | 'error' }>(({ theme, experience }) => {
    const palette =
        experience === 'smart'
            ? {
                  bg: theme.palette.success.light,
                  fg: theme.palette.success.main,
                  ring: theme.palette.success.border,
              }
            : experience === 'error'
              ? {
                    bg: theme.palette.error.light,
                    fg: theme.palette.error.main,
                    ring: theme.palette.error.border,
                }
              : {
                    bg: theme.palette.background.elevation2,
                    fg: theme.palette.text.secondary,
                    ring: theme.palette.neutral.border,
                };
    return {
        position: 'absolute',
        right: -2,
        top: -2,
        width: 16,
        height: 16,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.bg,
        color: palette.fg,
        boxShadow: `0 0 0 1.5px ${palette.ring}`,
        '& svg': { fontSize: 11 },
    };
});

const StyledName = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.fontSizes.smallBody,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

const StyledMeta = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

const slideInPanel = keyframes({
    from: { opacity: 0, transform: 'translateX(24px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
});

const StyledContentRow = styled(Box)({
    position: 'relative',
    flex: 1,
    minHeight: 0,
    display: 'flex',
});

const StyledGridWrap = styled(Box)({
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
});

const StyledPreviewPanel = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
    width: theme.spacing(38),
    maxWidth: 'calc(100% - 24px)',
    maxHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    boxShadow: theme.boxShadows.popup,
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
    animation: `${slideInPanel} 0.24s ${theme.transitions.easing.easeOut}`,
    [theme.breakpoints.down('md')]: {
        position: 'static',
        width: '100%',
        marginTop: theme.spacing(2),
    },
    '@media (prefers-reduced-motion: reduce)': {
        animation: 'none',
    },
}));

const StyledPanelHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2, 2, 1),
}));

const StyledPanelHeaderRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
}));

const StyledPanelAvatar = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'avatarUrl',
})<{ avatarUrl: string }>(({ theme, avatarUrl }) => ({
    width: 40,
    height: 40,
    flex: 'none',
    borderRadius: '50%',
    backgroundColor: theme.palette.background.elevation2,
    backgroundImage: `url('${avatarUrl}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    boxShadow: `0 0 0 1px ${alpha(theme.palette.common.black, 0.2)}`,
}));

const StyledPopoverBody = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1, 2, 2),
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
    alignSelf: 'start',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const StyledEvaluationPanel = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'state',
})<{ state: 'smart' | 'classic' | 'error' }>(({ theme, state }) => {
    const color =
        state === 'smart' ? 'success' : state === 'error' ? 'error' : 'neutral';
    const borderColor =
        state === 'classic'
            ? theme.palette.divider
            : (theme.palette[color].border ?? theme.palette.divider);
    return {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
        padding: theme.spacing(1.25),
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${borderColor}`,
        background: theme.palette[color].light,
        color: theme.palette[color].contrastText,
        fontSize: theme.fontSizes.smallBody,
        lineHeight: 1.45,
    };
});

const StyledEvalHeadline = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
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
}));

const StyledContextLabel = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledPreviewLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.fontSizes.smallBody,
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

const StyledMockFrame = styled(Box)(({ theme }) => ({
    position: 'relative',
    aspectRatio: '4 / 3',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadiusMedium,
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
}));

const StyledMockChrome = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    padding: theme.spacing(0.5, 1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.elevation1,
}));

const StyledMockDot = styled('span')(({ theme }) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: theme.palette.divider,
}));

const StyledMockUrl = styled(Box)(({ theme }) => ({
    flex: 1,
    marginLeft: theme.spacing(0.75),
    height: 20,
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.disabled,
}));

const StyledMockContent = styled(Box)(({ theme }) => ({
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.75),
}));

const StyledFeatureCard = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'accent',
})<{ accent: string }>(({ theme, accent }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.25),
    padding: theme.spacing(1.75),
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${alpha(accent, 0.35)}`,
    background: alpha(accent, 0.08),
}));

const StyledBaselineCard = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.75),
    padding: theme.spacing(1.75),
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.elevation2,
}));

const StyledErrorCard = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1.75),
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.error.border}`,
    background: theme.palette.error.light,
    color: theme.palette.error.main,
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightBold,
    '& svg': { flex: 'none', fontSize: 18 },
}));

const StyledBar = styled('span', {
    shouldForwardProp: (prop) =>
        !['w', 'h', 'tone', 'barColor'].includes(String(prop)),
})<{
    w: number | string;
    h: number;
    tone?: 'strong' | 'mid' | 'weak';
    barColor?: string;
}>(({ theme, w, h, tone, barColor }) => ({
    display: 'block',
    width: w,
    height: h,
    borderRadius: 999,
    flex: 'none',
    background:
        barColor ??
        (tone === 'strong'
            ? theme.palette.text.secondary
            : tone === 'mid'
              ? theme.palette.text.disabled
              : theme.palette.divider),
}));

const StyledMockRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1.25),
    padding: theme.spacing(1.1, 0),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const StyledMockRowCopy = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

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
        return `${user.name} doesn't see my-feature because production is disabled.`;
    }
    const bucket = evaluation.rolloutBucket;
    const rolloutCoverage =
        rollout <= 0
            ? 'the rollout is at 0%, so it covers no buckets'
            : `the ${rollout}% rollout covers buckets 1–${rollout}`;
    const constraints = constraintExplanation(user, targeting);
    if (!constraints.matches) {
        return `${user.name} doesn't see my-feature because ${naturalList(constraints.failures)}.`;
    }
    if (!evaluation.enabled) {
        if (constraints.activeCount > 0) {
            const count = constraintCountLabel(constraints.activeCount);
            return `${user.name} matches ${count}: ${naturalList(constraints.values)}, but doesn't see my-feature because ${rolloutCoverage} (theirs is ${bucket}).`;
        }
        return `${user.name} doesn't see my-feature because ${rolloutCoverage} (theirs is ${bucket}).`;
    }
    if (errored) {
        const experience = variant
            ? `my-feature variant ${variant.name}`
            : 'my-feature';
        return `${user.name} sees ${experience}, but their request returned an error.`;
    }
    const experience = variant
        ? `my-feature variant ${variant.name}`
        : 'my-feature';
    const allocation =
        variant && explainVariantAllocation
            ? ` Variant ${variant.name} has a ${Math.round(variant.weight)}% allocation, and ${user.name}'s assignment stays sticky.`
            : '';
    if (constraints.activeCount > 0) {
        const count = constraintCountLabel(constraints.activeCount);
        return `${user.name} sees ${experience} because ${naturalList(constraints.values)} match ${count}, and ${rolloutCoverage} (theirs is ${bucket}).${allocation}`;
    }
    return `${user.name} sees ${experience} because ${rolloutCoverage} (theirs is ${bucket}).${allocation}`;
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
    const openUserId = selectedId;

    const [gridSize, setGridSize] = useState({ width: 0, height: 0 });
    const resizeObserver = useRef<ResizeObserver>(undefined);
    const setGridWrapRef = useCallback((node: HTMLDivElement | null) => {
        resizeObserver.current?.disconnect();
        if (!node || typeof ResizeObserver === 'undefined') return;
        resizeObserver.current = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setGridSize((current) =>
                Math.abs(current.width - width) > 2 ||
                Math.abs(current.height - height) > 2
                    ? { width, height }
                    : current,
            );
        });
        resizeObserver.current.observe(node);
    }, []);
    useEffect(() => () => resizeObserver.current?.disconnect(), []);

    const fit =
        gridSize.width > 0 && gridSize.height > 0
            ? gridFit(users.length, gridSize.width, gridSize.height)
            : null;
    const avatarSize = fit?.avatar ?? 44;
    const showMeta = fit?.showMeta ?? true;
    const gridStyle = fit
        ? {
              gridTemplateColumns: `repeat(${fit.cols}, minmax(0, 1fr))`,
              gridAutoRows: `${fit.tileH}px`,
          }
        : {
              gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))',
              gridAutoRows: '96px',
          };

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
    const openState: 'smart' | 'classic' | 'error' = openErrored
        ? 'error'
        : openSmart
          ? 'smart'
          : 'classic';
    const openIndex = openUser ? users.indexOf(openUser) : -1;
    const openStateLabel =
        openState === 'smart'
            ? openVariant
                ? `Variant ${openVariant.name} enabled`
                : 'Feature enabled'
            : openState === 'error'
              ? 'Feature error'
              : 'Feature disabled';

    const closePreview = () => {
        onSelect(undefined);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Escape' && openUser) {
            event.stopPropagation();
            closePreview();
        }
    };

    const renderMockList = () =>
        [
            { name: 92, sub: 52 },
            { name: 74, sub: 44 },
            { name: 84, sub: 58 },
            { name: 66, sub: 40 },
        ].map((row, index) => (
            <StyledMockRow key={index}>
                <StyledMockRowCopy>
                    <StyledBar w={row.name} h={7} tone='mid' />
                    <StyledBar w={row.sub} h={6} tone='weak' />
                </StyledMockRowCopy>
                <StyledBar w={34} h={7} tone='strong' />
            </StyledMockRow>
        ));

    const renderMock = (
        state: 'smart' | 'classic' | 'error',
        accent: string,
    ) => (
        <StyledMockFrame
            data-testid='QUICK_TOUR_INTRO_MOCK_FRAME'
            data-experience={state}
        >
            <StyledMockChrome>
                <StyledMockDot />
                <StyledMockDot />
                <StyledMockDot />
                <StyledMockUrl>app.acme.io/accounts</StyledMockUrl>
            </StyledMockChrome>
            <StyledMockContent>
                {state === 'smart' ? (
                    <StyledFeatureCard accent={accent}>
                        <StyledBar w={52} h={6} barColor={alpha(accent, 0.4)} />
                        <StyledBar w={104} h={16} barColor={accent} />
                        <Box
                            component='svg'
                            viewBox='0 0 240 40'
                            preserveAspectRatio='none'
                            sx={{ display: 'block', width: '100%', height: 36 }}
                        >
                            <path
                                d='M4 32 L40 22 L72 27 L112 11 L152 19 L196 5 L236 11'
                                fill='none'
                                stroke={accent}
                                strokeWidth={3}
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                        </Box>
                    </StyledFeatureCard>
                ) : state === 'error' ? (
                    <StyledErrorCard data-testid='QUICK_TOUR_INTRO_ERROR_PREVIEW'>
                        <ErrorOutlineIcon />
                        <StyledMockRowCopy>
                            <StyledBar w={104} h={16} tone='strong' />
                            <StyledBar w={64} h={6} tone='weak' />
                        </StyledMockRowCopy>
                    </StyledErrorCard>
                ) : (
                    <StyledBaselineCard>
                        <Box
                            component='svg'
                            viewBox='0 0 80 80'
                            sx={{
                                display: 'block',
                                width: 56,
                                height: 56,
                                flex: 'none',
                            }}
                        >
                            <circle
                                cx={40}
                                cy={40}
                                r={30}
                                fill='none'
                                stroke={theme.palette.divider}
                                strokeWidth={10}
                            />
                            <circle
                                cx={40}
                                cy={40}
                                r={30}
                                fill='none'
                                stroke={alpha(theme.palette.primary.main, 0.5)}
                                strokeWidth={10}
                                strokeLinecap='round'
                                strokeDasharray='130 59'
                                transform='rotate(-90 40 40)'
                            />
                        </Box>
                        <StyledMockRowCopy>
                            <StyledBar w={104} h={16} tone='strong' />
                            <StyledBar w={64} h={6} tone='weak' />
                        </StyledMockRowCopy>
                    </StyledBaselineCard>
                )}
                {renderMockList()}
            </StyledMockContent>
        </StyledMockFrame>
    );

    return (
        <StyledContentRow onKeyDown={handleKeyDown}>
            <StyledGridWrap ref={setGridWrapRef}>
                <StyledGrid
                    data-testid='QUICK_TOUR_INTRO_USER_GRID'
                    style={gridStyle}
                >
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
                        const experienceLabel = errored
                            ? 'my-feature error'
                            : !environmentEnabled || !enabled
                              ? 'my-feature off'
                              : configuredVariant
                                ? `my-feature variant ${configuredVariant.name}`
                                : 'my-feature on';
                        const smart = environmentEnabled && enabled && !errored;
                        const experience: 'smart' | 'classic' | 'error' =
                            errored ? 'error' : smart ? 'smart' : 'classic';
                        const accent =
                            configuredVariant?.color ??
                            theme.palette.primary.main;
                        const tooltipLabel = smart
                            ? configuredVariant
                                ? `Variant ${configuredVariant.name} enabled`
                                : 'Feature enabled'
                            : errored
                              ? 'Feature error'
                              : 'Feature disabled';

                        return (
                            <Tooltip
                                key={user.id}
                                title={tooltipLabel}
                                arrow
                                enterDelay={200}
                            >
                                <StyledPerson
                                    type='button'
                                    aria-label={`${user.name}, ${user.country.label}: ${experienceLabel}`}
                                    selected={selectedId === user.id}
                                    enabled={smart}
                                    accent={accent}
                                    dimmed={
                                        selectedId !== undefined &&
                                        selectedId !== user.id
                                    }
                                    onClick={() => {
                                        onSelect(
                                            openUserId === user.id
                                                ? undefined
                                                : user,
                                        );
                                    }}
                                >
                                    <StyledAvatarWrap>
                                        <StyledAvatarImg
                                            avatarUrl={avatarForIndex(index)}
                                            hue={(index * 47) % 360}
                                            enabled={smart}
                                            size={avatarSize}
                                        />
                                        <StyledStatusBadge
                                            experience={experience}
                                            data-testid='QUICK_TOUR_INTRO_USER_STATUS'
                                            data-experience={experience}
                                        >
                                            {experience === 'smart' ? (
                                                <CheckIcon />
                                            ) : experience === 'error' ? (
                                                <ErrorOutlineIcon />
                                            ) : (
                                                <CloseIcon />
                                            )}
                                        </StyledStatusBadge>
                                    </StyledAvatarWrap>
                                    <StyledName variant='body2'>
                                        {user.name}
                                    </StyledName>
                                    {showMeta ? (
                                        <StyledMeta>
                                            {user.country.code} · {plan.label}
                                        </StyledMeta>
                                    ) : null}
                                </StyledPerson>
                            </Tooltip>
                        );
                    })}
                </StyledGrid>
            </StyledGridWrap>

            {openUser ? (
                <StyledPreviewPanel data-testid='QUICK_TOUR_INTRO_POPOVER'>
                    <StyledPanelHeader>
                        <StyledPanelHeaderRow>
                            <StyledPanelAvatar
                                avatarUrl={avatarForIndex(openIndex)}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <StyledPopoverTitle
                                    variant='subtitle2'
                                    sx={{ color: 'text.primary' }}
                                >
                                    {openUser.name}
                                </StyledPopoverTitle>
                                <StyledMeta
                                    sx={{
                                        whiteSpace: 'normal',
                                        overflow: 'visible',
                                    }}
                                >
                                    {openUser.country.label} · {openPlan?.label}{' '}
                                    · bucket {openEvaluation?.rolloutBucket}
                                </StyledMeta>
                            </Box>
                            <StyledPopoverClose
                                size='small'
                                aria-label='Close full preview'
                                onClick={closePreview}
                            >
                                <CloseIcon fontSize='small' />
                            </StyledPopoverClose>
                        </StyledPanelHeaderRow>
                        <StyledEvaluationPanel state={openState}>
                            <StyledEvalHeadline>
                                {openStateLabel}
                            </StyledEvalHeadline>
                            <StyledExplanation>
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
                                    <span className='json-key'>"Country"</span>
                                    <span className='json-punctuation'>
                                        {': '}
                                    </span>
                                    <span className='json-string'>
                                        {`"${openUser.country.code}"`}
                                    </span>
                                    <span className='json-punctuation'>
                                        {',\n'}
                                    </span>
                                    {'  '}
                                    <span className='json-key'>"Plan"</span>
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
                    </StyledPanelHeader>

                    <StyledPopoverBody data-testid='QUICK_TOUR_INTRO_POPOVER_BODY'>
                        <StyledPreviewLabel>Preview</StyledPreviewLabel>

                        {renderMock(
                            openState,
                            openVariant?.color ?? theme.palette.primary.main,
                        )}
                    </StyledPopoverBody>
                </StyledPreviewPanel>
            ) : null}
        </StyledContentRow>
    );
};
