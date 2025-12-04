import {
    type ChangeEventHandler,
    type FormEventHandler,
    type MouseEventHandler,
    useContext,
    useEffect,
    useState,
    type FC,
} from 'react';
import {
    Alert,
    Button,
    Divider,
    Link,
    styled,
    Typography,
} from '@mui/material';
import produce from 'immer';
import { trim } from 'component/common/util';
import type { AddonSchema, AddonTypeSchema } from 'openapi';
import { IntegrationParameters } from './IntegrationParameters/IntegrationParameters.tsx';
import { IntegrationInstall } from './IntegrationInstall/IntegrationInstall.tsx';
import cloneDeep from 'lodash.clonedeep';
import { useNavigate } from 'react-router-dom';
import useAddonsApi from 'hooks/api/actions/useAddonsApi/useAddonsApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { IntegrationMultiSelector } from './IntegrationMultiSelector/IntegrationMultiSelector.tsx';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import {
    CREATE_ADDON,
    UPDATE_ADDON,
} from '../../providers/AccessProvider/permissions.ts';
import {
    StyledForm,
    StyledAlerts,
    StyledTextField,
    StyledContainer,
    StyledButtonContainer,
    StyledButtonSection,
    StyledConfigurationSection,
    StyledTitle,
    StyledRaisedSection,
} from './IntegrationForm.styles';
import { GO_BACK } from 'constants/navigate';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IntegrationDelete } from './IntegrationDelete/IntegrationDelete.tsx';
import { IntegrationStateSwitch } from './IntegrationStateSwitch/IntegrationStateSwitch.tsx';
import { capitalizeFirst } from 'utils/capitalizeFirst';
import { IntegrationHowToSection } from '../IntegrationHowToSection/IntegrationHowToSection.tsx';
import { IntegrationEventsModal } from '../IntegrationEvents/IntegrationEventsModal.tsx';
import AccessContext from 'contexts/AccessContext';

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.fontSizes.mainHeader,
}));

const StyledHeaderTitle = styled('h1')({
    fontWeight: 'normal',
});

type IntegrationFormProps = {
    provider?: AddonTypeSchema;
    fetch: () => void;
    editMode: boolean;
    addon: AddonSchema | Omit<AddonSchema, 'id'>;
};

