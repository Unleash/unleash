import { useEffect, useState, VFC } from 'react';
import { Box, styled } from '@mui/material';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AddFilterButton from './AddFilterButton';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { FilterDateItem } from 'component/common/FilterDateItem/FilterDateItem';
import {
    FilterItem,
    FilterItemParams,
} from 'component/common/FilterItem/FilterItem';
import useTags from 'hooks/api/getters/useTags/useTags';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(2, 3),
    gap: theme.spacing(1),
}));

export type FeatureTogglesListFilters = {
    project?: FilterItemParams | null | undefined;
    tag?: FilterItemParams | null | undefined;
    state?: FilterItemParams | null | undefined;
    segment?: FilterItemParams | null | undefined;
    createdAt?: FilterItemParams | null | undefined;
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
    const { tags } = useTags('.');

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
        const tagsOptions = (tags || []).map((tag) => ({
            label: `${tag.type}:${tag.value}`,
            value: `${tag.type}:${tag.value}`,
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
                label: 'Tags',
                options: tagsOptions,
                filterKey: 'tag',
                singularOperators: ['INCLUDE', 'DO_NOT_INCLUDE'],
                pluralOperators: [
                    'INCLUDE_ALL_OF',
                    'INCLUDE_ANY_OF',
                    'EXCLUDE_IF_ANY_OF',
                    'EXCLUDE_ALL',
                ],
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
    }, [
        JSON.stringify(projects),
        JSON.stringify(segments),
        JSON.stringify(tags),
    ]);

    useEffect(() => {
        const filterVisibility: IFilterVisibility = {
            State: Boolean(state.state),
            Project: Boolean(state.project),
            Tags: Boolean(state.tag),
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
            <ConditionallyRender
                condition={Boolean(visibleFilters['Created date'])}
                show={
                    <FilterDateItem
                        label={'Created date'}
                        state={state.createdAt}
                        onChange={(value) => onChange({ createdAt: value })}
                        operators={['IS_ON_OR_AFTER', 'IS_BEFORE']}
                        onChipClose={() => hideFilter('Created date')}
                    />
                }
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
