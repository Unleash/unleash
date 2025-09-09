import { Box, Chip, styled } from '@mui/material';
import type { FC, ReactNode } from 'react';
import type { FilterItemParamHolder } from '../../../filter/Filters/Filters.tsx';
import type { LifecycleStage } from '../../../feature/FeatureView/FeatureOverview/FeatureLifecycle/LifecycleStage.tsx';
import { useProjectStatus } from 'hooks/api/getters/useProjectStatus/useProjectStatus';

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

interface IProjectLifecycleFiltersProps {
    projectId: string;
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
    total?: number;
    children?: ReactNode;
}

const Wrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    minHeight: theme.spacing(7),
    gap: theme.spacing(2),
}));

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
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
    lifecycleSummary?: { [key: string]: { currentFlags: number } },
) => {
    if (!lifecycleSummary) {
        return undefined;
    }

    if (lifecycle === null) {
        return (
            (lifecycleSummary.initial?.currentFlags || 0) +
            (lifecycleSummary.preLive?.currentFlags || 0) +
            (lifecycleSummary.live?.currentFlags || 0) +
            (lifecycleSummary.completed?.currentFlags || 0)
        );
    }

    const key = lifecycle === 'pre-live' ? 'preLive' : lifecycle;
    return lifecycleSummary[key]?.currentFlags;
};

export const ProjectLifecycleFilters: FC<IProjectLifecycleFiltersProps> = ({
    projectId,
    state,
    onChange,
    total,
    children,
}) => {
    const { data } = useProjectStatus(projectId);
    const lifecycleSummary = data?.lifecycleSummary;
    const current = state.lifecycle?.values ?? [];

    return (
        <Wrapper>
            <StyledContainer>
                {lifecycleOptions.map(({ label, value }) => {
                    const isActive =
                        value === null
                            ? !state.lifecycle
                            : current.includes(value);
                    const count = getStageCount(value, lifecycleSummary);
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
                            data-loading
                            key={label}
                            label={dynamicLabel}
                            variant='outlined'
                            isActive={isActive}
                            onClick={handleClick}
                        />
                    );
                })}
            </StyledContainer>
            {children}
        </Wrapper>
    );
};
