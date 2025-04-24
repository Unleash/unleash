import { Box, Chip, styled } from '@mui/material';
import type { FC } from 'react';
import type { FilterItemParamHolder } from '../../../filter/Filters/Filters';
import type { LifecycleStage } from '../../FeatureView/FeatureOverview/FeatureLifecycle/LifecycleStage';
import { useLifecycleCount } from 'hooks/api/getters/useLifecycleCount/useLifecycleCount';

const StyledChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'isActive',
})<{
    isActive?: boolean;
}>(({ theme, isActive = false }) => ({
    borderRadius: `${theme.shape.borderRadius}px`,
    padding: theme.spacing(0.5),
    fontSize: theme.typography.body2.fontSize,
    height: 'auto',
    ...(isActive && {
        backgroundColor: theme.palette.secondary.light,
        fontWeight: 'bold',
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
    }),
    ':focus-visible': {
        outline: `1px solid ${theme.palette.primary.main}`,
        borderColor: theme.palette.primary.main,
    },
}));

interface ILifecycleFiltersProps {
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
    total?: number;
}

const Wrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(2, 3, 0, 3),
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

export const LifecycleFilters: FC<ILifecycleFiltersProps> = ({
    state,
    onChange,
    total,
}) => {
    const { lifecycleCount } = useLifecycleCount();
    // FIXME: use lifecycleCount
    const current = state.lifecycle?.values ?? [];

    return (
        <Wrapper>
            {lifecycleOptions.map(({ label, value }) => {
                const isActive =
                    value === null ? !state.lifecycle : current.includes(value);
                const dynamicLabel =
                    isActive && Number.isInteger(total)
                        ? `${label} (${total})`
                        : label;

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
                        isActive={isActive}
                        onClick={handleClick}
                    />
                );
            })}
        </Wrapper>
    );
};
