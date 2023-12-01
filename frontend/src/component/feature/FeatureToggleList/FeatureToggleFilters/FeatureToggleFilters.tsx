import { VFC } from 'react';
import { Box } from '@mui/material';
import { FilterItem } from 'component/common/FilterItem/FilterItem';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

export type FeatureTogglesListFilters = {
    projectId?: string;
};

interface IFeatureToggleFiltersProps {
    state: FeatureTogglesListFilters;
    onChange: (value: FeatureTogglesListFilters) => void;
}

export const FeatureToggleFilters: VFC<IFeatureToggleFiltersProps> = ({
    state,
    onChange,
}) => {
    const { projects } = useProjects();
    const projectsOptions = (projects || []).map((project) => ({
        label: project.name,
        value: project.id,
    }));

    return (
        <Box sx={(theme) => ({ marginBottom: theme.spacing(2) })}>
            <ConditionallyRender
                condition={projectsOptions.length > 1}
                show={() => (
                    <FilterItem
                        label='Project'
                        options={projectsOptions}
                        onChange={(value) => onChange({ projectId: value })}
                    />
                )}
            />
        </Box>
    );
};
