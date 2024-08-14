import { useState, useEffect, type FC } from 'react';
import {
    type FilterItemParamHolder,
    Filters,
    type IFilterItem,
} from 'component/filter/Filters/Filters';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import {
    EventSchemaType,
    type FeatureSearchResponseSchema,
    type SearchFeaturesParams,
} from 'openapi';
import type { IProjectCard } from 'interfaces/project';
import { useEventCreators } from 'hooks/api/getters/useEventCreators/useEventCreators';

export const useEventLogFilters = (
    projectsHook: () => { projects: IProjectCard[] },
    featuresHook: (params: SearchFeaturesParams) => {
        features: FeatureSearchResponseSchema[];
    },
) => {
    const { projects } = projectsHook();
    const { features } = featuresHook({});
    const { eventCreators } = useEventCreators();

    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);
    useEffect(() => {
        const projectOptions =
            projects?.map((project: IProjectCard) => ({
                label: project.name,
                value: project.id,
            })) ?? [];

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
        JSON.stringify(features),
        JSON.stringify(projects),
        JSON.stringify(eventCreators),
    ]);

    return availableFilters;
};

type LogType = 'flag' | 'project' | 'global';
const useEventLogFiltersFromLogType = (logType: LogType) => {
    switch (logType) {
        case 'flag':
            return useEventLogFilters(
                () => ({ projects: [] }),
                () => ({ features: [] }),
            );
        case 'project':
            return useEventLogFilters(
                () => ({ projects: [] }),
                useFeatureSearch,
            );
        case 'global':
            return useEventLogFilters(useProjects, useFeatureSearch);
    }
};

type EventLogFiltersProps = {
    logType: LogType;
    className?: string;
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
};

export const EventLogFilters: FC<EventLogFiltersProps> = ({
    logType,
    className,
    state,
    onChange,
}) => {
    const availableFilters = useEventLogFiltersFromLogType(logType);

    return (
        <Filters
            className={className}
            availableFilters={availableFilters}
            state={state}
            onChange={onChange}
        />
    );
};
