import { Box, Chip, styled } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';
import type { FilterItemParamHolder } from '../../filter/Filters/Filters.tsx';
import type { LifecycleStage } from '../../feature/FeatureView/FeatureOverview/FeatureLifecycle/LifecycleStage.tsx';

const StyledChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'isActive',
})<{
    isActive?: boolean;
}>(({ theme, label }) => ({
    borderRadius: 0,
    padding: theme.spacing(0.5),
    fontSize: theme.typography.body2.fontSize,
    height: 'auto',
    fontWeight: theme.typography.fontWeightMedium,
    '&[data-selected="true"]': {
        backgroundColor: theme.palette.secondary.light,
        fontWeight: 'bold',
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
    },
    ':focus-visible': {
        outline: `1px solid ${theme.palette.primary.main}`,
        borderColor: theme.palette.primary.main,
    },
    '&:first-of-type': {
        borderTopLeftRadius: theme.shape.borderRadius,
        borderBottomLeftRadius: theme.shape.borderRadius,
    },
    '&:last-of-type': {
        borderTopRightRadius: theme.shape.borderRadius,
        borderBottomRightRadius: theme.shape.borderRadius,
    },
    '&:not(&[data-selected="true"], :last-of-type)': {
        borderRightWidth: 0,
    },
    '[data-selected="true"] + &': {
        borderLeftWidth: 0,
    },
    '& .MuiChip-label': {
        position: 'relative',
        textAlign: 'center',
        '&::before': {
            content: `'${label}'`,
            fontWeight: 'bold',
            visibility: 'hidden',
            height: 0,
            display: 'block',
            overflow: 'hidden',
            userSelect: 'none',
        },
    },
}));

interface ILifecycleFiltersBaseProps {
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
    total?: number;
    children?: ReactNode;
    countData?: Record<LifecycleStage['name'], number>;
    sx?: SxProps<Theme>;
}

const Wrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
}));

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
}));

const lifecycleOptions: {
    label: string;
    value: LifecycleStage['name'] | null;
}[] = [
    { label: 'All flags', value: null },
    { label: 'Develop', value: 'pre-live' },
    { label: 'Rollout production', value: 'live' },
    { label: 'Cleanup', value: 'completed' },
];

export const LifecycleFilters = ({
    state,
    onChange,
    total,
    children,
    countData,
}: ILifecycleFiltersBaseProps) => {
    const current = state.lifecycle?.values ?? [];
    const allFlagsCount = Object.entries(countData ?? {}).reduce(
        (acc, [key, count]) => (key !== 'archived' ? acc + count : acc),
        0,
    );

    return (
        <Wrapper>
            <StyledContainer>
                {lifecycleOptions.map(({ label, value }) => {
                    const isActive =
                        value === null
                            ? !state.lifecycle
                            : current.includes(value);
                    const count = value
                        ? countData?.[value]
                        : allFlagsCount || undefined;
                    const dynamicLabel =
                        isActive && Number.isInteger(total)
                            ? `${label} (${total === (count ?? 0) ? total : `${total} of ${count}`})`
                            : `${label}${count !== undefined ? ` (${count})` : ''}`;

                    const handleClick = () =>
                        onChange(
                            value === null
                                ? { lifecycle: null }
                                : {
                                      lifecycle: {
                                          operator: 'IS',
                                          values: [value],
                                      },
                                  },
                        );

                    return (
                        <StyledChip
                            key={label}
                            label={dynamicLabel}
                            variant='outlined'
                            onClick={handleClick}
                            data-selected={isActive}
                        />
                    );
                })}
            </StyledContainer>
            {children}
        </Wrapper>
    );
};
