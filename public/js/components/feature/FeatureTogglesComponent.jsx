var React               = require('react');
var ErrorMessages       = require('../ErrorMessages');
var FeatureList         = require('./FeatureList');
var FeatureForm         = require('./FeatureForm');
var FeatureActions      = require('../../stores/FeatureToggleActions');
var FeatureToggleStore  = require('../../stores/FeatureToggleStore');

var FeatureTogglesComponent = React.createClass({
    getInitialState: function() {
        return {
            features: FeatureToggleStore.getFeatureToggles(),
            errors: [],
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

    handleError: function (error) {
      console.log(error);
        if (this.isClientError(error)) {
            var errors = JSON.parse(error.responseText)
            errors.forEach(function(e) { this.addError(e.msg); }.bind(this))
        } else if (error.status === 0) {
            this.addError("server unreachable");
        } else {
            this.addError(error);
        }
    },

    updateFeature: function (feature) {
      FeatureActions.update.triggerPromise(feature)
          .catch(this.handleError);
    },

    archiveFeature: function (feature) {
        FeatureActions.archive.triggerPromise(feature)
            .catch(this.handleError);
    },

    createFeature: function (feature) {
        FeatureActions.create.triggerPromise(feature)
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

    addError: function(msg) {
      var errors = this.state.errors;
        if (errors[errors.length - 1] !== msg) {
            errors.push(msg);
            this.setState(errors);
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
