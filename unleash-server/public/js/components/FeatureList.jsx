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
              <div className="mod shadow mts">
                <div className="inner">
                   <div className="bd">
                     <div className="line">
                       <div className="unit r-size1of4">
                         <h2>Features</h2>
                       </div>

                       <div className="unit r-size3of4 rightify prl ptm">
                         <button className="" onClick={this.props.onNewFeature}>New</button>
                       </div>
                     </div>

                     <hr />

                     {featureNodes}
                   </div>
                </div>
              </div>
            </div>
        );
    }
});

module.exports = FeatureList;