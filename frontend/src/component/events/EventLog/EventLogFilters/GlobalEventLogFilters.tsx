import type { FC } from 'react';
import { Filters } from 'component/filter/Filters/Filters';
import {
    type EventLogFiltersProps,
    useEventLogFilters,
} from './event-log-filter-shared';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import useProjects from 'hooks/api/getters/useProjects/useProjects';

export const GlobalEventLogFilters: FC<EventLogFiltersProps> = ({
    className,
    state,
    onChange,
}) => {
    const { features } = useFeatureSearch({});
    const { projects } = useProjects();

    const availableFilters = useEventLogFilters({
        flagOptions:
            features?.map((flag) => ({
                label: flag.name,
                value: flag.name,
            })) ?? [],
        projectOptions:
            projects?.map((project) => ({
                label: project.name,
                value: project.id,
            })) ?? [],
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