export const IntegrationForm: FC<IntegrationFormProps> = ({
    editMode,
    provider,
    addon: initialValues,
    fetch,
}) => {
    const { createAddon, updateAddon } = useAddonsApi();
    const { setToastData, setToastApiError } = useToast();
    const navigate = useNavigate();
    const { projects: availableProjects } = useProjects();
    const selectableProjects = availableProjects.map((project) => ({
        value: project.id,
        label: project.name,
    }));
    const { environments: availableEnvironments } = useEnvironments();
    const selectableEnvironments = availableEnvironments.map((environment) => ({
        value: environment.name,
        label: environment.name,
    }));
    const selectableEvents = provider?.events
        ?.map((event) => ({
            value: event,
            label: event,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    const { uiConfig } = useUiConfig();
    const [formValues, setFormValues] = useState(initialValues);
    const [errors, setErrors] = useState<{
        containsErrors: boolean;
        parameters: Record<string, string>;
        events?: string;
        projects?: string;
        environments?: string;
        general?: string;
        description?: string;
    }>({
        containsErrors: false,
        parameters: {},
    });
    const [eventsModalOpen, setEventsModalOpen] = useState(false);
    const { isAdmin } = useContext(AccessContext);

    const submitText = editMode ? 'Update' : 'Create';
    const url = `${uiConfig.unleashUrl}/api/admin/addons${
        editMode ? `/${(formValues as AddonSchema).id}` : ``
    }`;

    const formatApiCode = () => {
        return `curl --location --request ${editMode ? 'PUT' : 'POST'} '${url}' \\
        --header 'Authorization: INSERT_API_KEY' \\
        --header 'Content-Type: application/json' \\
        --data-raw '${JSON.stringify(formValues, undefined, 2)}'`;
    };

    useEffect(() => {
        if (!provider) {
            fetch();
        }
    }, [fetch, provider]); // empty array => fetch only first time

    useEffect(() => {
        setFormValues({ ...initialValues });
        /* eslint-disable-next-line */
    }, [initialValues.description, initialValues.provider]);

    useEffect(() => {
        if (provider && !formValues.provider) {
            setFormValues({ ...initialValues, provider: provider.name });
        }
    }, [provider, initialValues, formValues.provider]);

    const setFieldValue =
        (field: string): ChangeEventHandler<HTMLInputElement> =>
        (event) => {
            event.preventDefault();
            setFormValues({ ...formValues, [field]: event.target.value });
        };

    const onEnabled: MouseEventHandler = (event) => {
        event.preventDefault();
        setFormValues(({ enabled }) => ({ ...formValues, enabled: !enabled }));
    };

    const setParameterValue =
        (param: string): ChangeEventHandler<HTMLInputElement> =>
        (event) => {
            event.preventDefault();
            const value =
                trim(event.target.value) === ''
                    ? undefined
                    : event.target.value;
            setFormValues(
                produce((draft) => {
                    if (value === undefined) {
                        delete draft.parameters[param];
                    } else {
                        draft.parameters[param] = value;
                    }
                }),
            );
        };

    const setEventValues = (events: string[]) => {
        setFormValues(
            produce((draft) => {
                draft.events = events;
            }),
        );
        setErrors((prev) => ({
            ...prev,
            events: undefined,
        }));
    };
    const setProjects = (projects: string[]) => {
        setFormValues(
            produce((draft) => {
                draft.projects = projects;
            }),
        );
        setErrors((prev) => ({
            ...prev,
            projects: undefined,
        }));
    };
    const setEnvironments = (environments: string[]) => {
        setFormValues(
            produce((draft) => {
                draft.environments = environments;
            }),
        );
        setErrors((prev) => ({
            ...prev,
            environments: undefined,
        }));
    };

    const onCancel = () => {
        navigate(GO_BACK);
    };

    const onSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        if (!provider) {
            return;
        }

        const updatedErrors = cloneDeep(errors);
        updatedErrors.parameters = {};
        updatedErrors.containsErrors = false;

        // Validations
        if (formValues.events.length === 0) {
            updatedErrors.events = 'You must listen to at least one event';
            updatedErrors.containsErrors = true;
        }

        provider.parameters?.forEach((parameterConfig) => {
            let value = formValues.parameters[parameterConfig.name];
            value = typeof value === 'string' ? trim(value) : value;
            if (parameterConfig.required && !value) {
                updatedErrors.parameters[parameterConfig.name] =
                    'This field is required';
                updatedErrors.containsErrors = true;
            }
        });

        if (updatedErrors.containsErrors) {
            setErrors(updatedErrors);
            return;
        }

        try {
            if (editMode) {
                await updateAddon(formValues as AddonSchema);
                navigate('/integrations');
                setToastData({
                    type: 'success',
                    text: 'Integration updated',
                });
            } else {
                await createAddon(formValues as Omit<AddonSchema, 'id'>);
                navigate('/integrations');
                setToastData({
                    type: 'success',
                    text: 'Integration created',
                });
            }
        } catch (error) {
            const message = formatUnknownError(error);
            setToastApiError(message);
            setErrors({
                parameters: {},
                general: message,
                containsErrors: true,
            });
        }
    };

    const {
        name,
        displayName,
        description,
        documentationUrl = 'https://docs.getunleash.io/integrate',
        installation,
        alerts,
    } = provider ? provider : ({} as Partial<AddonTypeSchema>);

    return (
        <FormTemplate
            description={description || ''}
            documentationLink={documentationUrl}
            documentationLinkLabel={`${
                displayName || capitalizeFirst(`${name} `)
            } documentation`}
            formatApiCode={formatApiCode}
            footer={
                <StyledButtonContainer>
                    <StyledButtonSection>
                        <PermissionButton
                            type='submit'
                            color='primary'
                            variant='contained'
                            permission={editMode ? UPDATE_ADDON : CREATE_ADDON}
                            onClick={onSubmit}
                        >
                            {submitText}
                        </PermissionButton>
                        <Button type='button' onClick={onCancel}>
                            Cancel
                        </Button>
                    </StyledButtonSection>
                </StyledButtonContainer>
            }
        >
            <StyledHeader>
                <StyledHeaderTitle>
                    {submitText}{' '}
                    {displayName || (name ? capitalizeFirst(name) : '')}{' '}
                    integration
                </StyledHeaderTitle>
                <ConditionallyRender
                    condition={editMode && isAdmin}
                    show={
                        <Link onClick={() => setEventsModalOpen(true)}>
                            View events
                        </Link>
                    }
                />
            </StyledHeader>
            <StyledForm onSubmit={onSubmit}>
                <StyledContainer>
                    <ConditionallyRender
                        condition={Boolean(alerts)}
                        show={() => (
                            <StyledAlerts>
                                {alerts?.map(({ type, text }) => (
                                    <Alert severity={type} key={text}>
                                        {text}
                                    </Alert>
                                ))}
                            </StyledAlerts>
                        )}
                    />
                    <StyledTextField
                        size='small'
                        label='Provider'
                        name='provider'
                        value={formValues.provider}
                        disabled
                        hidden={true}
                        variant='outlined'
                    />
                    <IntegrationHowToSection provider={provider} />
                    <StyledRaisedSection>
                        <IntegrationStateSwitch
                            checked={formValues.enabled}
                            onClick={onEnabled}
                        />
                    </StyledRaisedSection>
                    <StyledRaisedSection>
                        <ConditionallyRender
                            condition={Boolean(installation)}
                            show={() => (
                                <IntegrationInstall
                                    url={installation!.url}
                                    title={installation!.title}
                                    helpText={installation!.helpText}
                                />
                            )}
                        />
                        <IntegrationParameters
                            provider={provider}
                            config={formValues as AddonSchema}
                            parametersErrors={errors.parameters}
                            editMode={editMode}
                            setParameterValue={setParameterValue}
                        />
                    </StyledRaisedSection>
                    <StyledConfigurationSection>
                        <Typography component='h3' variant='h3'>
                            Configuration
                        </Typography>
                        <div>
                            <StyledTitle>
                                What is your integration description?
                            </StyledTitle>
                            <StyledTextField
                                size='small'
                                minRows={1}
                                multiline
                                label='Description'
                                name='description'
                                placeholder=''
                                value={formValues.description}
                                error={Boolean(errors.description)}
                                helperText={errors.description}
                                onChange={setFieldValue('description')}
                                variant='outlined'
                            />
                        </div>

                        <div>
                            <IntegrationMultiSelector
                                options={selectableEvents || []}
                                selectedItems={formValues.events}
                                onChange={setEventValues}
                                entityName='event'
                                error={errors.events}
                                description='Select which events you want your integration to be notified about.'
                                required
                            />
                        </div>
                        <div>
                            <IntegrationMultiSelector
                                options={selectableProjects}
                                selectedItems={formValues.projects || []}
                                onChange={setProjects}
                                entityName='project'
                                description='Selecting project(s) will filter events, so that your integration only receives events related to those specific projects.'
                                note='If no projects are selected, the integration will receive events from all projects.'
                            />
                        </div>
                        <div>
                            <IntegrationMultiSelector
                                options={selectableEnvironments}
                                selectedItems={formValues.environments || []}
                                onChange={setEnvironments}
                                entityName='environment'
                                description='Selecting environment(s) will filter events, so that your integration only receives events related to those specific environments. Global events that are not specific to an environment will still be received.'
                                note='If no environments are selected, the integration will receive events from all environments.'
                            />
                        </div>
                    </StyledConfigurationSection>
                    <ConditionallyRender
                        condition={editMode}
                        show={
                            <>
                                <Divider />
                                <section>
                                    <IntegrationDelete
                                        id={(formValues as AddonSchema).id}
                                    />
                                </section>
                            </>
                        }
                    />
                </StyledContainer>
            </StyledForm>
            <IntegrationEventsModal
                addon={initialValues as AddonSchema}
                open={eventsModalOpen}
                setOpen={setEventsModalOpen}
            />
        </FormTemplate>
    );
};
