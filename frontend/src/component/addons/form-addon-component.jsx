import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TextField, FormControlLabel, Switch } from '@material-ui/core';

import { FormButtons, styles as commonStyles } from '../common';
import { trim } from '../common/util';
import AddonParameters from './form-addon-parameters';
import AddonEvents from './form-addon-events';
import cloneDeep from 'lodash.clonedeep';

import styles from './form-addon-component.module.scss';
import PageContent from '../common/PageContent/PageContent';

const AddonFormComponent = ({ editMode, provider, addon, fetch, cancel, submit }) => {
    const [config, setConfig] = useState(addon);
    const [errors, setErrors] = useState({
        parameters: {},
    });
    const submitText = editMode ? 'Update' : 'Create';

    useEffect(() => {
        if (!provider) {
            fetch();
        }
    }, []); // empty array => fetch only first time

    useEffect(() => {
        setConfig({ ...addon });
    }, [addon.id]);

    useEffect(() => {
        if (provider && !config.provider) {
            setConfig({ ...addon, provider: provider.name });
        }
    }, [provider]);

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
            await submit(config);
        } catch (e) {
            setErrors({ parameters: {}, general: e.message });
        }
    };

    const { name, description, documentationUrl = 'https://unleash.github.io/docs/addons' } = provider ? provider : {};

    return (
        <PageContent headerContent={`Configure ${name} addon`}>
            <section className={styles.formSection}>
                {description}&nbsp;
                <a href={documentationUrl} target="_blank">
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
                        control={<Switch checked={config.enabled} onChange={onEnabled} />}
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
                    <FormButtons submitText={submitText} onCancel={cancel} />
                </section>
            </form>
        </PageContent>
    );
};

AddonFormComponent.propTypes = {
    provider: PropTypes.object,
    addon: PropTypes.object.isRequired,
    fetch: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default AddonFormComponent;
