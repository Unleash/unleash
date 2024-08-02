import { useState, useEffect, type FC } from 'react';
import { Filters, type IFilterItem } from 'component/filter/Filters/Filters';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { EventSchemaType } from 'openapi';

export type EventUser = {
    id: number;
    name: string;
};

const sharedFilters = (users: EventUser[]): IFilterItem[] => [
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
        options: users.map((user) => ({
            label: user.name,
            value: user.id.toString(),
        })),
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

type EventLogFiltersProps = {
    logType: 'flag' | 'project' | 'global';
    className?: string;
    users: EventUser[];
};
export const EventLogFilters: FC<EventLogFiltersProps> = (
    { logType, users },
    // {state, onChange,} // these are to fill in later to make the filters work
) => {
    console.log('got users', users);
    const baseFilters = sharedFilters(users);
    const { projects } = useProjects();
    const { features } = useFeatureSearch({ project: 'default' });

    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);
    useEffect(() => {
        const projectOptions = (projects || []).map((project) => ({
            label: project.name,
            value: project.id,
        }));

        const hasMultipleProjects = projectOptions.length > 1;

        const flagOptions = (features || []).map((flag) => ({
            label: flag.name,
            value: flag.name,
        }));

        const availableFilters: IFilterItem[] = [
            ...baseFilters,
            ...(hasMultipleProjects && logType === 'global'
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
            ...(logType !== 'flag'
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
    }, [JSON.stringify(features), JSON.stringify(projects)]);

    return (
        <Filters
            className={className}
            availableFilters={availableFilters}
            state={{}}
            onChange={(v) => console.log(v)}
        />
    );
};
