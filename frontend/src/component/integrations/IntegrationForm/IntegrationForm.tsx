import {
    ChangeEventHandler,
    FormEventHandler,
    MouseEventHandler,
    useEffect,
    useState,
    VFC,
} from 'react';
import { Alert, Box, Button, Divider, Typography } from '@mui/material';
import produce from 'immer';
import { trim } from 'component/common/util';
import type { AddonSchema, AddonTypeSchema } from 'openapi';
import { IntegrationParameters } from './IntegrationParameters/IntegrationParameters';
import { IntegrationInstall } from './IntegrationInstall/IntegrationInstall';
import cloneDeep from 'lodash.clonedeep';
import { useNavigate } from 'react-router-dom';
import useAddonsApi from 'hooks/api/actions/useAddonsApi/useAddonsApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { IntegrationMultiSelector } from './IntegrationMultiSelector/IntegrationMultiSelector';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import {
    CREATE_ADDON,
    DELETE_ADDON,
    UPDATE_ADDON,
} from '../../providers/AccessProvider/permissions';
import {
    StyledForm,
    StyledAlerts,
    StyledHelpText,
    StyledTextField,
    StyledContainer,
    StyledButtonContainer,
    StyledButtonSection,
    StyledConfigurationSection,
} from './IntegrationForm.styles';
import { useTheme } from '@mui/system';
import { GO_BACK } from 'constants/navigate';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IntegrationDeleteDialog } from './IntegrationDeleteDialog/IntegrationDeleteDialog';
import { IntegrationStateSwitch } from './IntegrationStateSwitch/IntegrationStateSwitch';

type IntegrationFormProps = {
    provider?: AddonTypeSchema;
    fetch: () => void;
    editMode: boolean;
    addon: AddonSchema | Omit<AddonSchema, 'id'>;
};

