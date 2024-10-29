import { type FC, useEffect, useState } from 'react';
import { Box, Icon, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { AddFilterButton } from '../AddFilterButton';
import { FilterDateItem } from 'component/common/FilterDateItem/FilterDateItem';
import { FilterItem, type FilterItemParams } from '../FilterItem/FilterItem';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(1.5, 3),
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
    className?: string;
}

type IBaseFilterItem = {
    label: string;
    icon: string;
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

const StyledCategoryIconWrapper = styled('div')(({ theme }) => ({
    marginRight: theme.spacing(0.5),
    display: 'flex',
    alignItems: 'center',
    fontSize: theme.spacing(2),
}));

const StyledIcon = styled(Icon)(({ theme }) => ({
    '&.material-symbols-outlined': {
        fontSize: theme.spacing(2),
    },
}));

export const Filters: FC<IFilterProps> = ({
    state,
    onChange,
    availableFilters,
    className,
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
        const resultArray: string[] = [...firstArray];
        const elementsSet = new Set(firstArray);

        secondArray.forEach((element) => {
            if (!elementsSet.has(element)) {
                resultArray.push(element);
            }
        });

        return resultArray;
    };

    useEffect(() => {
        const newSelectedFilters = Object.keys(state)
            .map((filterKey) =>
                availableFilters.find(
                    (filter) => filterKey === filter.filterKey,
                ),
            )
            .filter((filter): filter is IFilterItem => Boolean(filter))
            .filter((field) => Boolean(state[field.filterKey]))
            .map((filter) => filter.label);

        const allSelectedFilters = mergeArraysKeepingOrder(
            selectedFilters,
            newSelectedFilters,
        );
        setSelectedFilters(allSelectedFilters);

        const newUnselectedFilters = availableFilters
            .filter((item) => !allSelectedFilters.includes(item.label))
            .map((field) => field.label)
            .sort();
        setUnselectedFilters(newUnselectedFilters);
    }, [JSON.stringify(state), JSON.stringify(availableFilters)]);

    const hasAvailableFilters = unselectedFilters.length > 0;
    return (
        <StyledBox className={className}>
            {selectedFilters.map((selectedFilter) => {
                const filter = availableFilters.find(
                    (filter) => filter.label === selectedFilter,
                );

                if (!filter) {
                    return null;
                }

                const label = (
                    <>
                        <StyledCategoryIconWrapper>
                            <StyledIcon>{filter.icon}</StyledIcon>
                        </StyledCategoryIconWrapper>
                        {filter.label}
                    </>
                );

                if ('dateOperators' in filter) {
                    return (
                        <FilterDateItem
                            key={filter.label}
                            label={label}
                            name={filter.label}
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
                        label={label}
                        name={filter.label}
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
                        availableFilters={availableFilters}
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
