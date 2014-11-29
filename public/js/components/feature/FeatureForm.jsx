var React = require('react');
var TextInput      = require('../form/TextInput');
var strategyStore = require('../../stores/StrategyStore');

var FeatureForm = React.createClass({
    getInitialState: function() {
      return {
          strategyOptions: [],
          requiredParams: [],
          currentStrategy: this.props.feature ? this.props.feature.strategy : "default"
      };
    },

    componentWillMount: function() {
      strategyStore.getStrategies().then(this.handleStrategyResponse);
    },

    handleStrategyResponse: function(response) {
        this.setState({strategyOptions: response.strategies});
        if(this.props.feature) {
            this.setSelectedStrategy(this.props.feature.strategy);
        }
    },

    onStrategyChange: function(e) {
        this.setSelectedStrategy(e.target.value);
        this.setState({currentStrategy: e.target.value});
    },

    getParameterValue: function(name) {
        if(this.props.feature && this.props.feature.parameters) {
            return this.props.feature.parameters[name];
        } else {
            return "";
        }
    },

    setSelectedStrategy: function(name) {
        var selected = this.state.strategyOptions.filter(function(strategy) {
            return strategy.name ===  name;
        });

        var requiredParams = [];
        var key;

        if(selected[0] && selected[0].parametersTemplate) {
            for(key in selected[0].parametersTemplate) {
                requiredParams.push({name: key, value: this.getParameterValue(key)});
            }
        }
        this.setState({requiredParams: requiredParams});

    },

    render: function() {
        var feature = this.props.feature || {
          name: '',
          strategy: 'default',
          enabled: false
        };

        return (
            <div className="bg-lilac-xlt r-pam">
                <form ref="form" className="r-size1of2">

                    <fieldset>
                        {this.props.feature ? "" : <legend>Create new toggle</legend>}

                        <TextInput
                            id="name"
                            name="name"
                            label="Name"
                            value={feature.name}
                            disabled={feature.name.length}
                            ref="name"
                            placeholder="Toggle name" />

                        <TextInput
                            id="description"
                            name="description"
                            label="Description"
                            value={feature.description}
                            ref="description"
                            placeholder="Enter description" />

                        <div className="formelement">
                            <label htmlFor="strategy">Strategy</label>
                            <div className="input select">
                                <select id="strategy" ref="strategy" value={this.state.currentStrategy} onChange={this.onStrategyChange}>
                                    {this.renderStrategyOptions()}
                                </select>
                            </div>
                        </div>

                        <div className="formelement">
                            <div className="input">
                                <ul className="inputs-list">
                                    <li>
                                        <input id="active" ref="enabled" type="checkbox" defaultChecked={feature.enabled} />
                                        <label htmlFor="active">Active</label>
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

    renderStrategyOptions: function() {
        return this.state.strategyOptions.map(function(strategy) {
            return (
              <option key={strategy.name} value={strategy.name}>
                {strategy.name}
              </option>
            );
        }.bind(this));
    },

    renderStrategyProperties: function() {
        return this.state.requiredParams.map(function(param) {
            return <TextInput
                id={"param-" + param.name}
                key={"param-" + param.name}
                name={param.name}
                label={param.name}
                ref={param.name}
                value={param.value} />
        });
    },

    saveFeature: function(e) {
        e.preventDefault();

        var feature = {
            name: this.refs.name.getValue(),
            description: this.refs.description.getValue(),
            strategy: this.state.currentStrategy,
            enabled: this.refs.enabled.getDOMNode().checked,
            parameters: this.getParameters()
        };

        this.props.onSubmit(feature);
    },

    cancelFeature: function(e) {
        e.preventDefault();
        this.props.onCancel();
    },

    getParameters: function() {
        var parameters = {};
        this.state.requiredParams.forEach(function(param) {
            parameters[param.name] = this.refs[param.name].getValue();
        }.bind(this));
        return parameters;
    }
});

module.exports = FeatureForm;