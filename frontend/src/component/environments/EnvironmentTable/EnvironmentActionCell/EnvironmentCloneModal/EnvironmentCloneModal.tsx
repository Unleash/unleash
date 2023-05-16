import {
    Button,
    FormControl,
    FormControlLabel,
    Link,
    Radio,
    RadioGroup,
    styled,
    Switch,
} from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { FormEvent, useEffect, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import Input from 'component/common/Input/Input';
import {
    IEnvironment,
    IEnvironmentClonePayload,
} from 'interfaces/environments';
import useEnvironmentApi from 'hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import EnvironmentTypeSelector from 'component/environments/EnvironmentForm/EnvironmentTypeSelector/EnvironmentTypeSelector';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { EnvironmentProjectSelect } from './EnvironmentProjectSelect/EnvironmentProjectSelect';
import { SelectProjectInput } from 'component/admin/apiToken/ApiTokenForm/ProjectSelector/SelectProjectInput/SelectProjectInput';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import useApiTokensApi, {
    IApiTokenCreate,
} from 'hooks/api/actions/useApiTokensApi/useApiTokensApi';
import { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledInputDescription = styled('p')(({ theme }) => ({
    display: 'flex',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
    '&:not(:first-of-type)': {
        marginTop: theme.spacing(4),
    },
}));

const StyledInputSecondaryDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
}));

const StyledSecondaryContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.elevation2,
    borderRadius: theme.shape.borderRadiusMedium,
    marginTop: theme.spacing(4),
}));

const StyledInlineContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 4),
    '& > p:not(:first-of-type)': {
        marginTop: theme.spacing(2),
    },
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('sm')]: {
        marginTop: theme.spacing(4),
    },
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

enum APITokenGeneration {
    LATER = 'later',
    NOW = 'now',
}

enum ErrorField {
    NAME = 'name',
    PROJECTS = 'projects',
}

interface IEnvironmentCloneModalErrors {
    [ErrorField.NAME]?: string;
    [ErrorField.PROJECTS]?: string;
}

interface IEnvironmentCloneModalProps {
    environment: IEnvironment;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    newToken: (token: IApiToken) => void;
}

