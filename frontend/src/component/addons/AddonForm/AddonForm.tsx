import React, {
    ChangeEventHandler,
    FormEventHandler,
    MouseEventHandler,
    useEffect,
    useState,
    VFC,
} from 'react';
import { Button, FormControlLabel, Switch, TextField } from '@mui/material';
import produce from 'immer';
import { styles as themeStyles } from 'component/common';
import { trim } from 'component/common/util';
import { IAddon, IAddonProvider } from 'interfaces/addons';
import { AddonParameters } from './AddonParameters/AddonParameters';
import cloneDeep from 'lodash.clonedeep';
import { PageContent } from 'component/common/PageContent/PageContent';
import { useNavigate } from 'react-router-dom';
import useAddonsApi from 'hooks/api/actions/useAddonsApi/useAddonsApi';
import useToast from 'hooks/useToast';
import { makeStyles } from 'tss-react/mui';
import { formatUnknownError } from 'utils/formatUnknownError';
import useProjects from '../../../hooks/api/getters/useProjects/useProjects';
import { useEnvironments } from '../../../hooks/api/getters/useEnvironments/useEnvironments';
import { AddonMultiSelector } from './AddonMultiSelector/AddonMultiSelector';

const useStyles = makeStyles()(theme => ({
    nameInput: {
        marginRight: '1.5rem',
    },
    formSection: { padding: '10px 28px' },
    buttonsSection: {
        padding: '10px 28px',
        '& > *': {
            marginRight: theme.spacing(1),
        },
    },
}));

interface IAddonFormProps {
    provider?: IAddonProvider;
    addon: IAddon;
    fetch: () => void;
    editMode: boolean;
}

export const AddonForm: VFC<IAddonFormProps> = ({
    editMode,
    provider,
    addon: initialValues,
    fetch,
}) => {
    const { createAddon, updateAddon } = useAddonsApi();
    const { setToastData, setToastApiError } = useToast();
    const navigate = useNavigate();
    const { classes: styles } = useStyles();
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
    const selectableEvents = provider?.events.map(event => ({
        value: event,
        label: event,
    }));
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
            setFormValues(
                produce(draft => {
                    draft.parameters[param] = event.target.value;
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
        navigate(-1);
    };

    const onSubmit: FormEventHandler<HTMLFormElement> = async event => {
        event.preventDefault();
        if (!provider) return;

        const updatedErrors = cloneDeep(errors);
        updatedErrors.containsErrors = false;

        // Validations
        if (formValues.events.length === 0) {
            updatedErrors.events = 'You must listen to at least one event';
            updatedErrors.containsErrors = true;
        }

        provider.parameters.forEach(parameterConfig => {
            const value = trim(formValues.parameters[parameterConfig.name]);
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
                await updateAddon(formValues);
                navigate('/addons');
                setToastData({
                    type: 'success',
                    title: 'Addon updated successfully',
                });
            } else {
                await createAddon(formValues);
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
    } = provider ? provider : ({} as Partial<IAddonProvider>);

    return (
        <PageContent header={`Configure ${name} addon`}>
            <section className={styles.formSection}>
                {description}&nbsp;
                <a href={documentationUrl} target="_blank" rel="noreferrer">
                    Read more
                </a>
                <p className={themeStyles.error}>{errors.general}</p>
            </section>
            <form onSubmit={onSubmit}>
                <section className={styles.formSection}>
                    <TextField
                        size="small"
                        label="Provider"
                        name="provider"
                        value={formValues.provider}
                        disabled
                        variant="outlined"
                        className={styles.nameInput}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formValues.enabled}
                                onClick={onEnabled}
                            />
                        }
                        label={formValues.enabled ? 'Enabled' : 'Disabled'}
                    />
                </section>
                <section className={styles.formSection}>
                    <TextField
                        size="small"
                        style={{ width: '80%' }}
                        minRows={4}
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
                </section>

                <section className={styles.formSection}>
                    <AddonMultiSelector
                        options={selectableEvents || []}
                        selectedItems={formValues.events}
                        onChange={setEventValues}
                        entityName={'event'}
                        selectAllEnabled={false}
                    />
                </section>
                <section className={styles.formSection}>
                    <AddonMultiSelector
                        options={selectableProjects}
                        selectedItems={formValues.projects || []}
                        onChange={setProjects}
                        entityName={'project'}
                        selectAllEnabled={true}
                    />
                </section>
                <section className={styles.formSection}>
                    <AddonMultiSelector
                        options={selectableEnvironments}
                        selectedItems={formValues.environments || []}
                        onChange={setEnvironments}
                        entityName={'environment'}
                        selectAllEnabled={true}
                    />
                </section>
                <section className={styles.formSection}>
                    <AddonParameters
                        provider={provider}
                        config={formValues}
                        parametersErrors={errors.parameters}
                        editMode={editMode}
                        setParameterValue={setParameterValue}
                    />
                </section>
                <section className={styles.buttonsSection}>
                    <Button type="submit" color="primary" variant="contained">
                        {submitText}
                    </Button>
                    <Button type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                </section>
            </form>
        </PageContent>
    );
};
