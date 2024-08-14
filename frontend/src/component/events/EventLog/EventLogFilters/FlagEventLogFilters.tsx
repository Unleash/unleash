import type { FC } from 'react';
import { Filters } from 'component/filter/Filters/Filters';
import {
    type EventLogFiltersProps,
    useEventLogFilters,
} from './event-log-filter-shared';

export const FlagEventLogFilters: FC<EventLogFiltersProps> = ({
    className,
    state,
    onChange,
}) => {
    const availableFilters = useEventLogFilters({
        flagOptions: [],
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