export const EnvironmentCloneModal = ({
    environment,
    open,
    setOpen,
    newToken,
}: IEnvironmentCloneModalProps) => {
    const { environments, refetchEnvironments } = useEnvironments();
    const { cloneEnvironment, loading } = useEnvironmentApi();
    const { createToken } = useApiTokensApi();
    const { projects: allProjects } = useProjects();
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const [name, setName] = useState(`${environment.name}_clone`);
    const [type, setType] = useState('development');
    const [projects, setProjects] = useState<string[]>([]);
    const [tokenProjects, setTokenProjects] = useState<string[]>(['*']);
    const [clonePermissions, setClonePermissions] = useState(true);
    const [apiTokenGeneration, setApiTokenGeneration] =
        useState<APITokenGeneration>(APITokenGeneration.LATER);
    const [errors, setErrors] = useState<IEnvironmentCloneModalErrors>({});

    const clearError = (field: ErrorField) => {
        setErrors(errors => ({ ...errors, [field]: undefined }));
    };

    const setError = (field: ErrorField, error: string) => {
        setErrors(errors => ({ ...errors, [field]: error }));
    };

    useEffect(() => {
        setName(getUniqueName(environment.name));
        setType('development');
        setProjects([]);
        setTokenProjects(['*']);
        setClonePermissions(true);
        setApiTokenGeneration(APITokenGeneration.LATER);
        setErrors({});
    }, [environment]);

    const getUniqueName = (name: string) => {
        let uniqueName = `${name}_clone`;
        let number = 2;
        while (!isNameUnique(uniqueName)) {
            uniqueName = `${environment.name}_clone_${number}`;
            number++;
        }
        return uniqueName;
    };

    const getCloneEnvironmentPayload = (): IEnvironmentClonePayload => ({
        name,
        type,
        projects,
        clonePermissions,
    });

    const getApiTokenCreatePayload = (): IApiTokenCreate => ({
        username: `${name}_token`,
        type: 'CLIENT',
        environment: name,
        projects: tokenProjects,
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await cloneEnvironment(
                environment.name,
                getCloneEnvironmentPayload()
            );
            if (apiTokenGeneration === APITokenGeneration.NOW) {
                const response = await createToken(getApiTokenCreatePayload());
                const token = await response.json();
                newToken(token);
            }
            setToastData({
                title: 'Environment successfully cloned!',
                type: 'success',
            });
            refetchEnvironments();
            setOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/environments/${environment.name}/clone' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(getCloneEnvironmentPayload(), undefined, 2)}'`;
    };

    const isNameNotEmpty = (name: string) => name.length;
    const isNameUnique = (name: string) =>
        !environments?.some(environment => environment.name === name);
    const isValid =
        isNameNotEmpty(name) && isNameUnique(name) && tokenProjects.length;

    const onSetName = (name: string) => {
        clearError(ErrorField.NAME);
        if (!isNameUnique(name)) {
            setError(
                ErrorField.NAME,
                'An environment with that name already exists.'
            );
        }
        setName(name);
    };

    const selectableProjects = allProjects.map(project => ({
        value: project.id,
        label: project.name,
    }));

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label={`Clone ${environment.name} environment`}
        >
            <FormTemplate
                loading={loading}
                modal
                title={`Clone ${environment.name} environment`}
                description="Cloning an environment will clone all feature toggles and their configuration (activation strategies, segments, status, etc) into a new environment."
                documentationLink="https://docs.getunleash.io/reference/environments#cloning-environments"
                documentationLinkLabel="Cloning environments documentation"
                formatApiCode={formatApiCode}
            >
                <StyledForm onSubmit={handleSubmit}>
                    <div>
                        <StyledInputDescription>
                            What is your new environment name? (Can't be changed
                            later)
                        </StyledInputDescription>
                        <StyledInput
                            autoFocus
                            label="Environment name"
                            error={Boolean(errors.name)}
                            errorText={errors.name}
                            value={name}
                            onChange={e => onSetName(e.target.value)}
                            required
                        />
                        <StyledInputDescription>
                            What type of environment do you want to create?
                        </StyledInputDescription>
                        <EnvironmentTypeSelector
                            onChange={e => setType(e.currentTarget.value)}
                            value={type}
                        />
                        <StyledInputDescription>
                            Select which projects you want to clone the
                            environment configuration in?
                            <HelpIcon tooltip="The cloned environment will keep the feature toggle state for the selected projects, where it will be enabled by default." />
                        </StyledInputDescription>
                        <EnvironmentProjectSelect
                            projects={projects}
                            setProjects={setProjects}
                        />
                        <StyledInputDescription>
                            Keep the users permission for this environment?
                        </StyledInputDescription>
                        <StyledInputSecondaryDescription>
                            If you turn it off, the permission for this
                            environment across all projects and feature toggles
                            will remain only for admin and editor roles.
                        </StyledInputSecondaryDescription>
                        <FormControlLabel
                            label={clonePermissions ? 'Yes' : 'No'}
                            control={
                                <Switch
                                    onChange={e =>
                                        setClonePermissions(e.target.checked)
                                    }
                                    checked={clonePermissions}
                                />
                            }
                        />
                        <StyledSecondaryContainer>
                            <StyledInputDescription>
                                API Token
                            </StyledInputDescription>
                            <StyledInputSecondaryDescription>
                                In order to connect your SDKs to your newly
                                cloned environment, you will also need an API
                                token.{' '}
                                <Link
                                    href="https://docs.getunleash.io/reference/api-tokens-and-client-keys"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Read more about API tokens
                                </Link>
                                .
                            </StyledInputSecondaryDescription>
                            <FormControl>
                                <RadioGroup
                                    value={apiTokenGeneration}
                                    onChange={e =>
                                        setApiTokenGeneration(
                                            e.target.value as APITokenGeneration
                                        )
                                    }
                                    name="api-token-generation"
                                >
                                    <FormControlLabel
                                        value={APITokenGeneration.LATER}
                                        control={<Radio />}
                                        label="I want to generate an API token later"
                                    />
                                    <FormControlLabel
                                        value={APITokenGeneration.NOW}
                                        control={<Radio />}
                                        label="Generate an API token now"
                                    />
                                </RadioGroup>
                            </FormControl>
                            <StyledInlineContainer>
                                <StyledInputSecondaryDescription>
                                    A new Server-side SDK (CLIENT) API token
                                    will be generated for the cloned
                                    environment, so you can get started right
                                    away.
                                </StyledInputSecondaryDescription>
                                <ConditionallyRender
                                    condition={
                                        apiTokenGeneration ===
                                        APITokenGeneration.NOW
                                    }
                                    show={
                                        <>
                                            <StyledInputDescription>
                                                Which projects do you want this
                                                token to give access to?
                                            </StyledInputDescription>
                                            <SelectProjectInput
                                                options={selectableProjects}
                                                defaultValue={tokenProjects}
                                                onChange={setTokenProjects}
                                                error={errors.projects}
                                                onFocus={() =>
                                                    clearError(
                                                        ErrorField.PROJECTS
                                                    )
                                                }
                                            />
                                        </>
                                    }
                                />
                            </StyledInlineContainer>
                        </StyledSecondaryContainer>
                    </div>

                    <StyledButtonContainer>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={!isValid}
                        >
                            Clone environment
                        </Button>
                        <StyledCancelButton
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Cancel
                        </StyledCancelButton>
                    </StyledButtonContainer>
                </StyledForm>
            </FormTemplate>
        </SidebarModal>
    );
};
