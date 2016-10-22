import React, { PropTypes } from 'react';
import { Input, Switch, Button } from 'react-toolbox';
import AddFeatureToggleStrategy from './AddFeatureToggleStrategy';
import ConfiguredStrategies from './ConfiguredStrategies';

class AddFeatureToggleUI extends React.Component {
    static propTypes () {
        return {
            strategies: PropTypes.array.required,
            featureToggle: PropTypes.object,
            updateField: PropTypes.func.required,
            addStrategy: PropTypes.func.required,
            removeStrategy: PropTypes.func.required,
            onSubmit: PropTypes.func.required,
            onCancel: PropTypes.func.required,
            editmode: PropTypes.bool,
        };
    }

    render () {
        const configuredStrategies = this.props.featureToggle.strategies;

        return (
            <form onSubmit={this.props.onSubmit}>
                <section>
                    <Input
                        type="text"
                        label="Name"
                        name="name"
                        disabled={this.props.editmode}
                        required
                        value={this.props.featureToggle.name}
                        onChange={this.props.updateField.bind(this, 'name')} />
                    <Input
                        type="text"
                        multiline label="Description"
                        required
                        value={this.props.featureToggle.description}
                        onChange={this.props.updateField.bind(this, 'description')} />

                    <br />

                    <Switch
                        checked={this.props.featureToggle.enabled}
                        label="Enabled"
                        onChange={this.props.updateField.bind(this, 'enabled')} />

                    <br />
                </section>

                <section>
                    <strong>Activation strategies</strong>
                    <ConfiguredStrategies
                        configuredStrategies={configuredStrategies}
                        removeStrategy={this.props.removeStrategy} />
                </section>

                <section>
                    <AddFeatureToggleStrategy
                        strategies={this.props.strategies}
                        addStrategy={this.props.addStrategy} />
                </section>

                <br />


                <Button type="submit" raised primary label={this.props.editmode ? 'Update' : 'Create'} />
                <Button type="cancel" raised label="Cancel" onClick={this.props.onCancel} />
            </form>
        );
    }
}

export default AddFeatureToggleUI;
