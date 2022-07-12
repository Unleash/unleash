import { ComponentProps, useState, VFC } from 'react';
import {
    Autocomplete,
    Box,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import useProjects from 'hooks/api/getters/useProjects/useProjects';

interface IPlaygroundConnectionFieldsetProps {}

interface IOption {
    label: string;
    id: string;
}

const allOption: IOption = { label: 'ALL', id: '*' };

export const PlaygroundConnectionFieldset: VFC<
    IPlaygroundConnectionFieldsetProps
> = () => {
    const theme = useTheme();
    const { environments } = useEnvironments();
    const environmentOptions = environments
        .filter(({ enabled }) => Boolean(enabled))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(({ name }) => name);

    const { projects: availableProjects = [] } = useProjects();
    const projectsOptions = [
        allOption,
        ...availableProjects.map(({ name: label, id }) => ({
            label,
            id,
        })),
    ];
    const [projects, setProjects] = useState<IOption | IOption[]>(allOption);

    const onProjectsChange: ComponentProps<typeof Autocomplete>['onChange'] = (
        event,
        value,
        reason
    ) => {
        const newProjects = value as IOption | IOption[];
        if (reason === 'clear' || newProjects === null) {
            return setProjects(allOption);
        }
        if (Array.isArray(newProjects)) {
            if (newProjects.length === 0) {
                return setProjects(allOption);
            }
            if (
                newProjects.find(({ id }) => id === allOption.id) !== undefined
            ) {
                return setProjects(allOption);
            }
            return setProjects(newProjects);
        }
        if (newProjects.id === allOption.id) {
            return setProjects(allOption);
        }

        return setProjects([newProjects]);
    };

    return (
        <Box sx={{ pb: 2 }}>
            <Typography
                variant="body2"
                sx={{ mb: 2 }}
                color={theme.palette.text.secondary}
            >
                Access configuration
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Autocomplete
                    disablePortal
                    id="environment"
                    options={environmentOptions}
                    sx={{ width: 300, maxWidth: '100%' }}
                    renderInput={params => (
                        <TextField {...params} label="Environment" required />
                    )}
                    size="small"
                />
                <Autocomplete
                    disablePortal
                    id="projects"
                    multiple={Array.isArray(projects)}
                    options={projectsOptions}
                    sx={{ width: 300, maxWidth: '100%' }}
                    renderInput={params => (
                        <TextField {...params} label="Projects" />
                    )}
                    size="small"
                    value={projects}
                    onChange={onProjectsChange}
                />
            </Box>
        </Box>
    );
};
