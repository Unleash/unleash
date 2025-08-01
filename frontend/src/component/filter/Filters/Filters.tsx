import { type FC, useEffect, useMemo, useState } from 'react';
import { Box, Icon, styled } from '@mui/material';
import { AddFilterButton } from '../AddFilterButton.tsx';
import { FilterDateItem } from 'component/common/FilterDateItem/FilterDateItem';
import {
    FilterItem,
    type FilterItemParams,
} from '../FilterItem/FilterItem.tsx';

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
    persistent?: boolean;
};

type ITextFilterItem = IBaseFilterItem & {
    singularOperators: [string, ...string[]];
    pluralOperators: [string, ...string[]];
};

export type IDateFilterItem = IBaseFilterItem & {
    dateOperators: [string, ...string[]];
    fromFilterKey?: string;
    toFilterKey?: string;
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

type RangeChangeHandler = (filter: IDateFilterItem) =>
    | ((value: {
          from: FilterItemParams;
          to: FilterItemParams;
      }) => void)
    | undefined;

type RenderFilterProps = {
    onChipClose?: (label: string) => void;
    state: FilterItemParams | null | undefined;
    onChange: (value: FilterItemParamHolder) => void;
    filter: ITextFilterItem | IDateFilterItem;
    rangeChangeHandler: RangeChangeHandler;
    initMode?: 'auto-open' | 'manual';
};

const RenderFilter: FC<RenderFilterProps> = ({
    filter,
    onChipClose,
    onChange,
    state,
    rangeChangeHandler,
    initMode,
}) => {
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
                initMode={initMode}
                label={label}
                name={filter.label}
                state={state}
                onChange={(value) => {
                    onChange({ [filter.filterKey]: value });
                }}
                onRangeChange={rangeChangeHandler?.(filter)}
                operators={filter.dateOperators}
                onChipClose={
                    filter.persistent
                        ? undefined
                        : () => onChipClose?.(filter.label)
                }
            />
        );
    }

    return (
        <FilterItem
            initMode={initMode}
            key={filter.label}
            label={label}
            name={filter.label}
            state={state}
            options={filter.options}
            onChange={(value) => onChange({ [filter.filterKey]: value })}
            singularOperators={filter.singularOperators}
            pluralOperators={filter.pluralOperators}
            onChipClose={
                filter.persistent
                    ? undefined
                    : () => onChipClose?.(filter.label)
            }
        />
    );
};

type SingleFilterProps = Omit<IFilterProps, 'availableFilters'> & {
    filter: IFilterItem;
    rangeChangeHandler: RangeChangeHandler;
};

const SingleFilter: FC<SingleFilterProps> = ({
    state,
    onChange,
    className,
    filter,
    rangeChangeHandler,
}) => {
    return (
        <StyledBox className={className}>
            <RenderFilter
                filter={filter}
                state={state[filter.filterKey]}
                onChange={onChange}
                rangeChangeHandler={rangeChangeHandler}
                onChipClose={undefined}
                initMode='manual'
            />
        </StyledBox>
    );
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

type MultiFilterProps = IFilterProps & {
    rangeChangeHandler: RangeChangeHandler;
};

const MultiFilter: FC<MultiFilterProps> = ({
    state,
    onChange,
    availableFilters,
    rangeChangeHandler,
    className,
}) => {
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    const deselectFilter = (label: string) => {
        const newSelectedFilters = selectedFilters.filter((f) => f !== label);

        setSelectedFilters(newSelectedFilters);
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
    }, [JSON.stringify(state), JSON.stringify(availableFilters)]);

    const unselectedFilters = useMemo(
        () =>
            availableFilters
                .filter((item) => !selectedFilters.includes(item.label))
                .map((field) => field.label)
                .sort(),
        [availableFilters, selectedFilters],
    );

    return (
        <StyledBox className={className}>
            {selectedFilters.map((selectedFilter) => {
                const filter = availableFilters.find(
                    (filter) => filter.label === selectedFilter,
                );

                if (!filter) {
                    return null;
                }

                return (
                    <RenderFilter
                        key={filter.filterKey}
                        filter={filter}
                        state={state[filter.filterKey]}
                        onChange={onChange}
                        rangeChangeHandler={rangeChangeHandler}
                        onChipClose={() => deselectFilter(filter.label)}
                    />
                );
            })}
            {unselectedFilters.length > 0 ? (
                <AddFilterButton
                    availableFilters={availableFilters}
                    visibleOptions={unselectedFilters}
                    hiddenOptions={selectedFilters}
                    onSelectedOptionsChange={setSelectedFilters}
                />
            ) : null}
        </StyledBox>
    );
};

export const Filters: FC<IFilterProps> = (props) => {
    const rangeChangeHandler = (filter: IDateFilterItem) => {
        const fromKey = filter.fromFilterKey;
        const toKey = filter.toFilterKey;
        if (fromKey && toKey) {
            return (value: {
                from: FilterItemParams;
                to: FilterItemParams;
            }) => {
                props.onChange({ [fromKey]: value.from });
                props.onChange({ [toKey]: value.to });
            };
        }
        return undefined;
    };

    if (props.availableFilters.length === 1) {
        const filter = props.availableFilters[0];
        return (
            <SingleFilter
                rangeChangeHandler={rangeChangeHandler}
                filter={filter}
                {...props}
            />
        );
    }

    return <MultiFilter rangeChangeHandler={rangeChangeHandler} {...props} />;
};
