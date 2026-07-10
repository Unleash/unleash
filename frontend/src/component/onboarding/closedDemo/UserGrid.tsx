import { useCallback, useRef, useState } from 'react';
import {
    alpha,
    Box,
    Popover,
    styled,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import type { DemoUser, DemoVariant, UserEvaluation } from './demoModel.js';
import { DemoCharacter } from './DemoCharacter.tsx';

export type GridMode = 'onoff' | 'rollout' | 'target' | 'variants';

const StyledGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: theme.spacing(1),
    },
}));

const StyledPerson = styled('button', {
    shouldForwardProp: (prop) =>
        !['selected', 'highlightBackground', 'highlightBorder'].includes(
            prop as string,
        ),
})<{
    selected: boolean;
    highlightBackground?: string;
    highlightBorder?: string;
}>(({ theme, selected, highlightBackground, highlightBorder }) => ({
    all: 'unset',
    boxSizing: 'border-box',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.75, 0.5, 0.5),
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: highlightBackground ?? 'transparent',
    border: `1px solid ${highlightBorder ?? 'transparent'}`,
    outline: selected
        ? `2px solid ${theme.palette.primary.main}`
        : '2px solid transparent',
    transition: theme.transitions.create(
        ['transform', 'background-color', 'border-color'],
        {
            duration: theme.transitions.duration.shorter,
        },
    ),
    '&:hover': {
        transform: 'translateY(-2px)',
    },
    '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
    },
    '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
    },
}));

const StyledName = styled('span', {
    shouldForwardProp: (prop) => prop !== 'highlighted',
})<{ highlighted: boolean }>(({ theme, highlighted }) => ({
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: theme.fontSizes.smallerBody,
    lineHeight: 1.4,
    padding: theme.spacing(0, 0.75),
    borderRadius: theme.shape.borderRadius,
    color: highlighted
        ? theme.palette.secondary.dark
        : theme.palette.text.secondary,
    backgroundColor: highlighted
        ? alpha(theme.palette.secondary.main, 0.2)
        : 'transparent',
    fontWeight: highlighted
        ? theme.typography.fontWeightBold
        : theme.typography.fontWeightRegular,
    transition: theme.transitions.create(['background-color', 'color'], {
        duration: theme.transitions.duration.shorter,
    }),
}));

const StyledFlag = styled('span')(({ theme }) => ({
    fontSize: '1rem',
    lineHeight: 1,
    marginRight: theme.spacing(0.25),
    verticalAlign: 'middle',
}));

const StyledPopoverContent = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    maxWidth: theme.spacing(38),
}));

const StyledPayload = styled('pre')(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.background.elevation1,
    fontSize: theme.fontSizes.smallerBody,
    overflowX: 'auto',
}));

// A tiny abstract phone showing what this user's checkout looks like - the
// button is rendered straight from the variant payload (colour and text).
const StyledPhone = styled(Box)(({ theme }) => ({
    alignSelf: 'center',
    width: theme.spacing(17),
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.elevation1,
    padding: theme.spacing(1),
}));

