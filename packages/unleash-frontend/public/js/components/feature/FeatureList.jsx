var React   = require('react');
var Feature = require('./Feature');

var noop = function() {};

var FeatureList = React.createClass({
    propTypes: {
        features: React.PropTypes.array.isRequired,
        strategies: React.PropTypes.array.isRequired
    },

    getDefaultProps: function() {
        return {
            onFeatureChanged: noop,
            onFeatureArchive: noop
        };
    },

    getInitialState: function() {
        return {
            filter: undefined
        };
    },

    onFilterChange: function(e) {
        e.preventDefault();
        this.setState({filter: e.target.value.trim()});
    },

    filteredFeatures: function() {
        if(this.state.filter) {
            var regex = new RegExp(this.state.filter, "i");

            return this.props.features.filter(function(item) {
                return regex.test(item.name) || regex.test(item.strategy);
            }.bind(this));

        } else {
            return this.props.features;
        }

    },

    render: function() {
        var featureNodes = this.filteredFeatures().map(function(feature) {
            return (
                <Feature
                  key={feature.name}
                  feature={feature}
                  onChange={this.props.onFeatureChanged}
                  onArchive={this.props.onFeatureArchive}
                  strategies={this.props.strategies}
                  />
            );
        }.bind(this));

        return (
            <div className=''>
                <table className='outerborder man'>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th className="hide-lt480">Strategy</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="4">
                                <input
                                    name="filter"
                                    ref="filter"
                                    type="text"
                                    placeholder="Filter by name or strategy"
                                    onChange={this.onFilterChange}
                                    value={this.state.filter}
                                />
                            </td>
                        </tr>
                    </tbody>
                    {featureNodes}
                </table>
            </div>
          );
    }
});

module.exports = FeatureList;
