var React = require('react');
var TextInput      = require('../form/TextInput');
var strategyStore = require('../../stores/StrategyStore');

var FeatureForm = React.createClass({
    getInitialState: function() {
      return {strategyOptions: []};
    },

    componentWillMount: function() {
      strategyStore.getStrategies().then(this.handleStrategyResponse);
    },

    handleStrategyResponse: function(response) {
      var strategyNames = response.strategies.map(function(s) { return s.name; });
      this.setState({strategyOptions: strategyNames});
    },

    render: function() {
        var feature = this.props.feature || {
          name: '',
          strategy: 'default',
          enabled: false
        };

        var title = this.props.feature ? "" : "Create new toggle";

        return (
            <div className="bg-lilac-xlt r-pam">
                <form ref="form" className="r-size1of2">

                    <fieldset>
                        <legend>{title}</legend>

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
                            <div class="input select">
                                <select id="strategy" ref="strategy" defaultValue={feature.strategy}>
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
        var currentStrategy = this.props.feature ? this.props.feature.strategy : "default";

        return this.state.strategyOptions.map(function(name) {
            return (
              <option key={name} value={name} selected={name === currentStrategy}>
                {name}
              </option>
            );
        });
    },

    saveFeature: function(e) {
        e.preventDefault();

        var feature = {
            name: this.refs.name.getValue(),
            description: this.refs.description.getValue(),
            strategy: this.refs.strategy.getDOMNode().value,
            enabled: this.refs.enabled.getDOMNode().checked
        };

        this.props.onSubmit(feature);
    },

    cancelFeature: function(e) {
        e.preventDefault();
        this.props.onCancel();
    }
});

module.exports = FeatureForm;