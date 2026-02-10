import { type FC, useEffect, useState } from 'react';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import {
    type FilterItemParamHolder,
    Filters,
    type IDateFilterItem,
    type IFilterItem,
} from 'component/filter/Filters/Filters';
import { styled } from '@mui/material';

interface IFeatureToggleFiltersProps {
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
    className?: string;
    filterNamePrefix?: string;
}

const FiltersNoPadding = styled(Filters)({
    padding: 0,
});

export const InsightsFilters: FC<IFeatureToggleFiltersProps> = ({
    filterNamePrefix,
    state,
    ...filterProps
}) => {
    const { projects } = useProjects();

    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);

    useEffect(() => {
        const projectsOptions = (projects || []).map((project) => ({
            label: project.name,
            value: project.id,
        }));

        const hasMultipleProjects = projectsOptions.length > 1;

        const prefix = filterNamePrefix ?? '';

        const availableFilters: IFilterItem[] = [
            {
                label: 'Date From',
                icon: 'today',
                options: [],
                filterKey: `${prefix}from`,
                dateOperators: ['IS'],
                fromFilterKey: `${prefix}from`,
                toFilterKey: `${prefix}to`,
                persistent: true,
            } as IDateFilterItem,
            {
                label: 'Date To',
                icon: 'today',
                options: [],
                filterKey: `${prefix}to`,
                dateOperators: ['IS'],
                fromFilterKey: `${prefix}from`,
                toFilterKey: `${prefix}to`,
                persistent: true,
            } as IDateFilterItem,
            ...(hasMultipleProjects
                ? ([
                      {
                          label: 'Project',
                          icon: 'topic',
                          options: projectsOptions,
                          filterKey: `${prefix}project`,
                          singularOperators: ['IS'],
                          pluralOperators: ['IS_ANY_OF'],
                      },
                  ] as IFilterItem[])
                : []),
        ].filter(({ filterKey }) => filterKey in state);

        setAvailableFilters(availableFilters);
    }, [JSON.stringify(projects)]);

    return (
        <FiltersNoPadding
            {...filterProps}
            state={state}
            availableFilters={availableFilters}
        />
    );
};
