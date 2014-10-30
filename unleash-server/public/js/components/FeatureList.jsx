var React          = require('react');
var SavedFeature   = require('./SavedFeature');
var UnsavedFeature = require('./UnsavedFeature');

var FeatureList = React.createClass({
    render: function() {
        var featureNodes = [];

        this.props.unsavedFeatures.forEach(function(feature, idx) {
            var key = 'new-' + idx;
            featureNodes.push(
                <UnsavedFeature
                  key={key}
                  feature={feature}
                  onSubmit={this.props.onFeatureSubmit}
                  onCancel={this.props.onFeatureCancel} />
            );
        }.bind(this));

        this.props.savedFeatures.forEach(function(feature) {
            featureNodes.push(
                <SavedFeature
                  key={feature.name}
                  feature={feature}
                  onChange={this.props.onFeatureChanged} />
            );
        }.bind(this));

        return (
            <div className="container">
              <div className='panel panel-primary'>
                  <div className='panel-heading'>
                      <h3 className='panel-title'>Features</h3>
                      <div className='text-right'>
                          <button type="button"
                                  className="btn btn-default btn-sm"
                                  onClick={this.props.onNewFeature}>
                              <span className="glyphicon glyphicon-plus"></span> New
                          </button>
                      </div>
                  </div>

                  <div className='panel-body'>
                    {featureNodes}
                  </div>
                </div>
            </div>
        );
    }
});

module.exports = FeatureList;