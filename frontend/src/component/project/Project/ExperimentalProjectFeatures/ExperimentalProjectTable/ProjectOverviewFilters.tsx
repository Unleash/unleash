import { useEffect, useState, VFC } from 'react';
import { Box, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FilterDateItem } from 'component/common/FilterDateItem/FilterDateItem';
import {
    FilterItem,
    FilterItemParams,
} from 'component/filter/FilterItem/FilterItem';
import useAllTags from 'hooks/api/getters/useAllTags/useAllTags';
import AddFilterButton from 'component/filter/AddFilterButton';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(2, 3),
    gap: theme.spacing(1),
    flexWrap: 'wrap',
}));

type FeatureTogglesListFilters = {
    tag?: FilterItemParams | null | undefined;
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

export const ProjectOverviewFilters: VFC<IFeatureToggleFiltersProps> = ({
    state,
    onChange,
}) => {
    const { tags } = useAllTags();

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
        const tagsOptions = (tags || []).map((tag) => ({
            label: `${tag.type}:${tag.value}`,
            value: `${tag.type}:${tag.value}`,
        }));

        const availableFilters: IFilterItem[] = [
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
        ];

        setAvailableFilters(availableFilters);
    }, [JSON.stringify(tags)]);

    useEffect(() => {
        const fieldsMapping = [
            {
                stateField: 'tag',
                label: 'Tags',
            },
            {
                stateField: 'createdAt',
                label: 'Created date',
            },
        ];

        const newSelectedFilters = fieldsMapping
            .filter((field) =>
                Boolean(
                    state[field.stateField as keyof FeatureTogglesListFilters],
                ),
            )
            .map((field) => field.label);
        const newUnselectedFilters = fieldsMapping
            .filter(
                (field) =>
                    !state[field.stateField as keyof FeatureTogglesListFilters],
            )
            .map((field) => field.label)
            .sort();

        setSelectedFilters(
            mergeArraysKeepingOrder(selectedFilters, newSelectedFilters),
        );
        setUnselectedFilters(newUnselectedFilters);
    }, [JSON.stringify(state)]);

    const hasAvailableFilters = unselectedFilters.length > 0;
    return (
        <StyledBox>
            {selectedFilters.map((selectedFilter) => {
                if (selectedFilter === 'Created date') {
                    return (
                        <FilterDateItem
                            label={'Created date'}
                            state={state.createdAt}
                            onChange={(value) => onChange({ createdAt: value })}
                            operators={['IS_ON_OR_AFTER', 'IS_BEFORE']}
                            onChipClose={() => deselectFilter('Created date')}
                        />
                    );
                }

                const filter = availableFilters.find(
                    (filter) => filter.label === selectedFilter,
                );

                if (!filter) {
                    return null;
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
