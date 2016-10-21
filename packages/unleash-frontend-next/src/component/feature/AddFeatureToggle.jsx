import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Input, Switch, Button } from 'react-toolbox';
import { createFeatureToggles } from '../../store/feature-actions';
import ConfigureStrategy from './ConfigureStrategy';

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

    cancelConfig = () => {
        this.setState({ configureStrategy: undefined });
    };

    renderAddStrategy () {
        if (this.state.configureStrategy) {
            return (
                <div>
                    <ConfigureStrategy strategy={this.state.configureStrategy} cancelConfig={this.cancelConfig} />
                </div>
            );
        } else {
            return (
                <div>
                    <strong>Choose an activation strategy:</strong>
                    <ul>{this.renderPossibleStrategies()}</ul>
                </div>
            );
        }
    }

    renderPossibleStrategies () {
        const configure = (strategy, evt) => {
            evt.preventDefault();
            this.setState({
                configureStrategy: strategy,
            });
        };
        const configuredStrategies = this.state.featureToggle.strategies;
        return this.props.strategies
            .filter(s => !configuredStrategies.find(selected => selected.name === s.name))
            .map((s) => (
                <li key={s.name}><a href={`#configure-${s.name}`} onClick={configure.bind(this, s)}>{s.name}</a></li>
            ));
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
                        <h3>Strategies</h3>
                        {this.renderAddStrategy()}
                        <p>Configured: {configuredStrategies.map(s => s.name).join(', ')}</p>
                    </section>

                    <br />


                    <Button type="submit" raised primary label="Create" />
                </form>
            </div>
        );
    }
}

export default connect(mapStateToProps)(AddFeatureToggle);
