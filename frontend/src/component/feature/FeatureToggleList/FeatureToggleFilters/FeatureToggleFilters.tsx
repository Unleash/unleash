import { useEffect, useState, VFC } from 'react';
import { Box, styled } from '@mui/material';
import { FilterItem } from 'component/common/FilterItem/FilterItem';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AddFilterButton from './AddFilterButton';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(2, 3),
    gap: theme.spacing(1),
}));

export type FeatureTogglesListFilters = {
    project?: FilterItem | null | undefined;
    state?: FilterItem | null | undefined;
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
        ];

        setAvailableFilters(newFilterItems);
    }, [JSON.stringify(projects), JSON.stringify(state)]);

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
