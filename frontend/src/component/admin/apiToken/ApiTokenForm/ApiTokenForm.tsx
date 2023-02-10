import {
    Alert,
    Box,
    Button,
    FormControl,
    FormControlLabel,
    Link,
    Radio,
    RadioGroup,
    styled,
    Typography,
} from '@mui/material';
import { KeyboardArrowDownOutlined } from '@mui/icons-material';
import React from 'react';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import Input from 'component/common/Input/Input';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { SelectProjectInput } from './SelectProjectInput/SelectProjectInput';
import { ApiTokenFormErrorType } from './useApiTokenForm';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TokenType } from 'interfaces/token';

interface IApiTokenFormProps {
    username: string;
    type: string;
    projects: string[];
    environment?: string;
    setTokenType: (value: string) => void;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    setProjects: React.Dispatch<React.SetStateAction<string[]>>;
    setEnvironment: React.Dispatch<React.SetStateAction<string | undefined>>;
    handleSubmit: (e: any) => void;
    handleCancel: () => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
    clearErrors: (error?: ApiTokenFormErrorType) => void;
    scope?: 'global' | 'project';
}

const StyledContainer = styled('div')(() => ({
    maxWidth: '400px',
}));

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
}));

const StyledSelectInput = styled(GeneralSelect)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    minWidth: '400px',
    [theme.breakpoints.down('sm')]: {
        minWidth: '379px',
    },
}));

const StyledInputDescription = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const StyledInputLabel = styled('label')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const CancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

const StyledBox = styled(Box)({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
});

const ApiTokenForm: React.FC<IApiTokenFormProps> = ({
    children,
    username,
    type,
    projects,
    environment,
    setUsername,
    setTokenType,
    setProjects,
    setEnvironment,
    handleSubmit,
    handleCancel,
    errors,
    clearErrors,
    scope = 'global',
}) => {
    const { uiConfig } = useUiConfig();
    const { environments } = useEnvironments();
    const { projects: availableProjects } = useProjects();

    const disableProjectSelection = scope === 'project';

    const selectableTypes = [
        {
            key: TokenType.CLIENT,
            label: `Server-side SDK (${TokenType.CLIENT})`,
            title: 'Connect server-side SDK or Unleash Proxy',
        },
    ];

    if (scope === 'global') {
        selectableTypes.push({
            key: TokenType.ADMIN,
            label: TokenType.ADMIN,
            title: 'Full access for managing Unleash',
        });
    }

    if (uiConfig.flags.embedProxyFrontend) {
        selectableTypes.splice(1, 0, {
            key: TokenType.FRONTEND,
            label: `Client-side SDK (${TokenType.FRONTEND})`,
            title: 'Connect web and mobile SDK directly to Unleash',
        });
    }

    const selectableProjects = availableProjects.map(project => ({
        value: project.id,
        label: project.name,
    }));

    const selectableEnvs =
        type === TokenType.ADMIN
            ? [{ key: '*', label: 'ALL' }]
            : environments.map(environment => ({
                  key: environment.name,
                  label: environment.name,
                  title: environment.name,
                  disabled: !environment.enabled,
              }));

    const isUnleashCloud = Boolean(uiConfig?.flags?.UNLEASH_CLOUD);

    return (
        <StyledForm onSubmit={handleSubmit}>
            <ConditionallyRender
                condition={isUnleashCloud}
                show={
                    <Alert severity="info" sx={{ mb: 4 }}>
                        Please be aware of our{' '}
                        <Link href="https://www.getunleash.io/fair-use-policy">
                            fair use policy
                        </Link>
                        .
                    </Alert>
                }
            />
            <StyledContainer>
                <StyledInputDescription>
                    What would you like to call this token?
                </StyledInputDescription>
                <StyledInput
                    value={username}
                    name="username"
                    onChange={e => setUsername(e.target.value)}
                    label="Token name"
                    error={errors.username !== undefined}
                    errorText={errors.username}
                    onFocus={() => clearErrors('username')}
                    autoFocus
                />
                <FormControl sx={{ mb: 2, width: '100%' }}>
                    <StyledInputLabel id="token-type">
                        What do you want to connect?
                    </StyledInputLabel>
                    <RadioGroup
                        aria-labelledby="token-type"
                        defaultValue="CLIENT"
                        name="radio-buttons-group"
                        value={type}
                        onChange={(event, value) => setTokenType(value)}
                    >
                        {selectableTypes.map(({ key, label, title }) => (
                            <FormControlLabel
                                key={key}
                                value={key}
                                sx={{ mb: 1 }}
                                control={
                                    <Radio
                                        sx={{
                                            ml: 0.75,
                                            alignSelf: 'flex-start',
                                        }}
                                    />
                                }
                                label={
                                    <Box>
                                        <Box>
                                            <Typography>{label}</Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {title}
                                            </Typography>
                                        </Box>
                                    </Box>
                                }
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
                <ConditionallyRender
                    condition={!disableProjectSelection}
                    show={
                        <>
                            <StyledInputDescription>
                                Which project do you want to give access to?
                            </StyledInputDescription>
                            <SelectProjectInput
                                disabled={type === TokenType.ADMIN}
                                options={selectableProjects}
                                defaultValue={projects}
                                onChange={setProjects}
                                error={errors?.projects}
                                onFocus={() => clearErrors('projects')}
                            />
                        </>
                    }
                />
                <StyledInputDescription>
                    Which environment should the token have access to?
                </StyledInputDescription>
                <StyledSelectInput
                    disabled={type === TokenType.ADMIN}
                    options={selectableEnvs}
                    value={environment}
                    onChange={setEnvironment}
                    label="Environment"
                    id="api_key_environment"
                    name="environment"
                    IconComponent={KeyboardArrowDownOutlined}
                    fullWidth
                />
            </StyledContainer>
            <StyledBox>
                {children}
                <CancelButton onClick={handleCancel}>Cancel</CancelButton>
            </StyledBox>
        </StyledForm>
    );
};

export default ApiTokenForm;
