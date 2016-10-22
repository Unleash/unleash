import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Input, Switch, Button } from 'react-toolbox';
import { createFeatureToggles } from '../../store/feature-actions';
import AddFeatureToggleStrategy from './AddFeatureToggleStrategy';
import ConfiguredStrategies from './ConfiguredStrategies';

const mapStateToProps = (state) => ({
    strategies: state.strategies.toJS(),
});

class AddFeatureToggle extends React.Component {
    constructor () {
        super();
        this.state = {
            featureToggle: {
                name: '',
                description: '',
                enabled: false,
                strategies: [],
            },
        };
    }

    static propTypes () {
        return {
            dispatch: PropTypes.func.isRequired,
            strategies: PropTypes.array,
        };
    }

    static contextTypes = {
        router: React.PropTypes.object,
    }

    onSubmit = (evt) => {
        evt.preventDefault();
        this.props.dispatch(createFeatureToggles(this.state.featureToggle));
        this.context.router.push('/features');
    };

    handleChange = (key, value) => {
        const change = {};
        change[key] = value;
        const updatedFeatureToggle = Object.assign({}, this.state.featureToggle, change);

        this.setState({ featureToggle: updatedFeatureToggle });
    };

    addStrategy = (strategy) => {
        const strategies = this.state.featureToggle.strategies;
        strategies.push(strategy);
        const updatedFeatureToggle = Object.assign({}, this.state.featureToggle, { strategies });
        this.setState({ featureToggle: updatedFeatureToggle });
    }

    removeStrategy = (strategy) => {
        const strategies = this.state.featureToggle.strategies.filter(s => s !== strategy);
        const updatedFeatureToggle = Object.assign({}, this.state.featureToggle, { strategies });
        this.setState({ featureToggle: updatedFeatureToggle });
    }

    render () {
        const configuredStrategies = this.state.featureToggle.strategies;

        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    <section>
                        <Input
                            type="text"
                            label="Name"
                            name="name"
                            required
                            value={this.state.featureToggle.name}
                            onChange={this.handleChange.bind(this, 'name')} />
                        <Input
                            type="text"
                            multiline label="Description"
                            required
                            value={this.state.featureToggle.description}
                            onChange={this.handleChange.bind(this, 'description')} />

                        <br />

                        <Switch
                            checked={this.state.featureToggle.enabled}
                            label="Enabled"
                            onChange={this.handleChange.bind(this, 'enabled')} />

                        <br />
                    </section>

                    <section>
                        <strong>Activation strategies</strong>
                        <ConfiguredStrategies configuredStrategies={configuredStrategies} removeStrategy={this.removeStrategy} />
                    </section>

                    <section>
                        <AddFeatureToggleStrategy
                            strategies={this.props.strategies}
                            addStrategy={this.addStrategy}
                        />
                    </section>

                    <br />


                    <Button type="submit" raised primary label="Create" />
                </form>
            </div>
        );
    }
}

export default connect(mapStateToProps)(AddFeatureToggle);
