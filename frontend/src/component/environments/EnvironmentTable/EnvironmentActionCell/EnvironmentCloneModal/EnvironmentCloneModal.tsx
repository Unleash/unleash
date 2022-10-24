import { Button, FormControlLabel, styled, Switch } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { FormEvent, useEffect, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import Input from 'component/common/Input/Input';
import { IEnvironment } from 'interfaces/environments';
import useEnvironmentApi from 'hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import EnvironmentTypeSelector from 'component/environments/EnvironmentForm/EnvironmentTypeSelector/EnvironmentTypeSelector';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { EnvironmentProjectSelect } from './EnvironmentProjectSelect/EnvironmentProjectSelect';

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledInputDescription = styled('p')(({ theme }) => ({
    display: 'flex',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
    '&:not(:first-child)': {
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
}

interface ICreatePersonalAPITokenErrors {
    [ErrorField.NAME]?: string;
}

interface ICreatePersonalAPITokenProps {
    environment: IEnvironment;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EnvironmentCloneModal = ({
    environment,
    open,
    setOpen,
}: ICreatePersonalAPITokenProps) => {
    const { environments, refetchEnvironments } = useEnvironments();
    const { cloneEnvironment, loading } = useEnvironmentApi();
    const { setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const [name, setName] = useState('');
    const [type, setType] = useState('development');
    const [projects, setProjects] = useState<string[]>([]);
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
        setClonePermissions(true);
        setErrors({});
    }, [environment]);

    const getCloneEnvironmentPayload = () => ({
        name,
        type,
        projectsEnabled: projects,
        clonePermissions,
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await cloneEnvironment(
                environment.name,
                getCloneEnvironmentPayload()
            );
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
    const isValid = isNameNotEmpty(name) && isNameUnique(name);

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

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label="Clone environment"
        >
            <FormTemplate
                loading={loading}
                modal
                title="Clone environment"
                description={`You are cloning the "${environment.name}" environment with all the feature toggles and all the strategies into a new environment.`}
                documentationLink="https://docs.getunleash.io/user_guide/environments"
                documentationLinkLabel="Environments documentation"
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
