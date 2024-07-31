import { useState, useEffect } from 'react';
import { Filters, type IFilterItem } from 'component/filter/Filters/Filters';
import useProjects from 'hooks/api/getters/useProjects/useProjects';

export const EventLogFilters = (
    // {state, onChange,}
) => {
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
            {
                label: 'Feature Flag',
                icon: 'flag',
                options: [],
                filterKey: 'flag',
                singularOperators: ['IS'],
                pluralOperators: ['IS_ANY_OF'],
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
            {
                label: 'Created by',
                icon: 'person',
                options: [],
                filterKey: 'createdBy',
                singularOperators: ['IS'],
                pluralOperators: ['IS_ANY_OF'],
            },
        ];

        setAvailableFilters(availableFilters);
    }, [JSON.stringify(projects)]);

    return (
        <Filters
            availableFilters={availableFilters}
            state={{}}
            onChange={(v) => console.log(v)}
        />
    );
};
