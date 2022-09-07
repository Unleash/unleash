import { ComponentProps, VFC } from 'react';
import {
    Autocomplete,
    Box,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { GuidanceIndicator } from 'component/common/GuidanceIndicator/GuidanceIndicator';

interface IPlaygroundConnectionFieldsetProps {
    environment: string;
    projects: string[];
    setProjects: (projects: string[]) => void;
    setEnvironment: (environment: string) => void;
    environmentOptions: string[];
}

interface IOption {
    label: string;
    id: string;
}

const allOption: IOption = { label: 'ALL', id: '*' };

export const PlaygroundConnectionFieldset: VFC<
    IPlaygroundConnectionFieldsetProps
> = ({
    environment,
    projects,
    setProjects,
    setEnvironment,
    environmentOptions,
}) => {
    const theme = useTheme();

    const { projects: availableProjects = [] } = useProjects();
    const projectsOptions = [
        allOption,
        ...availableProjects.map(({ name: label, id }) => ({
            label,
            id,
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

    const isAllProjects =
        projects.length === 0 || (projects.length === 1 && projects[0] === '*');

    return (
        <Box sx={{ pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GuidanceIndicator type="secondary">1</GuidanceIndicator>
                <Typography
                    variant="body2"
                    color={theme.palette.text.secondary}
                    sx={{ ml: 1 }}
                >
                    Access configuration
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Autocomplete
                    disablePortal
                    id="environment"
                    options={environmentOptions}
                    sx={{ width: 200, maxWidth: '100%' }}
                    renderInput={params => (
                        <TextField {...params} label="Environment" required />
                    )}
                    value={environment}
                    onChange={(event, value) => setEnvironment(value || '')}
                    size="small"
                />
                <Autocomplete
                    disablePortal
                    id="projects"
                    multiple={!isAllProjects}
                    options={projectsOptions}
                    sx={{ width: 200, maxWidth: '100%' }}
                    renderInput={params => (
                        <TextField {...params} label="Projects" />
                    )}
                    size="small"
                    value={
                        isAllProjects
                            ? allOption
                            : projectsOptions.filter(({ id }) =>
                                  projects.includes(id)
                              )
                    }
                    onChange={onProjectsChange}
                />
            </Box>
        </Box>
    );
};
