import type { FC, ReactNode } from 'react';
import type { FilterItemParamHolder } from '../../../filter/Filters/Filters.tsx';
import type { LifecycleStage } from '../../FeatureView/FeatureOverview/FeatureLifecycle/LifecycleStage.tsx';
import { useLifecycleCount } from 'hooks/api/getters/useLifecycleCount/useLifecycleCount';
import type { FeatureLifecycleCountSchema } from 'openapi';
import { LifecycleFilters } from '../../../common/LifecycleFilters/LifecycleFilters.tsx';

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

interface ILifecycleFiltersProps {
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
    total?: number;
    children?: ReactNode;
}

export const FeatureLifecycleFilters: FC<ILifecycleFiltersProps> = ({
    state,
    onChange,
    total,
    children,
}) => {
    const { lifecycleCount } = useLifecycleCount();

    return (
        <LifecycleFilters
            state={state}
            onChange={onChange}
            total={total}
            countData={lifecycleCount}
            getStageCount={getStageCount}
            sx={{
                padding: (theme) =>
                    `${theme.spacing(1.5)} ${theme.spacing(3)} 0 ${theme.spacing(3)}`,
            }}
        >
            {children}
        </LifecycleFilters>
    );
};
