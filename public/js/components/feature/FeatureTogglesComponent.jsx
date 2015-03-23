var React               = require('react');
var FeatureList         = require('./FeatureList');
var FeatureForm         = require('./FeatureForm');
var FeatureActions      = require('../../stores/FeatureToggleActions');
var ErrorActions        = require('../../stores/ErrorActions');
var FeatureToggleStore  = require('../../stores/FeatureToggleStore');
var StrategyStore       = require('../../stores/StrategyStore');

var FeatureTogglesComponent = React.createClass({
    getInitialState: function() {
        return {
            features: FeatureToggleStore.getFeatureToggles(),
            createView: false
        };
    },

    onFeatureToggleChange: function() {
        this.setState({
            features: FeatureToggleStore.getFeatureToggles()
        });
    },
    componentDidMount: function() {
        this.unsubscribe = FeatureToggleStore.listen(this.onFeatureToggleChange);
    },
    componentWillUnmount: function() {
        this.unsubscribe();
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

                {this.state.createView ? this.renderCreateView() : this.renderCreateButton()}

                <FeatureList
                  features={this.state.features}
                  onFeatureChanged={this.updateFeature}
                  onFeatureArchive={this.archiveFeature}
                  onFeatureSubmit={this.createFeature}
                  onFeatureCancel={this.cancelNewFeature}
                  onNewFeature={this.newFeature}
                  strategies={StrategyStore.getStrategies()} />
            </div>
        );
    },

    renderCreateView: function() {
        return <FeatureForm
            onCancel={this.cancelNewFeature}
            onSubmit={this.createFeature}
            strategies={StrategyStore.getStrategies()} />;
    },

    renderCreateButton: function() {
        return <button className="mal" onClick={this.newFeature}>Create feature toggle</button>;
    }
});

module.exports = FeatureTogglesComponent;
