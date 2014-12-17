var React   = require('react');
var Feature = require('./Feature');

var FeatureList = React.createClass({
    render: function() {
        var featureNodes = this.props.features.map(function(feature) {
            return (
                <Feature
                  key={feature.name}
                  feature={feature}
                  onChange={this.props.onFeatureChanged}
                  onArchive={this.props.onFeatureArchive}/>
            );
        }.bind(this));

        return (
          <div className=''>
            <table className='outerborder man'>
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Strategy</th>
                  <th></th>
                </tr>
              </thead>
              {featureNodes}
            </table>
          </div>
          );
    }
});

module.exports = FeatureList;