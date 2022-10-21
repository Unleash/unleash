import { Alert, Button, styled, Typography } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { FormEvent, useEffect, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import Input from 'component/common/Input/Input';
import SelectMenu from 'component/common/select';
import { formatDateYMD } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { DateTimePicker } from 'component/common/DateTimePicker/DateTimePicker';
import { IEnvironment } from 'interfaces/environments';
import useEnvironmentApi from 'hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledInputDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
    marginBottom: theme.spacing(2),
}));

const StyledExpirationPicker = styled('div')<{ custom?: boolean }>(
    ({ theme, custom }) => ({
        display: 'flex',
        alignItems: custom ? 'start' : 'center',
        gap: theme.spacing(1.5),
        marginBottom: theme.spacing(2),
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
            alignItems: 'flex-start',
        },
    })
);

const StyledSelectMenu = styled(SelectMenu)(({ theme }) => ({
    minWidth: theme.spacing(20),
    marginRight: theme.spacing(0.5),
    [theme.breakpoints.down('sm')]: {
        width: theme.spacing(50),
    },
}));

const StyledDateTimePicker = styled(DateTimePicker)(({ theme }) => ({
    width: theme.spacing(28),
    [theme.breakpoints.down('sm')]: {
        width: theme.spacing(50),
    },
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(2),
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
    const { locationSettings } = useLocationSettings();

    const [name, setName] = useState('');
    const [errors, setErrors] = useState<ICreatePersonalAPITokenErrors>({});

    const clearError = (field: ErrorField) => {
        setErrors(errors => ({ ...errors, [field]: undefined }));
    };

    const setError = (field: ErrorField, error: string) => {
        setErrors(errors => ({ ...errors, [field]: error }));
    };

    // useEffect(() => {
    //     setDescription('');
    //     setErrors({});
    //     setExpiration(ExpirationOption['30DAYS']);
    // }, [open]);

    // TODO: Update this to the correct payload
    const getCloneEnvironmentPayload = () => ({
        name,
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
        // TODO: Update this to the correct endpoint
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/environments/clone/${environment.name}' \\
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
                description="TODO: Add description"
                documentationLink="TODO: Add link to documentation"
                documentationLinkLabel="Learn more"
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
