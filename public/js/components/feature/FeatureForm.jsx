var React = require('react');
var strategyStore = require('../../stores/StrategyStore');

var FeatureForm = React.createClass({
    getInitialState: function() {
      return {strategyOptions: []};
    },

    componentWillMount: function() {
      strategyStore.getStrategies().then(this.handleStrategyResponse);
    },

    handleStrategyResponse: function(response) {
      var strategyNames = response.strategies.map(function(strategy) {
        return strategy.name;
      });

      this.setState({strategyOptions: strategyNames});
    },

    render: function() {
        var currentStrategy = this.props.feature ? this.props.feature.strategy : "";
        var strategyNodes = this.state.strategyOptions.map(function(name) {
          return (
            <option value={name} selected={name === currentStrategy}>
              {name}
            </option>
            );
        });

        var feature = this.props.feature || {
          name: '',
          strategy: 'default',
          enabled: false
        };

        return (
          <form ref="form" className="bg-blue-xlt">
            <div className="line mal ptl pbl">

              <div className="unit prl r-size1of6">
                <input ref="enabled" type="checkbox" defaultChecked={feature.enabled} />
              </div>

              <div className="unit r-size2of5">
                <input
                   type="text"
                   className="mbs"
                   id="name"
                   ref="name"
                   disabled={feature.name.length}
                   defaultValue={feature.name}
                   placeholder="Enter name" />

                <input className=""
                   type="text"
                   ref="description"
                   defaultValue={feature.description}
                   placeholder="Enter description" />
              </div>

              <div className="unit r-size2of6 plm">
                <select id="strategy"
                        ref="strategy"
                        className=""
                        defaultValue={feature.strategy}>
                  {strategyNodes}
                </select>
              </div>

              <div className="unit r-size1of6 rightify">
                <button className="primary mrs" onClick={this.saveFeature}>
                    Save
                </button>

                <button className="" onClick={this.cancelFeature}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        );
    },

    saveFeature: function(e) {
        e.preventDefault();

        var feature = {
            name: this.refs.name.getDOMNode().value,
            description: this.refs.description.getDOMNode().value,
            strategy: this.refs.strategy.getDOMNode().value,
            enabled: this.refs.enabled.getDOMNode().checked
        }

        this.props.onSubmit(feature);
    },

    cancelFeature: function(e) {
        e.preventDefault();
        this.props.onCancel();
    }
});

module.exports = FeatureForm;