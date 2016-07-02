'use strict';
const React   = require('react');
const Feature = require('./Feature');

const noop = function () {};

const FeatureList = React.createClass({
    propTypes: {
        features: React.PropTypes.array.isRequired,
        strategies: React.PropTypes.array.isRequired,
    },

    getDefaultProps () {
        return {
            onFeatureChanged: noop,
            onFeatureArchive: noop,
        };
    },

    getInitialState () {
        return {
            filter: undefined,
        };
    },

    onFilterChange (e) {
        e.preventDefault();
        this.setState({ filter: e.target.value.trim() });
    },

    filteredFeatures () {
        if (this.state.filter) {
            const regex = new RegExp(this.state.filter, 'i');

            return this.props.features.filter(item => regex.test(item.name) || regex.test(item.strategy));
        }
        return this.props.features;
    },

    render () {
        const featureNodes = this.filteredFeatures().map(feature => <Feature
          key={feature.name}
          feature={feature}
          onChange={this.props.onFeatureChanged}
          onArchive={this.props.onFeatureArchive}
          strategies={this.props.strategies}
          />);

        return (
            <div className="">
                <table className="outerborder man">
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
    },
});

module.exports = FeatureList;
