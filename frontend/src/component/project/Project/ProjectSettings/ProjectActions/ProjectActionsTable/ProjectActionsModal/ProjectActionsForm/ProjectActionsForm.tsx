import { Alert, Link, styled } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Input from 'component/common/Input/Input';
import { FormSwitch } from 'component/common/FormSwitch/FormSwitch';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IAction, IActionSet } from 'interfaces/action';
import { ProjectActionsFormErrors } from './useProjectActionsForm';
import { useServiceAccounts } from 'hooks/api/getters/useServiceAccounts/useServiceAccounts';

const StyledServiceAccountAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(4),
}));

const StyledRaisedSection = styled('div')(({ theme }) => ({
    background: theme.palette.background.elevation1,
    padding: theme.spacing(2, 3),
    borderRadius: theme.shape.borderRadiusLarge,
    marginBottom: theme.spacing(4),
}));

const StyledInputDescription = styled('p')(({ theme }) => ({
    display: 'flex',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
    '&:not(:first-of-type)': {
        marginTop: theme.spacing(3),
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

const StyledSecondarySection = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.elevation2,
    borderRadius: theme.shape.borderRadiusMedium,
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
}));

const StyledInlineContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 4),
    '& > p:not(:first-of-type)': {
        marginTop: theme.spacing(2),
    },
}));

interface IProjectActionsFormProps {
    action?: IActionSet;
    enabled: boolean;
    setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    sourceId: number;
    setSourceId: React.Dispatch<React.SetStateAction<number>>;
    filters: Record<string, unknown>;
    setFilters: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
    actorId: number;
    setActorId: React.Dispatch<React.SetStateAction<number>>;
    actions: IAction[];
    setActions: React.Dispatch<React.SetStateAction<IAction[]>>;
    errors: ProjectActionsFormErrors;
    validateName: (name: string) => boolean;
    validated: boolean;
}

export const ProjectActionsForm = ({
    action,
    enabled,
    setEnabled,
    name,
    setName,
    sourceId,
    setSourceId,
    filters,
    setFilters,
    actorId,
    setActorId,
    actions,
    setActions,
    errors,
    validateName,
    validated,
}: IProjectActionsFormProps) => {
    const { serviceAccounts } = useServiceAccounts();

    const handleOnBlur = (callback: Function) => {
        setTimeout(() => callback(), 300);
    };

    const showErrors = validated && Object.values(errors).some(Boolean);

    // TODO: Need to add the remaining fields. Refer to the design

    return (
        <div>
            <ConditionallyRender
                condition={serviceAccounts.length === 0}
                show={
                    <StyledServiceAccountAlert color='warning'>
                        <strong>Heads up!</strong> In order to create an action
                        you need to create a service account first. Please{' '}
                        <Link
                            to='/admin/service-accounts'
                            component={RouterLink}
                        >
                            go ahead and create one
                        </Link>
                        .
                    </StyledServiceAccountAlert>
                }
            />
            <StyledRaisedSection>
                <FormSwitch checked={enabled} setChecked={setEnabled}>
                    Action status
                </FormSwitch>
            </StyledRaisedSection>
            <StyledInputDescription>
                What is your new action name?
            </StyledInputDescription>
            <StyledInput
                autoFocus
                label='Action name'
                error={Boolean(errors.name)}
                errorText={errors.name}
                value={name}
                onChange={(e) => {
                    validateName(e.target.value);
                    setName(e.target.value);
                }}
                onBlur={(e) => handleOnBlur(() => validateName(e.target.value))}
                autoComplete='off'
            />
            <ConditionallyRender
                condition={showErrors}
                show={() => (
                    <Alert severity='error' icon={false}>
                        <ul>
                            {Object.values(errors)
                                .filter(Boolean)
                                .map((error) => (
                                    <li key={error}>{error}</li>
                                ))}
                        </ul>
                    </Alert>
                )}
            />
        </div>
    );
};
