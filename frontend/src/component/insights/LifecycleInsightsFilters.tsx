import { type FC, useEffect, useState } from 'react';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import {
    type FilterItemParamHolder,
    Filters,
    type IFilterItem,
} from 'component/filter/Filters/Filters';
import { styled } from '@mui/material';

interface IFeatureToggleFiltersProps {
    state: FilterItemParamHolder;
    onChange: (value: FilterItemParamHolder) => void;
    className?: string;
    filterNamePrefix?: string;
}

const FiltersNoPadding = styled(Filters)({
    padding: 0,
});

export const LifecycleInsightsFilters: FC<IFeatureToggleFiltersProps> = ({
    filterNamePrefix,
    state,
    ...filterProps
}) => {
    const { projects } = useProjects();

    const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>([]);

    useEffect(() => {
        const projectsOptions = (projects || []).map((project) => ({
            label: project.name,
            value: project.id,
        }));

        const hasMultipleProjects = projectsOptions.length > 1;

        const prefix = filterNamePrefix ?? '';

        const availableFilters: IFilterItem[] = hasMultipleProjects
            ? [
                  {
                      label: 'Project',
                      icon: 'topic',
                      options: projectsOptions,
                      filterKey: `${prefix}projects`,
                      singularOperators: ['IS'],
                      pluralOperators: ['IS_ANY_OF'],
                  },
              ]
            : [];
        setAvailableFilters(availableFilters);
    }, [JSON.stringify(projects)]);

    return (
        <FiltersNoPadding
            {...filterProps}
            state={state}
            availableFilters={availableFilters}
        />
    );
};
