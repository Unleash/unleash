import React, { ComponentProps, VFC } from 'react';
import {
    Autocomplete,
    Box,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { renderOption } from '../renderOption';

interface IPlaygroundConnectionFieldsetProps {
    environments: string[];
    projects: string[];
    setProjects: (projects: string[]) => void;
    setEnvironments: (environments: string[]) => void;
    availableEnvironments: string[];
}

interface IOption {
    label: string;
    id: string;
}

const allOption: IOption = { label: 'ALL', id: '*' };

export const PlaygroundConnectionFieldset: VFC<
    IPlaygroundConnectionFieldsetProps
> = ({
    environments,
    projects,
    setProjects,
    setEnvironments,
    availableEnvironments,
}) => {
    const theme = useTheme();
    const { uiConfig } = useUiConfig();

    const isAdvancedPlayground = uiConfig.flags.advancedPlayground;

    const { projects: availableProjects = [] } = useProjects();
    const projectsOptions = [
        allOption,
        ...availableProjects.map(({ name: label, id }) => ({
            label,
            id,
        })),
    ];

    const environmentOptions = [
        ...availableEnvironments.map(name => ({
            label: name,
            id: name,
        })),
    ];

    const onProjectsChange: ComponentProps<typeof Autocomplete>['onChange'] = (
        event,
        value,
        reason
    ) => {
        const newProjects = value as IOption | IOption[];
        if (reason === 'clear' || newProjects === null) {
            return setProjects([allOption.id]);
        }
        if (Array.isArray(newProjects)) {
            if (newProjects.length === 0) {
                return setProjects([allOption.id]);
            }
            if (
                newProjects.find(({ id }) => id === allOption.id) !== undefined
            ) {
                return setProjects([allOption.id]);
            }
            return setProjects(newProjects.map(({ id }) => id));
        }
        if (newProjects.id === allOption.id) {
            return setProjects([allOption.id]);
        }

        return setProjects([newProjects.id]);
    };

    const onEnvironmentsChange: ComponentProps<
        typeof Autocomplete
    >['onChange'] = (event, value, reason) => {
        const newEnvironments = value as IOption | IOption[];
        if (reason === 'clear' || newEnvironments === null) {
            return setEnvironments([]);
        }
        if (Array.isArray(newEnvironments)) {
            if (newEnvironments.length === 0) {
                return setEnvironments([]);
            }
            return setEnvironments(newEnvironments.map(({ id }) => id));
        }

        return setEnvironments([newEnvironments.id]);
    };

    const isAllProjects =
        projects.length === 0 || (projects.length === 1 && projects[0] === '*');

    const envValue = isAdvancedPlayground
        ? environmentOptions.filter(({ id }) => environments.includes(id))
        : environmentOptions.filter(({ id }) => environments.includes(id))[0];

    return (
        <Box sx={{ pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography
                    variant="body2"
                    color={theme.palette.text.primary}
                    sx={{ ml: 1 }}
                >
                    Access configuration
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Autocomplete
                    disablePortal
                    limitTags={3}
                    id="environment"
                    multiple={isAdvancedPlayground}
                    options={environmentOptions}
                    sx={{ flex: 1 }}
                    renderInput={params => (
                        <TextField {...params} label="Environments" />
                    )}
                    renderOption={renderOption}
                    getOptionLabel={({ label }) => label}
                    disableCloseOnSelect={isAdvancedPlayground!}
                    size="small"
                    value={envValue}
                    onChange={onEnvironmentsChange}
                    data-testid={'PLAYGROUND_ENVIRONMENT_SELECT'}
                />
                <Autocomplete
                    disablePortal
                    id="projects"
                    limitTags={3}
                    multiple={!isAllProjects}
                    options={projectsOptions}
                    sx={{ flex: 1 }}
                    renderInput={params => (
                        <TextField {...params} label="Projects" />
                    )}
                    renderOption={renderOption}
                    getOptionLabel={({ label }) => label}
                    disableCloseOnSelect
                    size="small"
                    value={
                        isAllProjects
                            ? allOption
                            : projectsOptions.filter(({ id }) =>
                                  projects.includes(id)
                              )
                    }
                    onChange={onProjectsChange}
                    data-testid={'PLAYGROUND_PROJECT_SELECT'}
                />
            </Box>
        </Box>
    );
};
