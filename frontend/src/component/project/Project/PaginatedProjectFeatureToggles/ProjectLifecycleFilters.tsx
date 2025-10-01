import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';
import type { FilterItemParamHolder } from '../../../filter/Filters/Filters.tsx';
import { useProjectStatus } from 'hooks/api/getters/useProjectStatus/useProjectStatus';
import { LifecycleFilters } from 'component/common/LifecycleFilters/LifecycleFilters.tsx';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useUiFlag } from 'hooks/useUiFlag.ts';

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
    total,
    children,
}) => {
    const { data } = useProjectStatus(projectId);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const flagsUiFilterRefactorEnabled = useUiFlag('flagsUiFilterRefactor');
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
        if (isArchivedFilterActive && state.lifecycle) {
            onChange({ ...state, lifecycle: null });
        }
    }, [isArchivedFilterActive, state, onChange]);

    if (isArchivedFilterActive) {
        return null;
    }

    return (
        <Box
            sx={{
                marginRight: 'auto',
                ...(flagsUiFilterRefactorEnabled
                    ? {}
                    : {
                          margin: isSmallScreen
                              ? theme.spacing(0, 3)
                              : `${theme.spacing(1.5)} auto 0 ${theme.spacing(3)}`,
                      }),
            }}
        >
            <LifecycleFilters
                state={state}
                onChange={onChange}
                total={total}
                countData={lifecycleSummary}
            >
                {children}
            </LifecycleFilters>
        </Box>
    );
};
