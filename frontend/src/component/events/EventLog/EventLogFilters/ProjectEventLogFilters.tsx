import type { FC } from 'react';
import { Filters } from 'component/filter/Filters/Filters';
import {
    type EventLogFiltersProps,
    useEventLogFilters,
} from './event-log-filter-shared';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';

export const ProjectEventLogFilters: FC<EventLogFiltersProps> = ({
    className,
    state,
    onChange,
}) => {
    const { features } = useFeatureSearch({});

    const availableFilters = useEventLogFilters({
        flagOptions:
            features?.map((flag) => ({
                label: flag.name,
                value: flag.name,
            })) ?? [],
        projectOptions: [],
    });

    return (
        <Filters
            className={className}
            availableFilters={availableFilters}
            state={state}
            onChange={onChange}
        />
    );
};
