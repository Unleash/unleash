import { useState, useEffect, type FC } from 'react';
import {
    type FilterItemParamHolder,
    Filters,
    type IFilterItem,
} from 'component/filter/Filters/Filters';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { EventSchemaType, type FeatureSearchResponseSchema } from 'openapi';
import type { ProjectSchema } from 'openapi';
import { useEventCreators } from 'hooks/api/getters/useEventCreators/useEventCreators';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { useLocation } from 'react-router-dom';
import { FilterItemParam } from 'utils/serializeQueryParams';
import { useUiFlag } from 'hooks/useUiFlag';

export const useEventLogFilters = (
    projects: ProjectSchema[],
    features: FeatureSearchResponseSchema[],
) => {
    const { environments } = useEnvironments();
    const { eventCreators } = useEventCreators();
    const location = useLocation();
    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);
    const dateConstraintsEnabled = useUiFlag('datePickerRangeConstraints'); // TODO: delete this with flag `datePickerRangeConstraints`

    const createRemovableFilterOptions = (
        searchParams: URLSearchParams,
        paramNames: string[],
    ) => {
        return paramNames.reduce(
            (acc, paramName) => {
                const hasParam = searchParams.has(paramName);
                const paramValue = searchParams.get(paramName);

                acc[paramName] =
                    hasParam && paramValue
                        ? (() => {
                              const parsed = FilterItemParam.decode(paramValue);
                              return parsed
                                  ? [
                                        {
                                            label: parsed.values[0],
                                            value: parsed.values[0],
                                        },
                                    ]
                                  : [];
                          })()
                        : [];
                return acc;
            },
            {} as Record<string, Array<{ label: string; value: string }>>,
        );
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);

        const removableOptions = createRemovableFilterOptions(searchParams, [
            'id',
            'groupId',
        ]);

        const projectOptions =
            projects?.map((project: ProjectSchema) => ({
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

        const environmentOptions =
            environments?.map((env) => ({
                label: env.name,
                value: env.name,
            })) ?? [];

        const availableFilters: IFilterItem[] = [
            {
                label: 'Date From',
                icon: 'today',
                options: [],
                filterKey: 'from',
                dateOperators: ['IS'],
                fromFilterKey: 'from',
                toFilterKey: 'to',
                persistent: true,
                dateConstraintsEnabled,
            },
            {
                label: 'Date To',
                icon: 'today',
                options: [],
                filterKey: 'to',
                dateOperators: ['IS'],
                fromFilterKey: 'from',
                toFilterKey: 'to',
                persistent: true,
                dateConstraintsEnabled,
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
            ...(removableOptions.id.length > 0
                ? ([
                      {
                          label: 'Event ID',
                          icon: 'tag',
                          options: removableOptions.id,
                          filterKey: 'id',
                          singularOperators: ['IS'],
                          pluralOperators: ['IS_ANY_OF'],
                          persistent: false,
                      },
                  ] as IFilterItem[])
                : []),
            ...(removableOptions.groupId.length > 0
                ? ([
                      {
                          label: 'Group ID',
                          icon: 'tag',
                          options: removableOptions.groupId,
                          filterKey: 'groupId',
                          singularOperators: ['IS'],
                          pluralOperators: ['IS_ANY_OF'],
                          persistent: false,
                      },
                  ] as IFilterItem[])
                : []),
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
            ...(environmentOptions.length > 0
                ? ([
                      {
                          label: 'Environment',
                          icon: 'cloud',
                          options: environmentOptions,
                          filterKey: 'environment',
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
        JSON.stringify(environments),
        location.search,
    ]);

    return availableFilters;
};

type LogType = 'flag' | 'project' | 'global';

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
    const { features } = useFeatureSearch({});
    const { projects } = useProjects();
    const featuresToFilter = logType !== 'flag' ? features : [];
    const projectsToFilter = logType === 'global' ? projects : [];
    const availableFilters = useEventLogFilters(
        projectsToFilter,
        featuresToFilter,
    );

    return (
        <Filters
            className={className}
            availableFilters={availableFilters}
            state={state}
            onChange={onChange}
        />
    );
};
