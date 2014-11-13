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

        return (
          <div className='r-margin'>
            <table className='outerborder'>
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Strategy</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {featureNodes}
              </tbody>
            </table>
          </div>
          );
    }
});

module.exports = FeatureList;