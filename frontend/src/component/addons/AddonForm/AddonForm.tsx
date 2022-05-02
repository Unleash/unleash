import {
    useState,
    useEffect,
    ChangeEvent,
    VFC,
    ChangeEventHandler,
    FormEventHandler,
    MouseEventHandler,
} from 'react';
import { TextField, FormControlLabel, Switch, Button } from '@mui/material';
import produce from 'immer';
import { styles as themeStyles } from 'component/common';
import { trim } from 'component/common/util';
import { IAddon, IAddonProvider } from 'interfaces/addons';
import { AddonParameters } from './AddonParameters/AddonParameters';
import { AddonEvents } from './AddonEvents/AddonEvents';
import cloneDeep from 'lodash.clonedeep';
import PageContent from 'component/common/PageContent/PageContent';
import { useHistory } from 'react-router-dom';
import useAddonsApi from 'hooks/api/actions/useAddonsApi/useAddonsApi';
import useToast from 'hooks/useToast';
import { makeStyles } from 'tss-react/mui';
import { formatUnknownError } from 'utils/formatUnknownError';

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
    const history = useHistory();
    const { classes: styles } = useStyles();

    const [formValues, setFormValues] = useState(initialValues);
    const [errors, setErrors] = useState<{
        containsErrors: boolean;
        parameters: Record<string, string>;
        events?: string;
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

    const setEventValue =
        (name: string) => (event: ChangeEvent<HTMLInputElement>) => {
            const newConfig = { ...formValues };
            if (event.target.checked) {
                newConfig.events.push(name);
            } else {
                newConfig.events = newConfig.events.filter(e => e !== name);
            }
            setFormValues(newConfig);
            setErrors({ ...errors, events: undefined });
        };

    const onCancel = () => {
        history.goBack();
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
                history.push('/addons');
                setToastData({
                    type: 'success',
                    title: 'Addon updated successfully',
                });
            } else {
                await createAddon(formValues);
                history.push('/addons');
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
        <PageContent headerContent={`Configure ${name} addon`}>
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
                    <AddonEvents
                        provider={provider}
                        checkedEvents={formValues.events}
                        setEventValue={setEventValue}
                        error={errors.events}
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
