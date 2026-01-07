import { Box, Button } from '@mui/material';
import type { IEnvironment } from 'interfaces/environments';
import type { FormEvent, VFC } from 'react';
import { PlaygroundCodeFieldset } from './PlaygroundCodeFieldset/PlaygroundCodeFieldset.tsx';
import { PlaygroundConnectionFieldset } from './PlaygroundConnectionFieldset/PlaygroundConnectionFieldset.tsx';

interface IPlaygroundFormProps {
    availableEnvironments: IEnvironment[];
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    environments: string | string[];
    projects: string[];
    token?: string;
    setToken?: React.Dispatch<React.SetStateAction<string | undefined>>;
    setProjects: React.Dispatch<React.SetStateAction<string[]>>;
    setEnvironments: React.Dispatch<React.SetStateAction<string[]>>;
    context: string | undefined;
    setContext: React.Dispatch<React.SetStateAction<string | undefined>>;
    changeRequest?: string;
    onClearChangeRequest?: () => void;
}

export const PlaygroundForm: VFC<IPlaygroundFormProps> = ({
    availableEnvironments,
    environments,
    onSubmit,
    projects,
    token,
    setToken,
    setProjects,
    setEnvironments,
    context,
    setContext,
    changeRequest,
    onClearChangeRequest,
}) => {
    return (
        <Box
            component='form'
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
                token={token}
                setToken={setToken}
                setEnvironments={setEnvironments}
                setProjects={setProjects}
                availableEnvironments={availableEnvironments.map(
                    ({ name }) => name,
                )}
                changeRequest={changeRequest}
                onClearChangeRequest={onClearChangeRequest}
            />

            <PlaygroundCodeFieldset context={context} setContext={setContext} />

            <Box
                sx={{
                    mt: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Button
                    variant='contained'
                    size='large'
                    type='submit'
                    sx={{ marginLeft: 'auto' }}
                >
                    Try configuration
                </Button>
            </Box>
        </Box>
    );
};
