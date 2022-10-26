import { Button, FormControlLabel, Link, styled, Switch } from '@mui/material';
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
import { SelectProjectInput } from 'component/admin/apiToken/ApiTokenForm/SelectProjectInput/SelectProjectInput';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import useApiTokensApi, {
    IApiTokenCreate,
} from 'hooks/api/actions/useApiTokensApi/useApiTokensApi';
import { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';

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

const StyledSeparator = styled('hr')(({ theme }) => ({
    border: 0,
    borderTop: `1px solid ${theme.palette.divider}`,
    margin: theme.spacing(4, 0),
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

enum ErrorField {
    NAME = 'name',
    PROJECTS = 'projects',
}

interface ICreatePersonalAPITokenErrors {
    [ErrorField.NAME]?: string;
    [ErrorField.PROJECTS]?: string;
}

interface ICreatePersonalAPITokenProps {
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
}: ICreatePersonalAPITokenProps) => {
    const { environments, refetchEnvironments } = useEnvironments();
    const { cloneEnvironment, loading } = useEnvironmentApi();
    const { createToken } = useApiTokensApi();
    const { projects: allProjects } = useProjects();
    const { setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const [name, setName] = useState(`${environment.name}-clone`);
    const [type, setType] = useState('development');
    const [projects, setProjects] = useState<string[]>([]);
    const [tokenProjects, setTokenProjects] = useState<string[]>(['*']);
    const [clonePermissions, setClonePermissions] = useState(true);
    const [errors, setErrors] = useState<ICreatePersonalAPITokenErrors>({});

    const clearError = (field: ErrorField) => {
        setErrors(errors => ({ ...errors, [field]: undefined }));
    };

    const setError = (field: ErrorField, error: string) => {
        setErrors(errors => ({ ...errors, [field]: error }));
    };

    useEffect(() => {
        setName(`${environment.name}-clone`);
        setType('development');
        setProjects([]);
        setTokenProjects(['*']);
        setClonePermissions(true);
        setErrors({});
    }, [environment]);

    const getCloneEnvironmentPayload = (): IEnvironmentClonePayload => ({
        name,
        type,
        projectsEnabled: projects,
        clonePermissions,
    });

    const getApiTokenCreatePayload = (): IApiTokenCreate => ({
        username: `${name}-token`,
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
            const response = await createToken(getApiTokenCreatePayload());
            const token = await response.json();
            newToken(token);
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
                description="Cloning an environment will clone all feature toggles and their configuration (strategies, segments, status, etc) into a new environment."
                documentationLink="https://docs.getunleash.io/user_guide/environments#cloning-environments"
                documentationLinkLabel="Cloning environments documentation"
                formatApiCode={formatApiCode}
            >
                <StyledForm onSubmit={handleSubmit}>
                    <div>
                        <StyledInputDescription>
                            What is your environment name? (Can't be changed
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
                            For what projects should the cloned environment be
                            enabled?
                            <HelpIcon tooltip="The cloned environment will be available in all existing projects but it will be automatically enabled in the selected ones" />
                        </StyledInputDescription>
                        <EnvironmentProjectSelect
                            projects={projects}
                            setProjects={setProjects}
                        />
                        <StyledInputDescription>
                            Keep the users permission to this environment?
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
                        <StyledSeparator />
                        <StyledInputDescription>
                            API Token
                        </StyledInputDescription>
                        <StyledInputSecondaryDescription>
                            A new Server-side SDK (CLIENT) API token will be
                            generated for the cloned environment, so you can get
                            started connecting to it right away.{' '}
                            <Link
                                href="https://docs.getunleash.io/reference/api-tokens-and-client-keys"
                                target="_blank"
                            >
                                Read more about API tokens
                            </Link>
                            .
                        </StyledInputSecondaryDescription>
                        <StyledInputDescription>
                            Which project do you want to give access to?
                        </StyledInputDescription>
                        <SelectProjectInput
                            options={selectableProjects}
                            defaultValue={tokenProjects}
                            onChange={setTokenProjects}
                            error={errors.projects}
                            onFocus={() => clearError(ErrorField.PROJECTS)}
                        />
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
