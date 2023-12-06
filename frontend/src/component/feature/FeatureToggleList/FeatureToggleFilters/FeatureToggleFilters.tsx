import { useEffect, useState, VFC } from 'react';
import { Box, styled } from '@mui/material';
import { FilterItem } from 'component/common/FilterItem/FilterItem';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AddFilterButton from './AddFilterButton';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(2, 3),
    gap: theme.spacing(1),
}));

export type FeatureTogglesListFilters = {
    project?: FilterItem | null | undefined;
    state?: FilterItem | null | undefined;
    segment?: FilterItem | null | undefined;
};

interface IFeatureToggleFiltersProps {
    state: FeatureTogglesListFilters;
    onChange: (value: FeatureTogglesListFilters) => void;
}

export interface IFilterItem {
    label: string;
    options: {
        label: string;
        value: string;
    }[];
    filterKey: keyof FeatureTogglesListFilters;
    enabled?: boolean;
}

export const FeatureToggleFilters: VFC<IFeatureToggleFiltersProps> = ({
    state,
    onChange,
}) => {
    const { projects } = useProjects();
    const { segments } = useSegments();

    const stateOptions = [
        {
            label: 'Active',
            value: 'active',
        },
        {
            label: 'Stale',
            value: 'stale',
        },
    ];

    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);
    const removeFilter = (label: string) => {
        const filters = availableFilters.map((filter) =>
            filter.label === label
                ? {
                      ...filter,
                      enabled: false,
                  }
                : filter,
        );
        setAvailableFilters(filters);
    };

    useEffect(() => {
        const projectsOptions = (projects || []).map((project) => ({
            label: project.name,
            value: project.id,
        }));
        const segmentsOptions = (segments || []).map((segment) => ({
            label: segment.name,
            value: segment.name,
        }));

        const newFilterItems: IFilterItem[] = [
            {
                label: 'State',
                options: stateOptions,
                filterKey: 'state',
                enabled: Boolean(state.state),
            },
            {
                label: 'Project',
                options: projectsOptions,
                filterKey: 'project',
                enabled: Boolean(state.project),
            } as const,
            {
                label: 'Segment',
                options: segmentsOptions,
                filterKey: 'segment',
            } as const,
        ];

        setAvailableFilters(newFilterItems);
    }, [JSON.stringify(projects), JSON.stringify(state), JSON.stringify(segments)]);

    return (
        <StyledBox>
            {availableFilters.map(
                (filter) =>
                    filter.enabled && (
                        <FilterItem
                            key={filter.label}
                            label={filter.label}
                            state={state[filter.filterKey]}
                            options={filter.options}
                            onChange={(value) =>
                                onChange({ [filter.filterKey]: value })
                            }
                            singularOperators={['IS', 'IS_NOT']}
                            pluralOperators={['IS_ANY_OF', 'IS_NOT_ANY_OF']}
                            onChipClose={() => removeFilter(filter.label)}
                        />
                    ),
            )}
            <ConditionallyRender
                condition={availableFilters.some((filter) => !filter.enabled)}
                show={
                    <AddFilterButton
                        availableFilters={availableFilters}
                        setAvailableFilters={setAvailableFilters}
                    />
                }
            />
        </StyledBox>
    );
};
