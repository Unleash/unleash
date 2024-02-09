import { Alert, Box, Button, Link, styled } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Input from 'component/common/Input/Input';
import { Badge } from 'component/common/Badge/Badge';
import { FormSwitch } from 'component/common/FormSwitch/FormSwitch';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IActionSet } from 'interfaces/action';
import {
    IActionFilter,
    ProjectActionsFormErrors,
} from './useProjectActionsForm';
import { useServiceAccounts } from 'hooks/api/getters/useServiceAccounts/useServiceAccounts';
import { useIncomingWebhooks } from 'hooks/api/getters/useIncomingWebhooks/useIncomingWebhooks';
import { v4 as uuidv4 } from 'uuid';
import { useMemo } from 'react';
import GeneralSelect, {} from 'component/common/GeneralSelect/GeneralSelect';
import { Add } from '@mui/icons-material';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { Row } from './InnerContainerBox';
import { Action, UIAction } from './ActionItem';
import { Filter } from './FilterItem';

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

const StyledBadge = styled(Badge)(({ theme }) => ({
    color: 'primary',
    margin: 'auto',
    marginBottom: theme.spacing(1.5),
}));

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.elevation1,
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusMedium,
}));

const Step = ({ name, children }: any) => (
    <StyledBox>
        <StyledBadge color='secondary'>{name}</StyledBadge>
        {children}
    </StyledBox>
);

interface IProjectActionsFormProps {
    action?: IActionSet;
    enabled: boolean;
    setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    sourceId: number;
    setSourceId: React.Dispatch<React.SetStateAction<number>>;
    filters: IActionFilter[];
    setFilters: React.Dispatch<React.SetStateAction<IActionFilter[]>>;
    actorId: number;
    setActorId: React.Dispatch<React.SetStateAction<number>>;
    actions: UIAction[];
    setActions: React.Dispatch<React.SetStateAction<UIAction[]>>;
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
                value: '',
            },
        ]);
    };

    const updateInFilters = (updatedFilter: IActionFilter) => {
        setFilters((filters) =>
            filters.map((filter) =>
                filter.id === updatedFilter.id ? updatedFilter : filter,
            ),
        );
    };

    const addAction = (projectId: string) => {
        const id = uuidv4();
        const action: UIAction = {
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

    const updateInActions = (updatedAction: UIAction) => {
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
    const projectId = useRequiredPathParam('projectId');
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

            <Step name='Trigger'>
                <StyledInputDescription>
                    Create incoming webhooks from&nbsp;
                    <RouterLink to='/integrations/incoming-webhooks'>
                        integrations section
                    </RouterLink>
                    .
                </StyledInputDescription>
                <GeneralSelect
                    label='Incoming webhook'
                    name='incoming-webhook'
                    options={incomingWebhookOptions}
                    value={`${sourceId}`}
                    onChange={(v) => {
                        setSourceId(parseInt(v));
                    }}
                />
            </Step>

            <Step name='When this'>
                {filters.map((filter, index) => (
                    <Filter
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

                <hr />
                <Row>
                    <Button
                        type='button'
                        startIcon={<Add />}
                        onClick={addFilter}
                        variant='outlined'
                        color='primary'
                    >
                        Add filter
                    </Button>
                </Row>
            </Step>

            <Step name='Do these action(s)'>
                <StyledInputDescription>
                    Create service accounts from&nbsp;
                    <RouterLink to='/admin/service-accounts'>
                        service accounts section
                    </RouterLink>
                    .
                </StyledInputDescription>
                <GeneralSelect
                    label='Service account'
                    name='service-account'
                    options={serviceAccountOptions}
                    value={`${actorId}`}
                    onChange={(v) => {
                        setActorId(parseInt(v));
                    }}
                />
                <hr />
                {actions.map((action, index) => (
                    <Action
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
                <hr />
                <Row>
                    <Button
                        type='button'
                        startIcon={<Add />}
                        onClick={() => addAction(projectId)}
                        variant='outlined'
                        color='primary'
                    >
                        Add action
                    </Button>
                </Row>
            </Step>

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
