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
        if (this.isClientError(error)) {
            var errors = JSON.parse(error.responseText)
            errors.forEach(function(e) { this.addError(e.msg); }.bind(this))
        } else if (error.status === 0) {
            this.addError("server unreachable");
        } else {
            this.addError(error);
        }

        this.forceUpdate();
    },

    updateFeature: function (feature) {
        this.stopFeaturePoller();

        this.state.featureStore
          .updateFeature(feature)
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
        this.stopFeaturePoller();

        this.state.featureStore
          .createFeature(feature)
          .then(this.cancelNewFeature)
          .then(this.startFeaturePoller)
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

    addError: function(msg) {
        if (this.state.errors[this.state.errors.length - 1] !== msg) {
            this.state.errors.push(msg);
        }
    },

    isClientError: function(error) {
        try {
            return error.status >= 400 &&
                   error.status <  500 &&
                   JSON.parse(error.responseText);
        } catch (e) {
            if (e instanceof SyntaxError) {
                // fall through;
            } else {
                throw e;
            }
        }

        return false;
    },

    render: function() {
        return (
            <div>
                <ErrorMessages
                  errors={this.state.errors}
                  onClearErrors={this.clearErrors} />

                {this.state.createView ? this.renderCreateView() : this.renderCreateButton()}

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