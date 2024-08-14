import { useState, useEffect } from 'react';
import type {
    FilterItemParamHolder,
    IFilterItem,
} from 'component/filter/Filters/Filters';
import { EventSchemaType } from 'openapi';
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
