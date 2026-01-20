import type { FC, ReactNode } from 'react';
import { Box } from '@mui/material';
import type { FilterItemParamHolder } from '../../../filter/Filters/Filters.tsx';
import { useLifecycleCount } from 'hooks/api/getters/useLifecycleCount/useLifecycleCount';
import { LifecycleFilters } from 'component/common/LifecycleFilters/LifecycleFilters.tsx';

type FeaturesOverviewLifecycleFiltersProps = {
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
    children?: ReactNode;
};

export const FeaturesOverviewLifecycleFilters: FC<
    FeaturesOverviewLifecycleFiltersProps
> = ({ state, onChange, children }) => {
    const { lifecycleCount } = useLifecycleCount();
    const countData = Object.entries(lifecycleCount || {}).reduce(
        (acc, [key, value]) => {
            acc[key === 'preLive' ? 'pre-live' : key] = value;
            return acc;
        },
        {} as Record<string, number>,
    );

    return (
        <Box sx={(theme) => ({ padding: theme.spacing(1.5, 3, 0, 3) })}>
            <LifecycleFilters
                state={state}
                onChange={onChange}
                countData={countData}
            >
                {children}
            </LifecycleFilters>
        </Box>
    );
};
