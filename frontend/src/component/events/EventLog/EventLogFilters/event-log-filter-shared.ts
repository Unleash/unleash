import { useState, useEffect } from 'react';
import type {
    FilterItemParamHolder,
    IFilterItem,
} from 'component/filter/Filters/Filters';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { EventSchemaType } from 'openapi';
import type { IProjectCard } from 'interfaces/project';
import { useEventCreators } from 'hooks/api/getters/useEventCreators/useEventCreators';

export type EventLogFiltersProps = {
    className?: string;
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
};

type UseEventLogFiltersProps = {
    projectOptions: { label: string; value: string }[];
    flagOptions: { label: string; value: string }[];
};

export const useEventLogFilters = ({
    projectOptions,
    flagOptions,
}: UseEventLogFiltersProps) => {
    const { eventCreators } = useEventCreators();

    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);
    useEffect(() => {
        const eventCreatorOptions = eventCreators.map((creator) => ({
            label: creator.name,
            value: creator.id.toString(),
        }));

        const eventTypeOptions = Object.entries(EventSchemaType).map(
            ([key, value]) => ({
                label: key,
                value: value,
            }),
        );

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
                label: 'Created by',
                icon: 'person',
                options: eventCreatorOptions,
                filterKey: 'createdBy',
                singularOperators: ['IS'],
                pluralOperators: ['IS_ANY_OF'],
            },
            {
                label: 'Event type',
                icon: 'announcement',
                options: eventTypeOptions,
                filterKey: 'type',
                singularOperators: ['IS'],
                pluralOperators: ['IS_ANY_OF'],
            },
            ...(projectOptions.length > 1
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
            ...(flagOptions.length > 0
                ? ([
                      {
                          label: 'Feature Flag',
                          icon: 'flag',
                          options: flagOptions,
                          filterKey: 'feature',
                          singularOperators: ['IS'],
                          pluralOperators: ['IS_ANY_OF'],
                      },
                  ] as IFilterItem[])
                : []),
        ];

        setAvailableFilters(availableFilters);
    }, [
        JSON.stringify(flagOptions),
        JSON.stringify(projectOptions),
        JSON.stringify(eventCreators),
    ]);

    return availableFilters;
};

export const useEventLogFilters = (
    logType: EventLogFiltersProps['logType'],
) => {
    const { projects } = useProjects();
    const { features } = useFeatureSearch({});
    const { eventCreators } = useEventCreators();

    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);
    useEffect(() => {
        const projectOptions =
            projects.map((project: IProjectCard) => ({
                label: project.name,
                value: project.id,
            })) ?? [];

        const hasMultipleProjects = projectOptions.length > 1;

        const flagOptions =
            features?.map((flag) => ({
                label: flag.name,
                value: flag.name,
            })) ?? [];

        const eventCreatorOptions = eventCreators.map((creator) => ({
            label: creator.name,
            value: creator.id.toString(),
        }));

        const eventTypeOptions = Object.entries(EventSchemaType).map(
            ([key, value]) => ({
                label: key,
                value: value,
            }),
        );

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
                label: 'Created by',
                icon: 'person',
                options: eventCreatorOptions,
                filterKey: 'createdBy',
                singularOperators: ['IS'],
                pluralOperators: ['IS_ANY_OF'],
            },
            {
                label: 'Event type',
                icon: 'announcement',
                options: eventTypeOptions,
                filterKey: 'type',
                singularOperators: ['IS'],
                pluralOperators: ['IS_ANY_OF'],
            },
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
                          filterKey: 'feature',
                          singularOperators: ['IS'],
                          pluralOperators: ['IS_ANY_OF'],
                      },
                  ] as IFilterItem[])
                : []),
        ];

        setAvailableFilters(availableFilters);
    }, [
        JSON.stringify(features),
        JSON.stringify(projects),
        JSON.stringify(eventCreators),
    ]);

    return availableFilters;
};
