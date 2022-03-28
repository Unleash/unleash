import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TextField, FormControlLabel, Switch, Button } from '@material-ui/core';
import { styles as commonStyles } from 'component/common';
import { trim } from 'component/common/util';
import { AddonParameters } from './AddonParameters/AddonParameters';
import { AddonEvents } from './AddonEvents/AddonEvents';
import cloneDeep from 'lodash.clonedeep';
import PageContent from 'component/common/PageContent/PageContent';
import { useHistory } from 'react-router-dom';
import useAddonsApi from 'hooks/api/actions/useAddonsApi/useAddonsApi';
import useToast from 'hooks/useToast';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
    nameInput: {
        marginRight: '1.5rem',
    },
    formSection: { padding: '10px 28px' },
}));

export const AddonForm = ({ editMode, provider, addon, fetch }) => {
    const { createAddon, updateAddon } = useAddonsApi();
    const { setToastData, setToastApiError } = useToast();
    const history = useHistory();
    const styles = useStyles();

    const [config, setConfig] = useState(addon);
    const [errors, setErrors] = useState({
        parameters: {},
    });
    const submitText = editMode ? 'Update' : 'Create';

    useEffect(() => {
        if (!provider) {
            fetch();
        }
    }, [fetch, provider]); // empty array => fetch only first time

    useEffect(() => {
        setConfig({ ...addon });
        /* eslint-disable-next-line */
    }, [addon.description, addon.provider]);

    useEffect(() => {
        if (provider && !config.provider) {
            setConfig({ ...addon, provider: provider.name });
        }
    }, [provider, addon, config.provider]);

    const setFieldValue = field => evt => {
        evt.preventDefault();
        const newConfig = { ...config };
        newConfig[field] = evt.target.value;
        setConfig(newConfig);
    };

    const onEnabled = evt => {
        evt.preventDefault();
        const enabled = !config.enabled;
        setConfig({ ...config, enabled });
    };

    const setParameterValue = param => evt => {
        evt.preventDefault();
        const newConfig = { ...config };
        newConfig.parameters[param] = evt.target.value;
        setConfig(newConfig);
    };

    const setEventValue = name => evt => {
        const newConfig = { ...config };
        if (evt.target.checked) {
            newConfig.events.push(name);
        } else {
            newConfig.events = newConfig.events.filter(e => e !== name);
        }
        setConfig(newConfig);
        setErrors({ ...errors, events: undefined });
    };

    const onCancel = () => {
        history.goBack();
    };

    const onSubmit = async evt => {
        evt.preventDefault();
        if (!provider) return;

        const updatedErrors = cloneDeep(errors);
        updatedErrors.containsErrors = false;

        // Validations
        if (config.events.length === 0) {
            updatedErrors.events = 'You must listen to at least one event';
            updatedErrors.containsErrors = true;
        }

        provider.parameters.forEach(p => {
            const value = trim(config.parameters[p.name]);
            if (p.required && !value) {
                updatedErrors.parameters[p.name] = 'This field is required';
                updatedErrors.containsErrors = true;
            }
        });

        if (updatedErrors.containsErrors) {
            setErrors(updatedErrors);
            return;
        }

        try {
            if (editMode) {
                await updateAddon(config);
                history.push('/addons');
                setToastData({
                    type: 'success',
                    title: 'Addon updated successfully',
                });
            } else {
                await createAddon(config);
                history.push('/addons');
                setToastData({
                    type: 'success',
                    confetti: true,
                    title: 'Addon created successfully',
                });
            }
        } catch (e) {
            setToastApiError({
                text: e.toString(),
            });
            setErrors({ parameters: {}, general: e.message });
        }
    };

    const {
        name,
        description,
        documentationUrl = 'https://unleash.github.io/docs/addons',
    } = provider ? provider : {};

    return (
        <PageContent headerContent={`Configure ${name} addon`}>
            <section className={styles.formSection}>
                {description}&nbsp;
                <a href={documentationUrl} target="_blank" rel="noreferrer">
                    Read more
                </a>
                <p className={commonStyles.error}>{errors.general}</p>
            </section>
            <form onSubmit={onSubmit}>
                <section className={styles.formSection}>
                    <TextField
                        size="small"
                        label="Provider"
                        name="provider"
                        value={config.provider}
                        disabled
                        variant="outlined"
                        className={styles.nameInput}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={config.enabled}
                                onChange={onEnabled}
                            />
                        }
                        label={config.enabled ? 'Enabled' : 'Disabled'}
                    />
                </section>
                <section className={styles.formSection}>
                    <TextField
                        size="small"
                        style={{ width: '80%' }}
                        rows={4}
                        multiline
                        label="Description"
                        name="description"
                        placeholder=""
                        value={config.description}
                        error={errors.description}
                        onChange={setFieldValue('description')}
                        variant="outlined"
                    />
                </section>
                <section className={styles.formSection}>
                    <AddonEvents
                        provider={provider}
                        checkedEvents={config.events}
                        setEventValue={setEventValue}
                        error={errors.events}
                    />
                </section>
                <section className={styles.formSection}>
                    <AddonParameters
                        provider={provider}
                        config={config}
                        errors={errors}
                        editMode={editMode}
                        setParameterValue={setParameterValue}
                    />
                </section>
                <section className={styles.formSection}>
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

AddonForm.propTypes = {
    provider: PropTypes.object,
    addon: PropTypes.object.isRequired,
    fetch: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired,
    editMode: PropTypes.bool.isRequired,
};
