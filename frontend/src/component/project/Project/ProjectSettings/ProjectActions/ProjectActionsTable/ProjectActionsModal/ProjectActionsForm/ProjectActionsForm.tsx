import { Alert, Button, Divider, Link, styled } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Input from 'component/common/Input/Input';
import { FormSwitch } from 'component/common/FormSwitch/FormSwitch';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    ActionsFilterState,
    ActionsActionState,
    ProjectActionsFormErrors,
} from './useProjectActionsForm';
import { useServiceAccounts } from 'hooks/api/getters/useServiceAccounts/useServiceAccounts';
import { useIncomingWebhooks } from 'hooks/api/getters/useIncomingWebhooks/useIncomingWebhooks';
import { v4 as uuidv4 } from 'uuid';
import { useMemo } from 'react';
import GeneralSelect, {} from 'component/common/GeneralSelect/GeneralSelect';
import { Add } from '@mui/icons-material';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { ProjectActionsActionItem } from './ProjectActionsActionItem';
import { ProjectActionsFilterItem } from './ProjectActionsFilterItem';
import { ProjectActionsFormStep } from './ProjectActionsFormStep';
import { IN } from 'constants/operators';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

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

const StyledButtonContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    marginTop: theme.spacing(1),
    gap: theme.spacing(1),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    margin: theme.spacing(3, 0),
    marginBottom: theme.spacing(2),
}));

const StyledTooltip = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

interface IProjectActionsFormProps {
    enabled: boolean;
    setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
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
    validated: boolean;
}

export const ProjectActionsForm = ({
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
    const projectId = useRequiredPathParam('projectId');
    const { serviceAccounts, loading: serviceAccountsLoading } =
        useServiceAccounts();
    const { incomingWebhooks, loading: incomingWebhooksLoading } =
        useIncomingWebhooks();

    const handleOnBlur = (callback: Function) => {
        setTimeout(() => callback(), 300);
    };

    const addFilter = () => {
        const id = uuidv4();
        setFilters((filters) => [
            ...filters,
            {
                id,
                parameter: '',
                operator: IN,
            },
        ]);
    };

    const updateInFilters = (updatedFilter: ActionsFilterState) => {
        setFilters((filters) =>
            filters.map((filter) =>
                filter.id === updatedFilter.id ? updatedFilter : filter,
            ),
        );
    };

    const addAction = (projectId: string) => {
        const id = uuidv4();
        const action: ActionsActionState = {
            id,
            action: '',
            sortOrder:
                actions
                    .map((a) => a.sortOrder)
                    .reduce((a, b) => Math.max(a, b), 0) + 1,
            executionParams: {
                project: projectId,
            },
        };
        setActions([...actions, action]);
    };

    const updateInActions = (updatedAction: ActionsActionState) => {
        setActions((actions) =>
            actions.map((action) =>
                action.id === updatedAction.id ? updatedAction : action,
            ),
        );
    };

    const incomingWebhookOptions = useMemo(() => {
        if (incomingWebhooksLoading) {
            return [];
        }

        return incomingWebhooks.map((webhook) => ({
            label: webhook.name,
            key: `${webhook.id}`,
        }));
    }, [incomingWebhooksLoading, incomingWebhooks]);

    const serviceAccountOptions = useMemo(() => {
        if (serviceAccountsLoading) {
            return [];
        }

        return serviceAccounts.map((sa) => ({
            label: sa.name,
            key: `${sa.id}`,
        }));
    }, [serviceAccountsLoading, serviceAccounts]);

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

            <ProjectActionsFormStep
                name='Trigger'
                resourceLink={
                    <RouterLink to='/integrations/incoming-webhooks'>
                        Create incoming webhook
                    </RouterLink>
                }
            >
                <GeneralSelect
                    label='Incoming webhook'
                    name='incoming-webhook'
                    options={incomingWebhookOptions}
                    value={`${sourceId}`}
                    onChange={(v) => {
                        setSourceId(parseInt(v));
                    }}
                />
            </ProjectActionsFormStep>

            <ProjectActionsFormStep name='When this' verticalConnector>
                {filters.map((filter, index) => (
                    <ProjectActionsFilterItem
                        key={filter.id}
                        index={index}
                        filter={filter}
                        stateChanged={updateInFilters}
                        onDelete={() =>
                            setFilters((filters) =>
                                filters.filter((f) => f.id !== filter.id),
                            )
                        }
                    />
                ))}
                <StyledButtonContainer>
                    <Button
                        startIcon={<Add />}
                        onClick={addFilter}
                        variant='outlined'
                        color='primary'
                    >
                        Add filter
                    </Button>
                    <HelpIcon
                        htmlTooltip
                        tooltip={
                            <StyledTooltip>
                                <p>
                                    Filters allow you to add conditions to the
                                    execution of the actions based on the source
                                    payload.
                                </p>
                                <p>
                                    If no filters are defined then the action
                                    will always be triggered from the selected
                                    source, no matter the payload.
                                </p>
                            </StyledTooltip>
                        }
                    />
                </StyledButtonContainer>
            </ProjectActionsFormStep>

            <ProjectActionsFormStep
                name='Do these actions'
                verticalConnector
                resourceLink={
                    <RouterLink to='/admin/service-accounts'>
                        Create service account
                    </RouterLink>
                }
            >
                <GeneralSelect
                    label='Service account'
                    name='service-account'
                    options={serviceAccountOptions}
                    value={`${actorId}`}
                    onChange={(v) => {
                        setActorId(parseInt(v));
                    }}
                />
                <StyledDivider />
                {actions.map((action, index) => (
                    <ProjectActionsActionItem
                        index={index}
                        key={action.id}
                        action={action}
                        stateChanged={updateInActions}
                        onDelete={() =>
                            setActions((actions) =>
                                actions.filter((a) => a.id !== action.id),
                            )
                        }
                    />
                ))}
                <StyledButtonContainer>
                    <Button
                        startIcon={<Add />}
                        onClick={() => addAction(projectId)}
                        variant='outlined'
                        color='primary'
                    >
                        Add action
                    </Button>
                </StyledButtonContainer>
            </ProjectActionsFormStep>

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
