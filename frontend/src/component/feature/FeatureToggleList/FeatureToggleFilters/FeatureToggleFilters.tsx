import { VFC } from 'react';
import { Box } from '@mui/material';
import { FilterItem } from 'component/common/FilterItem/FilterItem';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

export type FeatureTogglesListFilters = {
    project: FilterItem | null | undefined;
};

interface IFeatureToggleFiltersProps {
    initialValues: FeatureTogglesListFilters;
    onChange: (value: FeatureTogglesListFilters) => void;
}

export const FeatureToggleFilters: VFC<IFeatureToggleFiltersProps> = ({
    initialValues,
    onChange,
}) => {
    const { projects } = useProjects();
    const projectsOptions = (projects || []).map((project) => ({
        label: project.name,
        value: project.id,
    }));

    return (
        <Box sx={(theme) => ({ padding: theme.spacing(2, 3) })}>
            <ConditionallyRender
                condition={projectsOptions.length > 1}
                show={() => (
                    <FilterItem
                        label='Project'
                        initialValue={initialValues.project}
                        options={projectsOptions}
                        onChange={(value) => onChange({ project: value })}
                    />
                )}
            />
        </Box>
    );
};