export const IntegrationForm: VFC<IntegrationFormProps> = ({
    editMode,
    provider,
    addon: initialValues,
    fetch,
}) => {
    const { createAddon, updateAddon } = useAddonsApi();
    const { setToastData, setToastApiError } = useToast();
    const navigate = useNavigate();
    const theme = useTheme();
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const { projects: availableProjects } = useProjects();
    const selectableProjects = availableProjects.map(project => ({
        value: project.id,
        label: project.name,
    }));
    const { environments: availableEnvironments } = useEnvironments();
    const selectableEnvironments = availableEnvironments.map(environment => ({
        value: environment.name,
        label: environment.name,
    }));
    const selectableEvents = provider?.events?.map(event => ({
        value: event,
        label: event,
    }));
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
    const submitText = editMode ? 'Update' : 'Create';
    let url = `${uiConfig.unleashUrl}/api/admin/addons${
        editMode ? `/${(formValues as AddonSchema).id}` : ``
    }`;

    const formatApiCode = () => {
        return `curl --location --request ${
            editMode ? 'PUT' : 'POST'
        } '${url}' \\
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
        event => {
            event.preventDefault();
            setFormValues({ ...formValues, [field]: event.target.value });
        };

    const onEnabled: MouseEventHandler = event => {
        event.preventDefault();
        setFormValues(({ enabled }) => ({ ...formValues, enabled: !enabled }));
    };

    const setParameterValue =
        (param: string): ChangeEventHandler<HTMLInputElement> =>
        event => {
            event.preventDefault();
            const value =
                trim(event.target.value) === ''
                    ? undefined
                    : event.target.value;
            setFormValues(
                produce(draft => {
                    draft.parameters[param] = value;
                })
            );
        };

    const setEventValues = (events: string[]) => {
        setFormValues(
            produce(draft => {
                draft.events = events;
            })
        );
        setErrors(prev => ({
            ...prev,
            events: undefined,
        }));
    };
    const setProjects = (projects: string[]) => {
        setFormValues(
            produce(draft => {
                draft.projects = projects;
            })
        );
        setErrors(prev => ({
            ...prev,
            projects: undefined,
        }));
    };
    const setEnvironments = (environments: string[]) => {
        setFormValues(
            produce(draft => {
                draft.environments = environments;
            })
        );
        setErrors(prev => ({
            ...prev,
            environments: undefined,
        }));
    };

    const onCancel = () => {
        navigate(GO_BACK);
    };

    const onSubmit: FormEventHandler<HTMLFormElement> = async event => {
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

        provider.parameters?.forEach(parameterConfig => {
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
                navigate('/addons');
                setToastData({
                    type: 'success',
                    title: 'Addon updated successfully',
                });
            } else {
                await createAddon(formValues as Omit<AddonSchema, 'id'>);
                navigate('/addons');
                setToastData({
                    type: 'success',
                    confetti: true,
                    title: 'Addon created successfully',
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
        description,
        documentationUrl = 'https://unleash.github.io/docs/addons',
        installation,
        alerts,
    } = provider ? provider : ({} as Partial<AddonTypeSchema>);

    return (
        <FormTemplate
            title={
                <>
                    {submitText}{' '}
                    <Box
                        component="span"
                        sx={{
                            textTransform: 'capitalize',
                        }}
                    >
                        {name}
                    </Box>{' '}
                    integration
                </>
            }
            description={description || ''}
            documentationLink={documentationUrl}
            documentationLinkLabel="Addon documentation"
            formatApiCode={formatApiCode}
        >
            <StyledForm onSubmit={onSubmit}>
                <StyledContainer>
                    <StyledAlerts>
                        {alerts?.map(({ type, text }) => (
                            <Alert severity={type}>{text}</Alert>
                        ))}
                    </StyledAlerts>
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
                    <section>
                        <StyledTextField
                            size="small"
                            label="Provider"
                            name="provider"
                            value={formValues.provider}
                            disabled
                            hidden={true}
                            variant="outlined"
                        />
                        <IntegrationStateSwitch
                            checked={formValues.enabled}
                            onClick={onEnabled}
                        />
                    </section>
                    <section>
                        <StyledConfigurationSection>
                            <Typography
                                component="h3"
                                variant="h3"
                                sx={theme => ({
                                    marginBottom: theme.spacing(3),
                                })}
                            >
                                Configuration
                            </Typography>
                            <div>
                                <StyledHelpText>
                                    What is your integration description?
                                </StyledHelpText>

                                <StyledTextField
                                    size="small"
                                    minRows={2}
                                    multiline
                                    label="Description"
                                    name="description"
                                    placeholder=""
                                    value={formValues.description}
                                    error={Boolean(errors.description)}
                                    helperText={errors.description}
                                    onChange={setFieldValue('description')}
                                    variant="outlined"
                                />
                            </div>

                            <div>
                                <IntegrationMultiSelector
                                    options={selectableEvents || []}
                                    selectedItems={formValues.events}
                                    onChange={setEventValues}
                                    entityName="event"
                                    selectAllEnabled={false}
                                    error={errors.events}
                                    description="Select what events you want your integration to be notified about."
                                    required
                                />
                            </div>
                            <div>
                                <IntegrationMultiSelector
                                    options={selectableProjects}
                                    selectedItems={formValues.projects || []}
                                    onChange={setProjects}
                                    entityName="project"
                                    selectAllEnabled={true}
                                />
                            </div>
                            <div>
                                <IntegrationMultiSelector
                                    options={selectableEnvironments}
                                    selectedItems={
                                        formValues.environments || []
                                    }
                                    onChange={setEnvironments}
                                    entityName="environment"
                                    selectAllEnabled={true}
                                />
                            </div>
                        </StyledConfigurationSection>
                    </section>
                    <div>
                        <IntegrationParameters
                            provider={provider}
                            config={formValues as AddonSchema}
                            parametersErrors={errors.parameters}
                            editMode={editMode}
                            setParameterValue={setParameterValue}
                        />
                    </div>
                </StyledContainer>
                <Divider />
                <StyledButtonContainer>
                    <StyledButtonSection theme={theme}>
                        <PermissionButton
                            type="submit"
                            color="primary"
                            variant="contained"
                            permission={editMode ? UPDATE_ADDON : CREATE_ADDON}
                        >
                            {submitText}
                        </PermissionButton>
                        <Button type="button" onClick={onCancel}>
                            Cancel
                        </Button>
                        <ConditionallyRender
                            condition={Boolean(
                                uiConfig?.flags?.integrationsRework && editMode
                            )}
                            show={() => (
                                <>
                                    <PermissionButton
                                        type="button"
                                        variant="text"
                                        color="error"
                                        permission={DELETE_ADDON}
                                        onClick={e => {
                                            e.preventDefault();
                                            setDeleteOpen(true);
                                        }}
                                    >
                                        Delete
                                    </PermissionButton>
                                    <IntegrationDeleteDialog
                                        id={(formValues as AddonSchema).id}
                                        isOpen={isDeleteOpen}
                                        onClose={() => {
                                            setDeleteOpen(false);
                                        }}
                                    />
                                </>
                            )}
                        />
                    </StyledButtonSection>
                </StyledButtonContainer>
            </StyledForm>
        </FormTemplate>
    );
};
