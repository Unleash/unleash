import { useState, useEffect, type FC } from 'react';
import {
    type FilterItemParamHolder,
    Filters,
    type IFilterItem,
} from 'component/filter/Filters/Filters';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { EventSchemaType } from 'openapi';
import type { IProjectCard } from 'interfaces/project';
import { useEventCreators } from 'hooks/api/getters/useEventCreators/useEventCreators';

type EventLogFiltersProps = {
    logType: 'flag' | 'project' | 'global';
    className?: string;
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
};

export const useEventLogFilters = (
    logType: EventLogFiltersProps['logType'],
) => {
    const { projects } = useProjects();
    const { features } = useFeatureSearch({});
    const { eventCreators } = useEventCreators();

    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);
    useEffect(() => {
        const projectOptions = (projects || []).map(
            (project: IProjectCard) => ({
                label: project.name,
                value: project.id,
            }),
        );

        const hasMultipleProjects = projectOptions.length > 1;

        const flagOptions = (features || []).map((flag) => ({
            label: flag.name,
            value: flag.name,
        }));

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
                options: eventCreators.map((creator) => ({
                    label: creator.name,
                    value: creator.id.toString(),
                })),
                filterKey: 'createdBy',
                singularOperators: ['IS'],
                pluralOperators: ['IS_ANY_OF'],
            },
            {
                label: 'Event type',
                icon: 'announcement',
                options: Object.entries(EventSchemaType).map(
                    ([key, value]) => ({
                        label: key,
                        value: value,
                    }),
                ),
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

export const EventLogFilters: FC<EventLogFiltersProps> = ({
    logType,
    className,
    state,
    onChange,
}) => {
    const availableFilters = useEventLogFilters(logType);

    return (
        <Filters
            className={className}
            availableFilters={availableFilters}
            state={state}
            onChange={onChange}
        />
    );
};
