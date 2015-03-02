var React         = require('react');
var Timer         = require('../../utils/Timer');
var ErrorMessages = require('../ErrorMessages');
var FeatureList   = require('./FeatureList');
var FeatureForm   = require('./FeatureForm');
var FeatureStore  = require('../../stores/FeatureStore');
var FeatureStore2 = require('../../stores/FeatureStore2');
var FeatureActions = require('../../stores/FeatureActions');
var Reflux        = require('reflux');

var FeatureTogglesComponent = React.createClass({
    getInitialState: function() {
        return {
            errors: [],
            createView: false,
            featurePoller: new Timer(this.loadFeaturesFromServer, this.props.pollInterval)
        };
    },

    mixins: [Reflux.connect(FeatureStore2,"features")],

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

        FeatureStore
          .updateFeature(feature)
          .then(this.startFeaturePoller)
          .catch(this.handleError);
    },

    archiveFeature: function (feature) {
        var updatedFeatures = this.state.features.filter(function(item) {
            return item.name !== feature.name;
        });

        FeatureStore
            .archiveFeature(feature)
            .then(function() {
                this.setState({features: updatedFeatures})
            }.bind(this))
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
        //this.stopFeaturePoller();

        FeatureActions.addToggle.triggerPromise(feature)
          .then(this.cancelNewFeature)
          .catch(this.handleError);

/*

        FeatureStore
          .createFeature(feature)
          .then(this.cancelNewFeature)
          .then(this.startFeaturePoller)
          .catch(this.handleError);
*/
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
                  onFeatureArchive={this.archiveFeature}
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