const StyledPhoneScreen = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'tint',
})<{ tint: string }>(({ theme, tint }) => ({
    borderRadius: theme.shape.borderRadiusMedium,
    background: alpha(tint, 0.25),
    height: theme.spacing(19),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledPhoneCta = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'color',
})<{ color: string }>(({ theme, color }) => ({
    width: theme.spacing(11),
    height: theme.spacing(11),
    borderRadius: '50%',
    background: color,
    color: theme.palette.getContrastText(color),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: theme.spacing(0.75),
    boxSizing: 'border-box',
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: 1.3,
}));

const statusLine = (
    evaluation: UserEvaluation | undefined,
    mode: GridMode,
    constraintsActive: boolean,
): string => {
    if (!evaluation) {
        return '';
    }
    if (constraintsActive && !evaluation.matchesConstraints) {
        return `Doesn't match the constraints, so the rollout doesn't apply to them at all.`;
    }
    if (!evaluation.enabled) {
        return mode === 'rollout' || mode === 'target'
            ? `${constraintsActive ? 'Matches the constraints but is' : 'Is'} outside the rollout - joins once it reaches ${evaluation.rolloutBucket}%.`
            : `Doesn't see the feature.`;
    }
    if (evaluation.variant) {
        return `Sees version ${evaluation.variant} of the checkout:`;
    }
    if (constraintsActive) {
        return `Matches the constraints and is inside the rollout, so they see the feature.`;
    }
    return `Sees the feature - inside the rollout (bucket ${evaluation.rolloutBucket} of 100).`;
};

interface IUserGridProps {
    users: DemoUser[];
    evaluations: UserEvaluation[];
    mode: GridMode;
    /** The configured variants, for stable colours and payload lookup. */
    variants?: DemoVariant[];
    /** Whether the strategy currently has active constraints. */
    constraintsActive?: boolean;
    /**
     * How many currently-enabled users are affected by an incident. Their
     * tiles get an error tint instead of the success one; picked from the
     * enabled users in grid order so the reports appear to snowball.
     */
    erroredCount?: number;
    selectedId?: string;
    /** Called with the clicked user, or undefined when the popover closes. */
    onSelect: (user: DemoUser | undefined) => void;
}

export const UserGrid = ({
    users,
    evaluations,
    mode,
    variants = [],
    constraintsActive = false,
    erroredCount = 0,
    selectedId,
    onSelect,
}: IUserGridProps) => {
    const erroredUserIds = new Set<string>();
    let taken = 0;
    for (let i = 0; i < users.length && taken < erroredCount; i++) {
        if (evaluations[i]?.enabled) {
            erroredUserIds.add(users[i].id);
            taken++;
        }
    }
    const theme = useTheme();
    const [openUserId, setOpenUserId] = useState<string | undefined>();
    // Ref map (not state) so a layout reflow that remounts the button doesn't
    // strand a stale DOM node. MUI re-invokes the anchor function whenever it
    // repositions (including on window resize), so the popover keeps tracking
    // whichever node is currently in the map for `openUserId`.
    const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
    const setButtonRef = useCallback(
        (userId: string) => (node: HTMLButtonElement | null) => {
            if (node) buttonRefs.current.set(userId, node);
            else buttonRefs.current.delete(userId);
        },
        [],
    );

    const variantOrder = variants.map((variant) => variant.name);
    const openUser = users.find((user) => user.id === openUserId);
    const openEvaluation = openUser
        ? evaluations[users.indexOf(openUser)]
        : undefined;
    const openVariant = openEvaluation?.variant
        ? variants.find((variant) => variant.name === openEvaluation.variant)
        : undefined;

    const closePopover = () => {
        setOpenUserId(undefined);
        onSelect(undefined);
    };

    return (
        <>
            <StyledGrid data-testid='CLOSED_DEMO_USER_GRID'>
                {users.map((user, i) => {
                    const evaluation = evaluations[i];
                    const enabled = evaluation?.enabled ?? false;
                    const variant = evaluation?.variant;
                    const variantIndex = variant
                        ? Math.max(0, variantOrder.indexOf(variant))
                        : 0;
                    const variantColor = variant
                        ? (variants[variantIndex]?.color ??
                          theme.palette.variants[
                              variantIndex % theme.palette.variants.length
                          ])
                        : undefined;
                    const errored = erroredUserIds.has(user.id);
                    // All state pills share the same alpha-tinted background
                    // + solid border treatment so light/dark modes read the
                    // same, and the pill's identity comes from its hue rather
                    // than the theme's Alert-chip surface (which collapses to
                    // near-neutral in dark mode).
                    const chip = (main: string, backgroundAlpha = 0.4) => ({
                        background: alpha(main, backgroundAlpha),
                        border: main,
                    });
                    const highlight =
                        mode === 'variants' && variantColor
                            ? chip(variantColor)
                            : errored
                              ? chip(theme.palette.error.main)
                              : enabled
                                ? chip(theme.palette.secondary.main, 0.4)
                                : undefined;
                    const highlighted =
                        mode === 'target' &&
                        constraintsActive &&
                        (evaluation?.matchesConstraints ?? false);

                    const label = `${user.name}, ${user.country.label}: ${
                        enabled
                            ? variant
                                ? `sees version ${variant}`
                                : 'sees the feature'
                            : 'does not see the feature'
                    }`;

                    return (
                        <StyledPerson
                            key={user.id}
                            ref={setButtonRef(user.id)}
                            type='button'
                            aria-label={label}
                            selected={selectedId === user.id}
                            highlightBackground={highlight?.background}
                            highlightBorder={highlight?.border}
                            onClick={() => {
                                setOpenUserId(user.id);
                                onSelect(user);
                            }}
                        >
                            <DemoCharacter
                                look={user.look}
                                raised={enabled}
                                badge={
                                    mode === 'variants' ? variant : undefined
                                }
                                index={i}
                            />
                            <StyledName highlighted={highlighted}>
                                <StyledFlag>{user.country.flag}</StyledFlag>
                                {user.name}
                            </StyledName>
                        </StyledPerson>
                    );
                })}
            </StyledGrid>
            <Popover
                open={Boolean(openUserId && openUser)}
                anchorEl={
                    openUserId
                        ? () => buttonRefs.current.get(openUserId) ?? null
                        : undefined
                }
                onClose={closePopover}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                {openUser ? (
                    <StyledPopoverContent>
                        <Typography sx={{ fontWeight: 'bold' }}>
                            {openUser.country.flag} {openUser.name} ·{' '}
                            {openUser.country.label}
                        </Typography>
                        <Typography variant='body2' color='textSecondary'>
                            {statusLine(
                                openEvaluation,
                                mode,
                                constraintsActive,
                            )}
                        </Typography>
                        {openVariant?.color && openVariant.cta ? (
                            <StyledPhone>
                                <StyledPhoneScreen tint={openVariant.color}>
                                    <StyledPhoneCta color={openVariant.color}>
                                        {openVariant.cta}
                                    </StyledPhoneCta>
                                </StyledPhoneScreen>
                            </StyledPhone>
                        ) : null}
                        {openVariant?.payload ? (
                            <Tooltip title={openVariant.payload} arrow>
                                <StyledPayload data-testid='CLOSED_DEMO_PAYLOAD'>
                                    {openVariant.payload}
                                </StyledPayload>
                            </Tooltip>
                        ) : null}
                    </StyledPopoverContent>
                ) : null}
            </Popover>
        </>
    );
};
