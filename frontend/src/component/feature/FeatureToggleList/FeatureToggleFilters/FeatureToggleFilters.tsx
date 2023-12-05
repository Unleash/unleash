import { useState, VFC } from 'react';
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
    projectId?: string;
    state?: string;
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
    filterKey: string;
    enabled?: boolean;
}

export const FeatureToggleFilters: VFC<IFeatureToggleFiltersProps> = ({
    state,
    onChange,
}) => {
    const { projects } = useProjects();
    const projectsOptions = (projects || []).map((project) => ({
        label: project.name,
        value: project.id,
    }));

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

    const filterItems: IFilterItem[] = [
        {
            label: 'Project',
            options: projectsOptions,
            filterKey: 'projectId',
        },
        {
            label: 'State',
            options: stateOptions,
            filterKey: 'state',
        },
    ];

    const [availableFilters, setAvailableFilters] =
        useState<IFilterItem[]>(filterItems);

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

    return (
        <StyledBox>
            {availableFilters.map(
                (filter) =>
                    filter.enabled && (
                        <FilterItem
                            key={filter.label}
                            label={filter.label}
                            options={filter.options}
                            onChange={(value) =>
                                onChange({ [filter.filterKey]: value })
                            }
                            onChipClose={(label) => removeFilter(label)}
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
