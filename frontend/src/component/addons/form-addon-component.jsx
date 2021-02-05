import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Textfield, Card, CardTitle, CardText, CardActions, Switch, Grid, Cell } from 'react-mdl';

import { FormButtons, styles as commonStyles } from '../common';
import { trim } from '../common/util';
import AddonParameters from './form-addon-parameters';
import AddonEvents from './form-addon-events';
import { cloneDeep } from 'lodash';

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
        <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
            <CardTitle style={{ paddingTop: '24px', paddingBottom: '0', wordBreak: 'break-all' }}>
                Configure {name}
            </CardTitle>
            <CardText>
                {description}&nbsp;
                <a href={documentationUrl} target="_blank">
                    Read more
                </a>
                <p className={commonStyles.error}>{errors.general}</p>
            </CardText>
            <form onSubmit={onSubmit}>
                <section style={{ padding: '16px' }}>
                    <Grid noSpacing>
                        <Cell col={4}>
                            <Textfield
                                floatingLabel
                                label="Provider"
                                name="provider"
                                value={config.provider}
                                disabled
                            />
                        </Cell>
                        <Cell col={4} style={{ paddingTop: '14px' }}>
                            <Switch checked={config.enabled} onChange={onEnabled}>
                                {config.enabled ? 'Enabled' : 'Disabled'}
                            </Switch>
                        </Cell>
                    </Grid>

                    <Textfield
                        floatingLabel
                        style={{ width: '80%' }}
                        rows={1}
                        label="Description"
                        name="description"
                        placeholder=""
                        value={config.description}
                        error={errors.description}
                        onChange={setFieldValue('description')}
                    />
                </section>
                <section style={{ padding: '16px' }}>
                    <AddonEvents
                        provider={provider}
                        checkedEvents={config.events}
                        setEventValue={setEventValue}
                        error={errors.events}
                    />
                </section>
                <section style={{ padding: '16px' }}>
                    <AddonParameters
                        provider={provider}
                        config={config}
                        errors={errors}
                        editMode={editMode}
                        setParameterValue={setParameterValue}
                    />
                </section>
                <CardActions>
                    <FormButtons submitText={submitText} onCancel={cancel} />
                </CardActions>
            </form>
        </Card>
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
