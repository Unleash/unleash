import { useState, useEffect, type FC } from 'react';
import { Filters, type IFilterItem } from 'component/filter/Filters/Filters';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { EventSchemaType } from 'openapi';

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
        // todo fill this in with actual values
        label: 'Created by',
        icon: 'person',
        options: [],
        filterKey: 'createdBy',
        singularOperators: ['IS'],
        pluralOperators: ['IS_ANY_OF'],
    },
    {
        // todo fill this in with actual values
        label: 'Event type',
        icon: 'announcement',
        options: Object.entries(EventSchemaType).map(([key, value]) => ({
            label: key,
            value: value,
        })),
        filterKey: 'eventType',
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
    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);

    const { features } = useFeatureSearch({ project: 'default' });

    useEffect(() => {
        const flagOptions = (features || []).map((flag) => ({
            label: flag.name,
            value: flag.name,
        }));

        const availableFilters: IFilterItem[] = [
            ...flagLogFilters,
            {
                label: 'Feature Flag',
                icon: 'flag',
                options: flagOptions,
                filterKey: 'flag',
                singularOperators: ['IS'],
                pluralOperators: ['IS_ANY_OF'],
            },
        ];

        setAvailableFilters(availableFilters);
    }, [JSON.stringify(features)]);

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
    const { projects } = useProjects();

    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);
    useEffect(() => {
        const projectOptions = (projects || []).map((project) => ({
            label: project.name,
            value: project.id,
        }));

        const hasMultipleProjects = projectOptions.length > 1;

        const availableFilters: IFilterItem[] = [
            ...projectFilters,
            ...(hasMultipleProjects
                ? ([
                      {
                          label: 'Project',
                          icon: 'topic',
                          options: projectOptions,
                          filterKey: 'project',
                          singularOperators: ['IS'],
                          pluralOperators: ['IS_ANY_OF'],
                      },
                  ] as IFilterItem[])
                : []),
        ];

        setAvailableFilters(availableFilters);
    }, [JSON.stringify(projectFilters), JSON.stringify(projects)]);

    return (
        <Filters
            availableFilters={availableFilters}
            state={{}}
            onChange={(v) => console.log(v)}
        />
    );
};

type EventLogFiltersProps = {
    logType: 'flag' | 'project' | 'global';
};
export const EventLogFilters: FC<EventLogFiltersProps> = (
    { logType },
    // {state, onChange,} // these are to fill in later to make the filters work
) => {
    switch (logType) {
        case 'flag':
            return <FlagLogFilters />;
        case 'project':
            return <ProjectLogFilters />;
        case 'global':
            return <GlobalLogFilters />;
    }
};
