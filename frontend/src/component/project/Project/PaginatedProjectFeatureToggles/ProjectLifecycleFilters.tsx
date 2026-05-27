import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';
import type { FilterItemParamHolder } from '../../../filter/Filters/Filters.tsx';
import { useProjectStatus } from 'hooks/api/getters/useProjectStatus/useProjectStatus';
import { LifecycleFilters } from 'component/common/LifecycleFilters/LifecycleFilters.tsx';
import { Box } from '@mui/material';
import { useUiFlag } from 'hooks/useUiFlag';

type ProjectLifecycleFiltersProps = {
    projectId: string;
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
    total?: number;
    children?: ReactNode;
};

export const ProjectLifecycleFilters: FC<ProjectLifecycleFiltersProps> = ({
    projectId,
    state,
    onChange,
    children,
}) => {
    const { data } = useProjectStatus(projectId);
    const archivedInLifecycleFilter = useUiFlag('archivedInLifecycleFilter');
    const lifecycleSummary = Object.entries(
        data?.lifecycleSummary || {},
    ).reduce(
        (acc, [key, value]) => {
            acc[key === 'preLive' ? 'pre-live' : key] = value.currentFlags || 0;
            return acc;
        },
        {} as Record<string, number>,
    );

    const isArchivedFilterActive = state.archived?.values?.includes('true');
    useEffect(() => {
        if (
            !archivedInLifecycleFilter &&
            isArchivedFilterActive &&
            state.lifecycle
        ) {
            onChange({ ...state, lifecycle: null });
        }
    }, [archivedInLifecycleFilter, isArchivedFilterActive, state, onChange]);

    if (!archivedInLifecycleFilter && isArchivedFilterActive) {
        return null;
    }

    return (
        <Box sx={{ marginRight: 'auto' }}>
            <LifecycleFilters
                state={state}
                onChange={onChange}
                countData={lifecycleSummary}
            >
                {children}
            </LifecycleFilters>
        </Box>
    );
};
