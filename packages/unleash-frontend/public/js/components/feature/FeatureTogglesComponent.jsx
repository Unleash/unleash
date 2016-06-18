var React               = require('react');
var FeatureList         = require('./FeatureList');
var FeatureForm         = require('./FeatureForm');
var FeatureActions      = require('../../stores/FeatureToggleActions');
var ErrorActions        = require('../../stores/ErrorActions');

var FeatureTogglesComponent = React.createClass({
    getInitialState: function() {
        return {
            createView: false
        };
    },

    updateFeature: function (feature) {
      FeatureActions.update.triggerPromise(feature);
    },

    archiveFeature: function (feature) {
        FeatureActions.archive.triggerPromise(feature);
    },

    createFeature: function (feature) {
        FeatureActions.create.triggerPromise(feature)
          .then(this.cancelNewFeature);
    },

    newFeature: function() {
        this.setState({createView: true});
    },

    cancelNewFeature: function () {
        this.setState({createView: false});
        ErrorActions.clear();
    },

    render: function() {
        return (
            <div>

                <h1>Feature Toggles</h1>

                {this.state.createView ? this.renderCreateView() : this.renderCreateButton()}

                <FeatureList
                  features={this.props.features}
                  onFeatureChanged={this.updateFeature}
                  onFeatureArchive={this.archiveFeature}
                  onFeatureSubmit={this.createFeature}
                  onFeatureCancel={this.cancelNewFeature}
                  onNewFeature={this.newFeature}
                  strategies={this.props.strategies} />
            </div>
        );
    },

    renderCreateView: function() {
        return <FeatureForm
            onCancel={this.cancelNewFeature}
            onSubmit={this.createFeature}
            strategies={this.props.strategies} />;
    },

    renderCreateButton: function() {
        return <button className="mal" onClick={this.newFeature}>Create feature toggle</button>;
    }
});

module.exports = FeatureTogglesComponent;
