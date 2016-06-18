'use strict';
const React = require('react');
const TextInput = require('../form/TextInput');

const FeatureForm = React.createClass({
    getInitialState() {
        return {
            strategyOptions: this.props.strategies,
            requiredParams: [],
            currentStrategy: this.props.feature ? this.props.feature.strategy : 'default',
        };
    },

    componentWillMount() {
        if (this.props.feature) {
            this.setSelectedStrategy(this.props.feature.strategy);
        }
    },

    onStrategyChange(e) {
        this.setSelectedStrategy(e.target.value);
        this.setState({ currentStrategy: e.target.value });
    },

    getParameterValue(name) {
        if (this.props.feature && this.props.feature.parameters) {
            return this.props.feature.parameters[name];
        }
        return '';
    },

    setSelectedStrategy(name) {
        const selectedStrategy = this.props.strategies.filter(strategy => strategy.name ===  name)[0];

        if (selectedStrategy) {
            this.setStrategyParams(selectedStrategy);
        } else {
            this.setState({
                currentStrategy: 'default',
                requiredParams: [],
            });
        }
    },

    setStrategyParams(strategy) {
        const requiredParams = [];
        let key;
        for (key in strategy.parametersTemplate) {
            if (Object.hasOwnProperty.call(strategy.parametersTemplate, key)) {
                requiredParams.push({ name: key, value: this.getParameterValue(key) });
            }
        }
        this.setState({ requiredParams });
    },

    render() {
        const feature = this.props.feature || {
            name: '',
            strategy: 'default',
            enabled: false,
        };

        const idPrefix = this.props.feature ? this.props.feature.name : 'new';

        return (
            <div className="bg-lilac-xlt r-pam">
                <form ref="form" className="r-size1of2">

                    <fieldset>
                        {this.props.feature ? '' : <legend>Create new toggle</legend>}

                        <TextInput
                            id={`${idPrefix}-name`}
                            name="name"
                            label="Name"
                            value={feature.name}
                            disabled={feature.name.length}
                            ref="name"
                            placeholder="Toggle name" />

                        <TextInput
                            id={`${idPrefix}-description`}
                            name="description"
                            label="Description"
                            value={feature.description}
                            ref="description"
                            placeholder="Enter description" />

                        <div className="formelement">
                            <label htmlFor={`${idPrefix}-strategy`}>Strategy</label>
                            <div className="input select">
                                <select id={`${idPrefix}-strategy`}
                                    ref="strategy"
                                    value={this.state.currentStrategy}
                                    onChange={this.onStrategyChange}>
                                    {this.renderStrategyOptions()}
                                </select>
                            </div>
                        </div>

                        <div className="formelement">
                            <div className="input">
                                <ul className="inputs-list">
                                    <li>
                                        <input id={`${idPrefix}-active`}
                                        ref="enabled"
                                        type="checkbox"
                                        defaultChecked={feature.enabled} />
                                        <label htmlFor={`${idPrefix}-active`}>
                                            Active
                                        </label>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {this.renderStrategyProperties()}

                    </fieldset>

                    <div className="actions">
                        <button className="primary mrs" onClick={this.saveFeature}>Save</button>
                        <button className="" onClick={this.cancelFeature}>Cancel</button>
                    </div>
                </form>
            </div>
        );
    },

    renderStrategyOptions() {
        return this.props.strategies.map(strategy => <option key={strategy.name} value={strategy.name}>
            {strategy.name}
        </option>);
    },

    renderStrategyProperties() {
        return this.state.requiredParams.map(param => <TextInput
            id={`param-${param.name}`}
            key={`param-${param.name}`}
            name={param.name}
            label={param.name}
            ref={param.name}
            value={param.value} />);
    },

    saveFeature(e) {
        e.preventDefault();

        const feature = {
            name: this.refs.name.getValue(),
            description: this.refs.description.getValue(),
            strategy: this.state.currentStrategy,
            enabled: this.refs.enabled.getDOMNode().checked,
            parameters: this.getParameters(),
        };

        this.props.onSubmit(feature);
    },

    cancelFeature(e) {
        e.preventDefault();
        this.props.onCancel();
    },

    getParameters() {
        const parameters = {};
        this.state.requiredParams.forEach(param => {
            parameters[param.name] = this.refs[param.name].getValue();
        });
        return parameters;
    },
});

module.exports = FeatureForm;
