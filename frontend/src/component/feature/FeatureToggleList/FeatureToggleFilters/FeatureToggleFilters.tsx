import { useEffect, useState, VFC } from 'react';
import { Box, styled } from '@mui/material';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AddFilterButton from './AddFilterButton/AddFilterButton';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { FilterDateItem } from 'component/common/FilterDateItem/FilterDateItem';
import {
    FilterItem,
    FilterItemParams,
} from 'component/common/FilterItem/FilterItem';
import useAllTags from 'hooks/api/getters/useAllTags/useAllTags';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(2, 3),
    gap: theme.spacing(1),
    flexWrap: 'wrap',
}));

type FeatureTogglesListFilters = {
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

type IBaseFilterItem = {
    label: string;
    options: {
        label: string;
        value: string;
    }[];
    filterKey: keyof FeatureTogglesListFilters;
};

type ITextFilterItem = IBaseFilterItem & {
    singularOperators: [string, ...string[]];
    pluralOperators: [string, ...string[]];
};

type IDateFilterItem = IBaseFilterItem & {
    dateOperators: [string, ...string[]];
};

type IFilterItem = ITextFilterItem | IDateFilterItem;

export const FeatureToggleFilters: VFC<IFeatureToggleFiltersProps> = ({
    state,
    onChange,
}) => {
    const { projects } = useProjects();
    const { segments } = useSegments();
    const { tags } = useAllTags();

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
    const [unselectedFilters, setUnselectedFilters] = useState<string[]>([]);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    const deselectFilter = (label: string) => {
        const newSelectedFilters = selectedFilters.filter((f) => f !== label);
        const newUnselectedFilters = [...unselectedFilters, label].sort();

        setSelectedFilters(newSelectedFilters);
        setUnselectedFilters(newUnselectedFilters);
    };

    const mergeArraysKeepingOrder = (
        firstArray: string[],
        secondArray: string[],
    ): string[] => {
        const elementsSet = new Set(firstArray);

        secondArray.forEach((element) => {
            if (!elementsSet.has(element)) {
                firstArray.push(element);
            }
        });

        return firstArray;
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

        const hasMultipleProjects = projectsOptions.length > 1;

        const availableFilters: IFilterItem[] = [
            {
                label: 'State',
                options: stateOptions,
                filterKey: 'state',
                singularOperators: ['IS', 'IS_NOT'],
                pluralOperators: ['IS_ANY_OF', 'IS_NONE_OF'],
            },
            ...(hasMultipleProjects
                ? ([
                      {
                          label: 'Project',
                          options: projectsOptions,
                          filterKey: 'project',
                          singularOperators: ['IS', 'IS_NOT'],
                          pluralOperators: ['IS_ANY_OF', 'IS_NONE_OF'],
                      },
                  ] as IFilterItem[])
                : []),
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
                    'INCLUDE_ANY_OF',
                    'INCLUDE_ALL_OF',
                    'EXCLUDE_IF_ANY_OF',
                    'EXCLUDE_ALL',
                ],
            },
            {
                label: 'Created date',
                options: [],
                filterKey: 'createdAt',
                dateOperators: ['IS_ON_OR_AFTER', 'IS_BEFORE'],
            },
        ];

        setAvailableFilters(availableFilters);
    }, [
        JSON.stringify(projects),
        JSON.stringify(segments),
        JSON.stringify(tags),
    ]);

    useEffect(() => {
        const newSelectedFilters = availableFilters
            .filter((field) =>
                Boolean(
                    state[field.filterKey as keyof FeatureTogglesListFilters],
                ),
            )
            .map((field) => field.label);
        const newUnselectedFilters = availableFilters
            .filter(
                (field) =>
                    !state[field.filterKey as keyof FeatureTogglesListFilters],
            )
            .map((field) => field.label)
            .sort();

        setSelectedFilters(
            mergeArraysKeepingOrder(selectedFilters, newSelectedFilters),
        );
        setUnselectedFilters(newUnselectedFilters);
    }, [JSON.stringify(state), JSON.stringify(availableFilters)]);

    const hasAvailableFilters = unselectedFilters.length > 0;
    return (
        <StyledBox>
            {selectedFilters.map((selectedFilter) => {
                const filter = availableFilters.find(
                    (filter) => filter.label === selectedFilter,
                );

                if (!filter) {
                    return null;
                }

                if ('dateOperators' in filter) {
                    return (
                        <FilterDateItem
                            label={filter.label}
                            state={state[filter.filterKey]}
                            onChange={(value) =>
                                onChange({ [filter.filterKey]: value })
                            }
                            operators={filter.dateOperators}
                            onChipClose={() => deselectFilter(filter.label)}
                        />
                    );
                }

                return (
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
                        onChipClose={() => deselectFilter(filter.label)}
                    />
                );
            })}

            <ConditionallyRender
                condition={hasAvailableFilters}
                show={
                    <AddFilterButton
                        visibleOptions={unselectedFilters}
                        setVisibleOptions={setUnselectedFilters}
                        hiddenOptions={selectedFilters}
                        setHiddenOptions={setSelectedFilters}
                    />
                }
            />
        </StyledBox>
    );
};
