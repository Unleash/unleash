import type { FC } from 'react';
import {
    Box,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from '@mui/material';
import { useProjectEnvironments } from 'hooks/api/getters/useProjectEnvironments/useProjectEnvironments';

type EnvironmentMultiSelectProps = {
    projectId: string;
    value: string[];
    onChange: (envs: string[]) => void;
    label?: string;
};

// Multi-select chip picker for environments to overlay feature-enabled /
// feature-disabled events on the chart. Sourced from the project's enabled
// environments.
export const EnvironmentMultiSelect: FC<EnvironmentMultiSelectProps> = ({
    projectId,
    value,
    onChange,
    label = 'Feature events from environments',
}) => {
    const { environments, loading } = useProjectEnvironments(projectId);
    const enabledEnvironments = environments
        .filter((env) => env.enabled)
        .map((env) => env.name);

    return (
        <FormControl variant='outlined' size='small' fullWidth>
            <InputLabel id='env-multi-select-label'>{label}</InputLabel>
            <Select
                labelId='env-multi-select-label'
                multiple
                value={value}
                onChange={(event) => {
                    const next = event.target.value;
                    onChange(typeof next === 'string' ? next.split(',') : next);
                }}
                label={label}
                disabled={loading}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((envName) => (
                            <Chip key={envName} label={envName} size='small' />
                        ))}
                    </Box>
                )}
            >
                {enabledEnvironments.map((envName) => (
                    <MenuItem key={envName} value={envName}>
                        {envName}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};
