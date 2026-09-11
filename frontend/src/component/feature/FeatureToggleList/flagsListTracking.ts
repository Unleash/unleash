import type { Tracking } from 'utils/trackingEvents';
import type { FilterItemParamHolder } from 'component/filter/Filters/Filters';

export const flagsListTableTracking: Tracking = {
    event: 'flags-list',
};

export const flagsListProps = ({
    filterState,
    query,
    total,
}: {
    filterState: FilterItemParamHolder;
    query?: string | null;
    total?: number;
}) => {
    const hasQuery = Boolean(query);
    const hasFilters = Object.values(filterState).some(
        (filter) => filter?.values.length,
    );

    return {
        listState: hasQuery || hasFilters ? 'filtered' : 'unfiltered',
        flagCount: total,
    };
};

export const flagsListColumnToggledTracking: Tracking = {
    event: 'flags-list',
    type: 'column-toggled',
};

export const flagsListLifecycleFilteredTracking: Tracking = {
    event: 'flags-list',
    type: 'lifecycle-filtered',
};
