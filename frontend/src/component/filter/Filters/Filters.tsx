import { useEffect, useState, VFC } from 'react';
import { Box, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AddFilterButton from '../AddFilterButton';
import { FilterDateItem } from 'component/common/FilterDateItem/FilterDateItem';
import { FilterItem, FilterItemParams } from '../FilterItem/FilterItem';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(2, 3),
    gap: theme.spacing(1),
    flexWrap: 'wrap',
}));

export type FilterItemParamHolder = Record<
    string,
    FilterItemParams | null | undefined
>;

interface IFilterProps {
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
    availableFilters: IFilterItem[];
}

type IBaseFilterItem = {
    label: string;
    options: {
        label: string;
        value: string;
    }[];
    filterKey: string;
};

type ITextFilterItem = IBaseFilterItem & {
    singularOperators: [string, ...string[]];
    pluralOperators: [string, ...string[]];
};

type IDateFilterItem = IBaseFilterItem & {
    dateOperators: [string, ...string[]];
};

export type IFilterItem = ITextFilterItem | IDateFilterItem;

export const Filters: VFC<IFilterProps> = ({
    state,
    onChange,
    availableFilters,
}) => {
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
        const newSelectedFilters = availableFilters
            .filter((field) => Boolean(state[field.filterKey]))
            .map((field) => field.label);
        const newUnselectedFilters = availableFilters
            .filter((field) => !state[field.filterKey])
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
