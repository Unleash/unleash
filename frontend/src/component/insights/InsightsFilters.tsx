import { type FC, useEffect, useState } from 'react';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import {
    type FilterItemParamHolder,
    Filters,
    type IFilterItem,
} from 'component/filter/Filters/Filters';

interface IFeatureToggleFiltersProps {
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
}

export const InsightsFilters: FC<IFeatureToggleFiltersProps> = ({
    state,
    onChange,
}) => {
    const { projects } = useProjects();

    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);

    useEffect(() => {
        const projectsOptions = (projects || []).map((project) => ({
            label: project.name,
            value: project.id,
        }));

        const hasMultipleProjects = projectsOptions.length > 1;

        const availableFilters: IFilterItem[] = [
            {
                label: 'Date From',
                icon: 'today',
                options: [],
                filterKey: 'from',
                dateOperators: ['IS'],
            },
            {
                label: 'Date To',
                icon: 'today',
                options: [],
                filterKey: 'to',
                dateOperators: ['IS'],
            },
            ...(hasMultipleProjects
                ? ([
                      {
                          label: 'Project',
                          icon: 'topic',
                          options: projectsOptions,
                          filterKey: 'project',
                          singularOperators: ['IS'],
                          pluralOperators: ['IS_ANY_OF'],
                      },
                  ] as IFilterItem[])
                : []),
        ];

        setAvailableFilters(availableFilters);
    }, [JSON.stringify(projects)]);

    return (
        <Filters
            availableFilters={availableFilters}
            state={state}
            onChange={onChange}
        />
    );
};
