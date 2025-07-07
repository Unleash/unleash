import { Alert, Link, styled } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Input from 'component/common/Input/Input';
import { FormSwitch } from 'component/common/FormSwitch/FormSwitch';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type {
    ActionsFilterState,
    ActionsActionState,
    ProjectActionsFormErrors,
} from './useProjectActionsForm.ts';
import { useServiceAccounts } from 'hooks/api/getters/useServiceAccounts/useServiceAccounts';
import { ProjectActionsFormStepSource } from './ProjectActionsFormStep/ProjectActionsFormStepSource/ProjectActionsFormStepSource.tsx';
import { ProjectActionsFormStepActions } from './ProjectActionsFormStep/ProjectActionsFormStepActions/ProjectActionsFormStepActions.tsx';

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

const StyledInput = styled(Input)(() => ({
    width: '100%',
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

interface IProjectActionsFormProps {
    enabled: boolean;
    setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    sourceId: number;
    setSourceId: React.Dispatch<React.SetStateAction<number>>;
    filters: ActionsFilterState[];
    setFilters: React.Dispatch<React.SetStateAction<ActionsFilterState[]>>;
    actorId: number;
    setActorId: React.Dispatch<React.SetStateAction<number>>;
    actions: ActionsActionState[];
    setActions: React.Dispatch<React.SetStateAction<ActionsActionState[]>>;
    errors: ProjectActionsFormErrors;
    validateName: (name: string) => boolean;
    validateSourceId: (sourceId: number) => boolean;
    validateActorId: (actorId: number) => boolean;
    validated: boolean;
}

export const ProjectActionsForm = ({
    enabled,
    setEnabled,
    name,
    setName,
    description,
    setDescription,
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
    validateSourceId,
    validateActorId,
    validated,
}: IProjectActionsFormProps) => {
    const { serviceAccounts, loading: serviceAccountsLoading } =
        useServiceAccounts();

    const handleOnBlur = (callback: Function) => {
        setTimeout(() => callback(), 300);
    };

    const showErrors = validated && Object.values(errors).some(Boolean);

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
            <StyledInputDescription>
                What is your new action description?
            </StyledInputDescription>
            <StyledInput
                label='Action description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoComplete='off'
            />

            <ProjectActionsFormStepSource
                sourceId={sourceId}
                setSourceId={setSourceId}
                filters={filters}
                setFilters={setFilters}
                validateSourceId={validateSourceId}
            />

            <ProjectActionsFormStepActions
                serviceAccounts={serviceAccounts}
                serviceAccountsLoading={serviceAccountsLoading}
                actions={actions}
                setActions={setActions}
                actorId={actorId}
                setActorId={setActorId}
                validateActorId={validateActorId}
                validated={validated}
            />

            <ConditionallyRender
                condition={showErrors}
                show={() => (
                    <StyledAlert severity='error' icon={false}>
                        <ul>
                            {Object.values(errors)
                                .filter(Boolean)
                                .map((error) => (
                                    <li key={error}>{error}</li>
                                ))}
                        </ul>
                    </StyledAlert>
                )}
            />
        </div>
    );
};
