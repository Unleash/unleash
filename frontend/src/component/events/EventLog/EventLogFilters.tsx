import { useState, useEffect } from 'react';
import { Filters, type IFilterItem } from 'component/filter/Filters/Filters';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';

const flagLogFilters: IFilterItem[] = [
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
        label: 'Created by',
        icon: 'person',
        options: [],
        filterKey: 'createdBy',
        singularOperators: ['IS'],
        pluralOperators: ['IS_ANY_OF'],
    },
];

export const FlagLogFilters = () => {
    return (
        <Filters
            availableFilters={flagLogFilters}
            state={{}}
            onChange={(v) => console.log(v)}
        />
    );
};

const useProjectLogFilters = () => {
    const { projects } = useProjects();

    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);

    useEffect(() => {
        const projectsOptions = (projects || []).map((project) => ({
            label: project.name,
            value: project.id,
        }));

        const hasMultipleProjects = projectsOptions.length > 1;

        const availableFilters: IFilterItem[] = [
            ...flagLogFilters,
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

    return availableFilters;
};

export const ProjectLogFilters = () => {
    const availableFilters = useProjectLogFilters();

    return (
        <Filters
            availableFilters={availableFilters}
            state={{}}
            onChange={(v) => console.log(v)}
        />
    );
};

export const GlobalLogFilters = () => {
    const projectFilters = useProjectLogFilters();
    const { features } = useFeatureSearch({});

    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);
    useEffect(() => {
        const flagOptions = (features || []).map((flag) => ({
            label: flag.name,
            value: flag.name,
        }));

        const hasMultipleFlags = flagOptions.length > 1;

        const availableFilters: IFilterItem[] = [
            ...projectFilters,
            ...(hasMultipleFlags
                ? ([
                      {
                          label: 'Feature Flag',
                          icon: 'flag',
                          options: flagOptions,
                          filterKey: 'flag',
                          singularOperators: ['IS'],
                          pluralOperators: ['IS_ANY_OF'],
                      },
                  ] as IFilterItem[])
                : []),
        ];

        setAvailableFilters(availableFilters);
    }, [JSON.stringify(projectFilters), JSON.stringify(features)]);
    return (
        <Filters
            availableFilters={availableFilters}
            state={{}}
            onChange={(v) => console.log(v)}
        />
    );
};

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
