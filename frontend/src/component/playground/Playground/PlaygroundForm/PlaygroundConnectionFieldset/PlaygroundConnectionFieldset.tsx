import React, { ComponentProps, useState, VFC } from 'react';
import {
    Autocomplete,
    Box,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { renderOption } from '../renderOption';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUiFlag } from 'hooks/useUiFlag';
import { useApiTokens } from 'hooks/api/getters/useApiTokens/useApiTokens';
import Input from 'component/common/Input/Input';
import {
    extractProjectEnvironmentFromToken,
    validateTokenFormat,
} from '../../playground.utils';

interface IPlaygroundConnectionFieldsetProps {
    environments: string[];
    projects: string[];
    token?: string;
    setProjects: (projects: string[]) => void;
    setEnvironments: (environments: string[]) => void;
    setToken?: (token: string) => void;
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
    token,
    setProjects,
    setEnvironments,
    setToken,
    availableEnvironments,
}) => {
    const theme = useTheme();
    const playgroundImprovements = useUiFlag('playgroundImprovements');
    const { tokens } = useApiTokens();
    const [tokenError, setTokenError] = useState<string | undefined>();

    const { projects: availableProjects = [] } = useProjects();
    const projectsOptions = [
        allOption,
        ...availableProjects.map(({ name: label, id }) => ({
            label,
            id,
        })),
    ];

    const environmentOptions = [
        ...availableEnvironments.map((name) => ({
            label: name,
            id: name,
        })),
    ];

    const onProjectsChange: ComponentProps<typeof Autocomplete>['onChange'] = (
        event,
        value,
        reason,
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
        projects &&
        (projects.length === 0 ||
            (projects.length === 1 && projects[0] === '*'));

    const envValue = environmentOptions.filter(({ id }) =>
        environments.includes(id),
    );

    const onSetToken: ComponentProps<typeof TextField>['onChange'] = async (
        event,
    ) => {
        const tempToken = event.target.value;
        setToken?.(tempToken);
        if (tempToken === '') {
            setTokenError(undefined);
            return;
        }

        try {
            validateTokenFormat(tempToken);
            setTokenError(undefined);
            const [tokenProject, tokenEnvironment] =
                extractProjectEnvironmentFromToken(tempToken);
            setEnvironments([tokenEnvironment]);
            if (tokenProject === '[]') {
                const validToken = tokens.find(
                    ({ secret }) => secret === tempToken,
                );
                if (validToken) {
                    if (typeof validToken.projects === 'undefined') {
                        setProjects([allOption.id]);
                    }

                    if (typeof validToken.projects === 'string') {
                        setProjects([validToken.projects]);
                    }

                    if (Array.isArray(validToken.projects)) {
                        setProjects(validToken.projects);
                    }
                } else {
                    setTokenError(
                        'Invalid token. Please make sure you are using a valid token from this Unleash instance',
                    );
                }
                return;
            }
            if (tokenProject === '*') {
                setProjects([allOption.id]);
                return;
            }

            if (
                !projectsOptions
                    .map((option) => option.id)
                    .includes(tokenProject)
            ) {
                setTokenError(
                    `Invalid token. Project ${tokenProject} does not exist`,
                );
            }
            setProjects([tokenProject]);
        } catch (e: any) {
            setTokenError(e.message);
            return;
        }
    };

    return (
        <Box sx={{ pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography
                    variant='body2'
                    color={theme.palette.text.primary}
                    sx={{ ml: 1 }}
                >
                    Access configuration
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Tooltip
                    title={
                        Boolean(token)
                            ? 'Environment is automatically selected because you are using a token'
                            : 'Select environments to use in the playground'
                    }
                >
                    <Autocomplete
                        disablePortal
                        limitTags={3}
                        id='environment'
                        multiple={true}
                        options={environmentOptions}
                        sx={{ flex: 1 }}
                        renderInput={(params) => (
                            <TextField {...params} label='Environments' />
                        )}
                        renderOption={renderOption}
                        getOptionLabel={({ label }) => label}
                        disableCloseOnSelect={false}
                        size='small'
                        value={envValue}
                        onChange={onEnvironmentsChange}
                        disabled={Boolean(token)}
                        data-testid={'PLAYGROUND_ENVIRONMENT_SELECT'}
                    />
                </Tooltip>
                <Tooltip
                    title={
                        Boolean(token)
                            ? 'Project is automatically selected because you are using a token'
                            : 'Select projects to use in the playground'
                    }
                >
                    <Autocomplete
                        disablePortal
                        id='projects'
                        limitTags={3}
                        multiple={!isAllProjects}
                        options={projectsOptions}
                        sx={{ flex: 1 }}
                        renderInput={(params) => (
                            <TextField {...params} label='Projects' />
                        )}
                        renderOption={renderOption}
                        getOptionLabel={({ label }) => label}
                        disableCloseOnSelect
                        size='small'
                        value={
                            isAllProjects
                                ? allOption
                                : projectsOptions.filter(({ id }) =>
                                      projects.includes(id),
                                  )
                        }
                        onChange={onProjectsChange}
                        disabled={Boolean(token)}
                        data-testid={'PLAYGROUND_PROJECT_SELECT'}
                    />
                </Tooltip>
            </Box>
            <ConditionallyRender
                condition={Boolean(playgroundImprovements)}
                show={
                    <Input
                        sx={{ mt: 2, width: '50%', pr: 1 }}
                        label='Api token'
                        value={token || ''}
                        onChange={onSetToken}
                        type={'text'}
                        error={Boolean(tokenError)}
                        errorText={tokenError}
                        placeholder={'Enter your api token'}
                        data-testid={'PLAYGROUND_TOKEN_INPUT'}
                    />
                }
            />
        </Box>
    );
};
