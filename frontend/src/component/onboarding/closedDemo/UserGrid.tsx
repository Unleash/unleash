import {
    alpha,
    Box,
    styled,
    Tooltip,
    useTheme,
    type Theme,
} from '@mui/material';
import type { DemoUser, UserEvaluation } from './demoModel.js';

export type GridMode = 'onoff' | 'rollout' | 'target' | 'variants';

const StyledGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gap: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: 'repeat(6, 1fr)',
    },
}));

const StyledTile = styled('button', {
    shouldForwardProp: (prop) =>
        ![
            'background',
            'foreground',
            'borderColor',
            'enabled',
            'selected',
        ].includes(prop as string),
})<{
    background: string;
    foreground: string;
    borderColor: string;
    enabled: boolean;
    selected: boolean;
}>(({ theme, background, foreground, borderColor, enabled, selected }) => ({
    all: 'unset',
    boxSizing: 'border-box',
    cursor: 'pointer',
    aspectRatio: '1 / 1',
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    color: foreground,
    backgroundColor: background,
    border: `1px solid ${borderColor}`,
    outline: selected
        ? `2px solid ${theme.palette.primary.main}`
        : '2px solid transparent',
    outlineOffset: 2,
    opacity: enabled ? 1 : 0.9,
    transform: enabled ? 'scale(1)' : 'scale(0.94)',
    // The smooth colour + scale transition is what makes the rollout "fill in"
    // as the slider moves - the core dopamine moment.
    transition: theme.transitions.create(
        ['background-color', 'border-color', 'transform', 'color', 'opacity'],
        { duration: theme.transitions.duration.shorter },
    ),
    '&:hover': {
        transform: 'scale(1.08)',
    },
    '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
    },
}));

// Soft badge-style colours (tint + border) rather than solid fills, so 60
// enabled tiles read as state, not as a wall of colour.
const tileColors = (
    theme: Theme,
    evaluation: UserEvaluation | undefined,
    mode: GridMode,
    variantOrder: string[],
): { background: string; foreground: string; borderColor: string } => {
    if (!evaluation?.enabled) {
        return {
            background: theme.palette.background.elevation1,
            foreground: theme.palette.text.secondary,
            borderColor: theme.palette.divider,
        };
    }
    if (mode === 'variants' && evaluation.variant) {
        const index = Math.max(0, variantOrder.indexOf(evaluation.variant));
        const color =
            theme.palette.variants[index % theme.palette.variants.length];
        return {
            background: alpha(color, 0.45),
            foreground: theme.palette.text.primary,
            borderColor: color,
        };
    }
    if (mode === 'target' && evaluation.reason === 'target') {
        return {
            background: alpha(theme.palette.secondary.main, 0.35),
            foreground: theme.palette.secondary.dark,
            borderColor: theme.palette.secondary.main,
        };
    }
    return {
        background: alpha(theme.palette.success.main, 0.45),
        foreground: theme.palette.success.dark,
        borderColor: theme.palette.success.main,
    };
};

interface IUserGridProps {
    users: DemoUser[];
    evaluations: UserEvaluation[];
    mode: GridMode;
    /** Variant names in configured order, for stable per-variant colours. */
    variantOrder?: string[];
    selectedId?: string;
    onSelect: (user: DemoUser) => void;
}

export const UserGrid = ({
    users,
    evaluations,
    mode,
    variantOrder = [],
    selectedId,
    onSelect,
}: IUserGridProps) => {
    const theme = useTheme();

    return (
        <StyledGrid>
            {users.map((user, i) => {
                const evaluation = evaluations[i];
                const enabled = evaluation?.enabled ?? false;
                const { background, foreground, borderColor } = tileColors(
                    theme,
                    evaluation,
                    mode,
                    variantOrder,
                );

                const tooltip = enabled
                    ? `${user.name} · ${user.country.flag} ${user.country.code}${
                          evaluation?.variant
                              ? ` · ${evaluation.variant}`
                              : ' · sees the feature'
                      }`
                    : `${user.name} · ${user.country.flag} ${user.country.code} · not yet`;

                const content =
                    mode === 'target' && user.country.flag
                        ? user.country.flag
                        : user.name.charAt(0).toUpperCase();

                return (
                    <Tooltip key={user.id} title={tooltip} arrow>
                        <StyledTile
                            type='button'
                            background={background}
                            foreground={foreground}
                            borderColor={borderColor}
                            enabled={enabled}
                            selected={selectedId === user.id}
                            onClick={() => onSelect(user)}
                        >
                            {content}
                        </StyledTile>
                    </Tooltip>
                );
            })}
        </StyledGrid>
    );
};
