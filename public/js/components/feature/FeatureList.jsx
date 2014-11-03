var React   = require('react');
var Feature = require('./Feature');

var FeatureList = React.createClass({
    render: function() {
        var featureNodes = this.props.features.map(function(feature) {
            return (
                <Feature
                  key={feature.name}
                  feature={feature}
                  onChange={this.props.onFeatureChanged} />
            );
        }.bind(this));

        return <div>{featureNodes}</div>;
    }
});

module.exports = FeatureList;