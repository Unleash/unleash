import { Box, Button, Divider, useTheme } from '@mui/material';
import { GuidanceIndicator } from 'component/common/GuidanceIndicator/GuidanceIndicator';
import { IEnvironment } from 'interfaces/environments';
import { FormEvent, VFC } from 'react';
import { PlaygroundCodeFieldset } from './PlaygroundCodeFieldset/PlaygroundCodeFieldset';
import { PlaygroundConnectionFieldset } from './PlaygroundConnectionFieldset/PlaygroundConnectionFieldset';

interface IPlaygroundFormProps {
    availableEnvironments: IEnvironment[];
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    environments: string | string[];
    projects: string[];
    setProjects: React.Dispatch<React.SetStateAction<string[]>>;
    setEnvironments: React.Dispatch<React.SetStateAction<string[]>>;
    context: string | undefined;
    setContext: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export const PlaygroundForm: VFC<IPlaygroundFormProps> = ({
    availableEnvironments,
    environments,
    onSubmit,
    projects,
    setProjects,
    setEnvironments,
    context,
    setContext,
}) => {
    const theme = useTheme();

    return (
        <Box
            component="form"
            onSubmit={onSubmit}
            sx={{
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <PlaygroundConnectionFieldset
                environments={
                    Array.isArray(environments) ? environments : [environments]
                }
                projects={projects}
                setEnvironments={setEnvironments}
                setProjects={setProjects}
                availableEnvironments={availableEnvironments.map(
                    ({ name }) => name
                )}
            />
            <Divider
                variant="fullWidth"
                sx={{
                    mb: 2,
                    borderColor: theme.palette.divider,
                    borderStyle: 'dashed',
                }}
            />
            <PlaygroundCodeFieldset context={context} setContext={setContext} />

            <Divider
                variant="fullWidth"
                sx={{
                    mt: 3,
                    mb: 2,
                    borderColor: theme.palette.divider,
                }}
            />
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <GuidanceIndicator type="secondary">3</GuidanceIndicator>

                <Button
                    variant="contained"
                    size="large"
                    type="submit"
                    sx={{ marginLeft: 'auto' }}
                >
                    Try configuration
                </Button>
            </Box>
        </Box>
    );
};
