import { Box, Button, Divider, useTheme } from '@mui/material';
import { GuidanceIndicator } from 'component/common/GuidanceIndicator/GuidanceIndicator';
import { IEnvironment } from 'interfaces/environments';
import { FormEvent, VFC } from 'react';
import { getEnvironmentOptions } from '../playground.utils';
import { PlaygroundCodeFieldset } from './PlaygroundCodeFieldset/PlaygroundCodeFieldset';
import { PlaygroundConnectionFieldset } from './PlaygroundConnectionFieldset/PlaygroundConnectionFieldset';

interface IPlaygroundFormProps {
    environments: IEnvironment[];
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    environment: string;
    projects: string[];
    setProjects: React.Dispatch<React.SetStateAction<string[]>>;
    setEnvironment: React.Dispatch<React.SetStateAction<string>>;
    context: string | undefined;
    setContext: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export const PlaygroundForm: VFC<IPlaygroundFormProps> = ({
    environments,
    environment,
    onSubmit,
    projects,
    setProjects,
    setEnvironment,
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
                environment={environment}
                projects={projects}
                setEnvironment={setEnvironment}
                setProjects={setProjects}
                environmentOptions={getEnvironmentOptions(environments)}
            />
            <Divider
                variant="fullWidth"
                sx={{
                    mb: 2,
                    borderColor: theme.palette.dividerAlternative,
                    borderStyle: 'dashed',
                }}
            />
            <PlaygroundCodeFieldset context={context} setContext={setContext} />

            <Divider
                variant="fullWidth"
                sx={{
                    mt: 3,
                    mb: 2,
                    borderColor: theme.palette.dividerAlternative,
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
