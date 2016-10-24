import React, { PropTypes } from 'react';
import { Input, Switch, Button } from 'react-toolbox';
import AddFeatureToggleStrategy from './strategies-for-toggle';
import SelectedStrategies from './selected-strategies';

const AddFeatureToggleComponent = ({
    strategies,
    featureToggle,
    updateField,
    addStrategy,
    removeStrategy,
    onSubmit,
    onCancel,
    editmode,
}) => {
    const {
        name, // eslint-disable-line
        description,
        enabled,
    } = featureToggle;
    const configuredStrategies = featureToggle.strategies;

    return (
        <form onSubmit={onSubmit}>
            <section>
                <Input
                    type="text"
                    label="Name"
                    name="name"
                    disabled={editmode}
                    required
                    value={name}
                    onChange={updateField.bind(this, 'name')} />
                <Input
                    type="text"
                    multiline label="Description"
                    required
                    value={description}
                    onChange={updateField.bind(this, 'description')} />

                <br />

                <Switch
                    checked={enabled}
                    label="Enabled"
                    onChange={updateField.bind(this, 'enabled')} />

                <br />
            </section>

            <section>
                <strong>Activation strategies</strong>
                <SelectedStrategies
                    configuredStrategies={configuredStrategies}
                    removeStrategy={removeStrategy} />
            </section>

            <section>
                <AddFeatureToggleStrategy strategies={strategies} addStrategy={addStrategy} />
            </section>

            <br />


            <Button type="submit" raised primary label={editmode ? 'Update' : 'Create'} />
            &nbsp;
            <Button type="cancel" raised label="Cancel" onClick={onCancel} />
        </form>
    );
};

AddFeatureToggleComponent.propTypes = {
    strategies: PropTypes.array.required,
    featureToggle: PropTypes.object,
    updateField: PropTypes.func.required,
    addStrategy: PropTypes.func.required,
    removeStrategy: PropTypes.func.required,
    onSubmit: PropTypes.func.required,
    onCancel: PropTypes.func.required,
    editmode: PropTypes.bool,
};

export default AddFeatureToggleComponent;
