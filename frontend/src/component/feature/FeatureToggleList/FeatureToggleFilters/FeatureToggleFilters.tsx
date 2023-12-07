import { useEffect, useState, VFC } from 'react';
import { Box, styled } from '@mui/material';
import { FilterItem } from 'component/common/FilterItem/FilterItem';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AddFilterButton from './AddFilterButton';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { FilterDateItem } from '../../../common/FilterItem/FilterDateItem';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(2, 3),
    gap: theme.spacing(1),
}));

export type FeatureTogglesListFilters = {
    project?: FilterItem | null | undefined;
    state?: FilterItem | null | undefined;
    segment?: FilterItem | null | undefined;
    createdAt?: FilterItem | null | undefined;
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
    singularOperators: [string, ...string[]];
    pluralOperators: [string, ...string[]];
}

export type IFilterVisibility = {
    [key: string]: boolean | undefined;
};

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
    const [visibleFilters, setVisibleFilters] = useState<IFilterVisibility>({});

    const hideFilter = (label: string) => {
        const filterVisibility = {
            ...visibleFilters,
            [label]: false,
        };
        setVisibleFilters(filterVisibility);
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

        const availableFilters: IFilterItem[] = [
            {
                label: 'State',
                options: stateOptions,
                filterKey: 'state',
                singularOperators: ['IS', 'IS_NOT'],
                pluralOperators: ['IS_ANY_OF', 'IS_NONE_OF'],
            },
            {
                label: 'Project',
                options: projectsOptions,
                filterKey: 'project',
                singularOperators: ['IS', 'IS_NOT'],
                pluralOperators: ['IS_ANY_OF', 'IS_NONE_OF'],
            },
            {
                label: 'Segment',
                options: segmentsOptions,
                filterKey: 'segment',
                singularOperators: ['INCLUDE', 'DO_NOT_INCLUDE'],
                pluralOperators: [
                    'INCLUDE_ALL_OF',
                    'INCLUDE_ANY_OF',
                    'EXCLUDE_IF_ANY_OF',
                    'EXCLUDE_ALL',
                ],
            },
        ];

        setAvailableFilters(availableFilters);
    }, [JSON.stringify(projects), JSON.stringify(segments)]);

    useEffect(() => {
        const filterVisibility: IFilterVisibility = {
            State: Boolean(state.state),
            Project: Boolean(state.project),
            Segment: Boolean(state.segment),
            'Created date': Boolean(state.createdAt),
        };
        setVisibleFilters(filterVisibility);
    }, [JSON.stringify(state)]);

    const hasAvailableFilters = Object.values(visibleFilters).some(
        (value) => !value,
    );

    return (
        <StyledBox>
            {availableFilters.map(
                (filter) =>
                    visibleFilters[filter.label] && (
                        <FilterItem
                            key={filter.label}
                            label={filter.label}
                            state={state[filter.filterKey]}
                            options={filter.options}
                            onChange={(value) =>
                                onChange({ [filter.filterKey]: value })
                            }
                            singularOperators={filter.singularOperators}
                            pluralOperators={filter.pluralOperators}
                            onChipClose={() => hideFilter(filter.label)}
                        />
                    ),
            )}
            <ConditionallyRender condition={Boolean(visibleFilters['Created date'])} show={
                <FilterDateItem
                    label={'Created date'}
                    state={state.createdAt}
                    onChange={(value) => onChange({ createdAt: value })}
                    operators={['IS_ON_OR_AFTER', 'IS_BEFORE']}
                    onChipClose={() => hideFilter('Created date')}
            />}
            />

            <ConditionallyRender
                condition={hasAvailableFilters}
                show={
                    <AddFilterButton
                        visibleFilters={visibleFilters}
                        setVisibleFilters={setVisibleFilters}
                    />
                }
            />
        </StyledBox>
    );
};
