var React         = require('react');
var Timer         = require('../../utils/Timer');
var ErrorMessages = require('../ErrorMessages');
var FeatureList   = require('./FeatureList');
var FeatureForm   = require('./FeatureForm');
var FeatureStore  = require('../../stores/FeatureStore');

var FeatureTogglesComponent = React.createClass({
    getInitialState: function() {
        return {
            features: [],
            errors: [],
            createView: false,
            featurePoller: new Timer(this.loadFeaturesFromServer, this.props.pollInterval),
            featureStore: new FeatureStore()
        };
    },

    componentDidMount: function () {
        this.loadFeaturesFromServer();
        this.startFeaturePoller();
    },

    componentWillUnmount: function () {
        this.stopFeaturePoller();
    },

    loadFeaturesFromServer: function () {
        this.state.featureStore.getFeatures().then(this.setFeatures).catch(this.handleError);
    },

    setFeatures: function (data) {
        this.setState({features: data.features});
    },

    handleError: function (error) {
        this.state.errors.push(error);
        this.forceUpdate();
    },

    updateFeature: function (changeRequest) {
        var newFeatures = this.state.features;
        newFeatures.forEach(function(f){
            if(f.name === changeRequest.name) {
                f[changeRequest.field] = changeRequest.value;
            }
        });

        this.setState({features: newFeatures});
        this.stopFeaturePoller();
        this.state.featureStore.updateFeature(changeRequest)
          .then(this.startFeaturePoller)
          .catch(this.handleError);
    },

    startFeaturePoller: function () {
        this.state.featurePoller.start();
    },

    stopFeaturePoller: function () {
        if (this.state.featurePoller != null) {
            this.state.featurePoller.stop();
        }
    },

    createFeature: function (feature) {
        this.state.featureStore.createFeature(feature)
          .then(this.cancelNewFeature)
          .catch(this.handleError);
    },

    newFeature: function() {
        this.setState({createView: true});
    },

    cancelNewFeature: function (feature) {
        this.setState({createView: false});
    },

    clearErrors: function() {
        this.setState({errors: []});
    },

    render: function() {
        return (
            <div>
                <ErrorMessages
                  errors={this.state.errors}
                  onClearErrors={this.clearErrors} />

                {this.state.createView ? this.renderCreateView() : this.renderCreateButton()}

                <hr />

                <FeatureList
                  features={this.state.features}
                  onFeatureChanged={this.updateFeature}
                  onFeatureSubmit={this.createFeature}
                  onFeatureCancel={this.cancelNewFeature}
                  onNewFeature={this.newFeature} />
            </div>
        );
    },

    renderCreateView: function() {
        return <FeatureForm onCancel={this.cancelNewFeature} onSubmit={this.createFeature} />
    },

    renderCreateButton: function() {
        return <button className="mal" onClick={this.newFeature}>Create feature toggle</button>
    }
});



module.exports = FeatureTogglesComponent;