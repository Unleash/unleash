import { Box, styled, Tooltip, useTheme, type Theme } from '@mui/material';
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
        !['background', 'foreground', 'enabled', 'selected'].includes(
            prop as string,
        ),
})<{
    background: string;
    foreground: string;
    enabled: boolean;
    selected: boolean;
}>(({ theme, background, foreground, enabled, selected }) => ({
    all: 'unset',
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
    outline: selected
        ? `2px solid ${theme.palette.primary.main}`
        : '2px solid transparent',
    outlineOffset: 2,
    opacity: enabled ? 1 : 0.9,
    transform: enabled ? 'scale(1)' : 'scale(0.94)',
    // The smooth colour + scale transition is what makes the rollout "fill in"
    // as the slider moves - the core dopamine moment.
    transition: theme.transitions.create(
        ['background-color', 'transform', 'color', 'opacity'],
        { duration: theme.transitions.duration.shorter },
    ),
    '&:hover': {
        transform: 'scale(1.08)',
    },
    '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
    },
}));

const tileColors = (
    theme: Theme,
    evaluation: UserEvaluation | undefined,
    mode: GridMode,
    variantOrder: string[],
): { background: string; foreground: string } => {
    if (!evaluation?.enabled) {
        return {
            background: theme.palette.divider,
            foreground: theme.palette.text.secondary,
        };
    }
    if (mode === 'variants' && evaluation.variant) {
        const index = Math.max(0, variantOrder.indexOf(evaluation.variant));
        const background =
            theme.palette.variants[index % theme.palette.variants.length];
        return {
            background,
            foreground: theme.palette.getContrastText(background),
        };
    }
    if (mode === 'target' && evaluation.reason === 'target') {
        const background = theme.palette.secondary.main;
        return {
            background,
            foreground: theme.palette.getContrastText(background),
        };
    }
    const background = theme.palette.success.main;
    return {
        background,
        foreground: theme.palette.getContrastText(background),
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
                const { background, foreground } = tileColors(
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
