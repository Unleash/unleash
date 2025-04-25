import { Box, Chip, styled } from '@mui/material';
import type { FC } from 'react';
import type { FilterItemParamHolder } from '../../../filter/Filters/Filters';
import type { LifecycleStage } from '../../FeatureView/FeatureOverview/FeatureLifecycle/LifecycleStage';
import { useLifecycleCount } from 'hooks/api/getters/useLifecycleCount/useLifecycleCount';
import type { FeatureLifecycleCountSchema } from 'openapi';

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

const getStageCount = (
    lifecycle: LifecycleStage['name'] | null,
    lifecycleCount?: FeatureLifecycleCountSchema,
) => {
    if (!lifecycleCount) {
        return undefined;
    }

    if (lifecycle === null) {
        return (
            (lifecycleCount.initial || 0) +
            (lifecycleCount.preLive || 0) +
            (lifecycleCount.live || 0) +
            (lifecycleCount.completed || 0)
        );
    }

    const key = lifecycle === 'pre-live' ? 'preLive' : lifecycle;
    return lifecycleCount[key];
};

export const LifecycleFilters: FC<ILifecycleFiltersProps> = ({
    state,
    onChange,
    total,
}) => {
    const { lifecycleCount } = useLifecycleCount();
    const current = state.lifecycle?.values ?? [];

    return (
        <Wrapper>
            {lifecycleOptions.map(({ label, value }) => {
                const isActive =
                    value === null ? !state.lifecycle : current.includes(value);
                const count = getStageCount(value, lifecycleCount);
                const dynamicLabel =
                    isActive && Number.isInteger(total)
                        ? `${label} (${total === count ? total : `${total} of ${count}`})`
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
                        isActive={isActive}
                        onClick={handleClick}
                    />
                );
            })}
        </Wrapper>
    );
};
