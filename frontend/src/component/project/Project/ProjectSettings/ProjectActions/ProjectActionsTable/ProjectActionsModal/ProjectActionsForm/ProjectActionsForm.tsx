import {
    Alert,
    Box,
    Button,
    IconButton,
    Link,
    Tooltip,
    styled,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Input from 'component/common/Input/Input';
import { Badge } from 'component/common/Badge/Badge';
import { FormSwitch } from 'component/common/FormSwitch/FormSwitch';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IAction, IActionSet } from 'interfaces/action';
import {
    IActionFilter,
    ProjectActionsFormErrors,
} from './useProjectActionsForm';
import { useServiceAccounts } from 'hooks/api/getters/useServiceAccounts/useServiceAccounts';
import { useIncomingWebhooks } from 'hooks/api/getters/useIncomingWebhooks/useIncomingWebhooks';
import { v4 as uuidv4 } from 'uuid';
import { Fragment, useMemo } from 'react';
import GeneralSelect, {} from 'component/common/GeneralSelect/GeneralSelect';
import { Add, Delete } from '@mui/icons-material';
import { useProjectEnvironments } from 'hooks/api/getters/useProjectEnvironments/useProjectEnvironments';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import mapValues from 'lodash.mapvalues';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';

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

const BoxSeparator = ({ text }: { text: string }) => {
    const StyledBoxContent = styled('div')(({ theme }) => ({
        padding: theme.spacing(0.75, 1),
        color: theme.palette.text.primary,
        fontSize: theme.fontSizes.smallerBody,
        backgroundColor: theme.palette.seen.primary,
        borderRadius: theme.shape.borderRadius,
        position: 'absolute',
        zIndex: theme.zIndex.fab,
        top: '50%',
        left: theme.spacing(2),
        transform: 'translateY(-50%)',
        lineHeight: 1,
    }));
    return (
        <Box
            sx={{
                height: 1.5,
                position: 'relative',
                width: '100%',
            }}
        >
            <StyledBoxContent>{text}</StyledBoxContent>
        </Box>
    );
};

const StyledInput = styled(Input)(({ theme }) => ({
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
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
}));

const StyledInnerBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
}));

const Step = ({ name, children }: any) => (
    <StyledBox>
        <StyledBadge color='secondary'>{name}</StyledBadge>
        {children}
    </StyledBox>
);

const Row = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
});

const Col = styled('div')({
    flex: 1,
    margin: '0 4px',
});

const StyledHeaderActions = styled('div')(({ theme }) => ({
    marginLeft: 'auto',
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
        display: 'none',
    },
}));

const Action = ({ action, index }: { action: IAction; index: number }) => {
    const { id, action: actionName } = action;
    const projectId = useRequiredPathParam('projectId');
    const environments = useProjectEnvironments(projectId);
    const { features } = useFeatureSearch(
        mapValues(
            {
                project: `IS:${projectId}`,
            },
            (value) => (value ? `${value}` : undefined),
        ),
        {},
    );
    return (
        <Fragment key={id}>
            <ConditionallyRender
                condition={index > 0}
                show={<BoxSeparator text='THEN' />}
            />
            <StyledInnerBox>
                <Row>
                    <span>Action {index + 1}</span>
                    <StyledHeaderActions>
                        <Tooltip title='Delete action' arrow>
                            <IconButton type='button' onClick={() => {}}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </StyledHeaderActions>
                </Row>
                <Row>
                    <Col>
                        <GeneralSelect
                            label='Action'
                            name='action'
                            options={[
                                {
                                    label: 'Enable flag',
                                    key: 'TOGGLE_FEATURE_ON',
                                },
                                {
                                    label: 'Disable flag',
                                    key: 'TOGGLE_FEATURE_OFF',
                                },
                            ]}
                            value={actionName}
                            onChange={() => {}}
                            fullWidth
                        />
                    </Col>
                    <Col>
                        <GeneralSelect
                            label='Environment'
                            name='environment'
                            options={environments.environments.map((env) => ({
                                label: env.name,
                                key: env.name,
                            }))}
                            value={action.executionParams.environment as string}
                            onChange={() => {}}
                            fullWidth
                        />
                    </Col>
                    <Col>
                        <GeneralSelect
                            label='Flag name'
                            name='flag'
                            options={features.map((feature) => ({
                                label: feature.name,
                                key: feature.name,
                            }))}
                            value={action.executionParams.featureName as string}
                            onChange={() => {}}
                            fullWidth
                        />
                    </Col>
                </Row>
            </StyledInnerBox>
        </Fragment>
    );
};
const Filter = ({
    filter,
    index,
}: { filter: IActionFilter; index: number }) => {
    const { id, parameter, value } = filter;
    return (
        <Fragment key={id}>
            <ConditionallyRender
                condition={index > 0}
                show={<BoxSeparator text='AND' />}
            />
            <StyledInnerBox>
                <Row>
                    <span>Filter {index + 1}</span>
                    <StyledHeaderActions>
                        <Tooltip title='Delete filter' arrow>
                            <IconButton type='button' onClick={() => {}}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </StyledHeaderActions>
                </Row>
                <Row>
                    <StyledInput
                        label='Parameter'
                        value={parameter}
                        onChange={() => {}}
                    />
                    <StyledBadge
                        sx={{
                            margin: '0 4px',
                        }}
                    >
                        =
                    </StyledBadge>
                    <StyledInput
                        label='Value'
                        value={value}
                        onChange={() => {}}
                    />
                </Row>
            </StyledInnerBox>
        </Fragment>
    );
};

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

    const addAction = () => {
        const action: IAction = {
            id: -1,
            createdAt: '',
            action: '',
            sortOrder:
                actions
                    .map((a) => a.sortOrder)
                    .reduce((a, b) => Math.max(a, b), 0) + 1,
            executionParams: {},
            createdByUserId: 0,
        };
        setActions([...actions, action]);
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

            <Step name='Trigger'>
                Remember to create an incoming webhook first from the
                integrations section.
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
                    <Filter index={index} filter={filter} />
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
                    <Action index={index} action={action} />
                ))}

                <hr />
                <Row>
                    <Button
                        type='button'
                        startIcon={<Add />}
                        onClick={addAction}
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
