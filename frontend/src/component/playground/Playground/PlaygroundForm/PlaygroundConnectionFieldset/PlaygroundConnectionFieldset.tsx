import {
    type ComponentProps,
    type Dispatch,
    type SetStateAction,
    useState,
    type FC,
} from 'react';
import {
    Box,
    Button,
    IconButton,
    InputAdornment,
    styled,
    type TextField,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import {
    type IApiToken,
    useApiTokens,
} from 'hooks/api/getters/useApiTokens/useApiTokens';
import Input from 'component/common/Input/Input';
import {
    extractProjectEnvironmentFromToken,
    validateTokenFormat,
} from '../../playground.utils';
import Clear from '@mui/icons-material/Clear';
import { ProjectSelect } from '../../../../common/ProjectSelect/ProjectSelect.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { EnvironmentsField } from './EnvironmentsField/EnvironmentsField.tsx';
import { Link } from 'react-router-dom';

interface IPlaygroundConnectionFieldsetProps {
    environments: string[];
    projects: string[];
    token?: string;
    setProjects: Dispatch<SetStateAction<string[]>>;
    setEnvironments: Dispatch<SetStateAction<string[]>>;
    setToken?: Dispatch<SetStateAction<string | undefined>>;
    availableEnvironments: string[];
    changeRequest?: string;
    onClearChangeRequest?: () => void;
}

interface IOption {
    label: string;
    id: string;
}

const allOption: IOption = { label: 'ALL', id: '*' };

const SmallClear = styled(Clear)({
    fontSize: '1.25rem',
});

const StyledInput = styled(Input)(() => ({
    width: '100%',
}));

const StyledGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    columnGap: theme.spacing(2),
    rowGap: theme.spacing(2),
    gridTemplateColumns: '1fr',

    [theme.breakpoints.up('md')]: {
        gridTemplateColumns: '1fr 1fr',
    },
}));

const StyledChangeRequestInput = styled(StyledInput)(({ theme }) => ({
    '& label': {
        WebkitTextFillColor: theme.palette.text.secondary,
    },
    '& input.Mui-disabled': {
        WebkitTextFillColor: theme.palette.text.secondary,
    },
}));

export const PlaygroundConnectionFieldset: FC<
    IPlaygroundConnectionFieldsetProps
> = ({
    environments,
    projects,
    token,
    setProjects,
    setEnvironments,
    setToken,
    availableEnvironments,
    changeRequest,
    onClearChangeRequest,
}) => {
    const theme = useTheme();
    const { tokens } = useApiTokens();
    const [tokenError, setTokenError] = useState<string | undefined>();

    const { projects: availableProjects } = useProjects();

    const projectsOptions = [
        allOption,
        ...availableProjects.map(({ name: label, id }) => ({
            label,
            id,
        })),
    ];
    const onSetToken: ComponentProps<typeof TextField>['onChange'] = async (
        event,
    ) => {
        const tempToken = event.target.value;
        setToken?.(tempToken);

        if (tempToken === '') {
            resetTokenState();
            return;
        }

        try {
            validateTokenFormat(tempToken);
            setTokenError(undefined);
            processToken(tempToken);
        } catch (e: any) {
            setTokenError(e.message);
        }
    };

    const processToken = (tempToken: string) => {
        const [tokenProject, tokenEnvironment] =
            extractProjectEnvironmentFromToken(tempToken);
        setEnvironments([tokenEnvironment]);
        switch (tokenProject) {
            case '[]':
                handleTokenWithSomeProjects(tempToken);
                break;
            case '*':
                handleTokenWithAllProjects();
                break;
            default:
                handleSpecificProjectToken(tokenProject);
        }
    };

    const updateProjectsBasedOnValidToken = (validToken: IApiToken) => {
        if (!validToken.projects || validToken.projects === '*') {
            setProjects([allOption.id]);
        } else if (typeof validToken.projects === 'string') {
            setProjects([validToken.projects]);
        } else if (Array.isArray(validToken.projects)) {
            setProjects(validToken.projects);
        }
    };

    const handleTokenWithSomeProjects = (tempToken: string) => {
        const validToken = tokens.find(({ secret }) => secret === tempToken);
        if (validToken) {
            updateProjectsBasedOnValidToken(validToken);
        } else {
            setTokenError(
                'Invalid token. Ensure you use a valid token from this Unleash instance.',
            );
        }
    };

    const handleTokenWithAllProjects = () => {
        setProjects([allOption.id]);
    };

    const handleSpecificProjectToken = (tokenProject: string) => {
        if (
            !projectsOptions.map((option) => option.id).includes(tokenProject)
        ) {
            setTokenError(
                `Invalid token. Project ${tokenProject} does not exist.`,
            );
        } else {
            setProjects([tokenProject]);
        }
    };

    const resetTokenState = () => {
        setTokenError(undefined);
    };

    const clearToken = () => {
        setToken?.('');
        resetTokenState();
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
            <StyledGrid>
                <Box>
                    <Tooltip
                        arrow
                        title={
                            token
                                ? 'Environment is automatically selected because you are using a token'
                                : 'Select environments to use in the playground'
                        }
                    >
                        <Box>
                            <EnvironmentsField
                                environments={environments}
                                setEnvironments={setEnvironments}
                                availableEnvironments={availableEnvironments}
                                disabled={Boolean(token || changeRequest)}
                            />
                        </Box>
                    </Tooltip>
                </Box>
                <Box>
                    <Tooltip
                        arrow
                        title={
                            token
                                ? 'Project is automatically selected because you are using a token'
                                : 'Select projects to use in the playground'
                        }
                    >
                        <ProjectSelect
                            selectedProjects={projects}
                            onChange={setProjects}
                            dataTestId={'PLAYGROUND_PROJECT_SELECT'}
                            disabled={Boolean(token || changeRequest)}
                            limitTags={3}
                        />
                    </Tooltip>
                </Box>
                <Box>
                    <StyledInput
                        label='API token'
                        value={token || (changeRequest ? ' ' : '')}
                        onChange={onSetToken}
                        type={'text'}
                        error={Boolean(tokenError)}
                        errorText={tokenError}
                        placeholder={'Enter your API token'}
                        data-testid={'PLAYGROUND_TOKEN_INPUT'}
                        InputProps={{
                            endAdornment: token ? (
                                <InputAdornment
                                    position='end'
                                    data-testid='TOKEN_INPUT_CLEAR_BTN'
                                >
                                    <IconButton
                                        aria-label='clear API token'
                                        onClick={clearToken}
                                        edge='end'
                                    >
                                        <SmallClear />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        }}
                        disabled={Boolean(changeRequest)}
                    />
                </Box>
                <ConditionallyRender
                    condition={Boolean(changeRequest)}
                    show={
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <StyledChangeRequestInput
                                    label='Change request'
                                    value={
                                        changeRequest
                                            ? `Change request #${changeRequest}`
                                            : ''
                                    }
                                    onChange={() => {}}
                                    type={'text'}
                                    disabled
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <IconButton
                                                    aria-label='clear Change request results'
                                                    onClick={
                                                        onClearChangeRequest
                                                    }
                                                    edge='end'
                                                >
                                                    <SmallClear />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                            <Button
                                variant='outlined'
                                size='small'
                                to={`/projects/${projects[0]}/change-requests/${changeRequest}`}
                                component={Link}
                            >
                                View change request
                            </Button>
                        </Box>
                    }
                />
            </StyledGrid>
        </Box>
    );
};
