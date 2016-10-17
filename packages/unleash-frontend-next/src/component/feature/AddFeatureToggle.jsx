import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Input, Switch, Button } from 'react-toolbox';
import { createFeatureToggles } from '../../store/feature-actions';

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
                strategies: [
                    { name: 'default' },
                ],
            },
            showAddStrategy: false,
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

    addStrategy = (evt) => {
        evt.preventDefault();
        this.setState({ showAddStrategy: true });
    }

    handleChange = (key, value) => {
        const change = {};
        change[key] = value;
        const updatedFeatureToggle = Object.assign({}, this.state.featureToggle, change);

        this.setState({ featureToggle: updatedFeatureToggle });
    };

    renderAddStrategy () {
        if (this.state.showAddStrategy) {
            return (
                <div>
                    <h4>Adding strat</h4>
                    <p>Possible: {this.props.strategies.map(s => s.name).join(', ')}</p>
                </div>
            );
        } else {
            return <a onClick={this.addStrategy} href="#addStrategy">Add strategy..</a>;
        }
    }

    render () {
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
                    </section>

                    <br />


                    <Button type="submit" raised primary label="Create" />
                </form>
            </div>
        );
    }
}

export default connect(mapStateToProps)(AddFeatureToggle);
