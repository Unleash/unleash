var React         = require('react');
var Timer         = require('../utils/Timer');
var Menu          = require('./Menu');
var ErrorMessages = require('./ErrorMessages');
var FeatureList   = require('./FeatureList');
var FeatureStore  = require('../stores/FeatureStore');

var Unleash = React.createClass({
    getInitialState: function() {
        return {
            savedFeatures: [],
            unsavedFeatures: [],
            errors: [],
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
        this.setState({savedFeatures: data.features});
    },

    handleError: function (error) {
        this.state.errors.push(error);
        this.forceUpdate();
    },

    updateFeature: function (changeRequest) {
        var newFeatures = this.state.savedFeatures;
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
        var created = function() {
            var unsaved = [], state = this.state;

            this.state.unsavedFeatures.forEach(function(f) {
                // TODO: make sure we don't overwrite an existing feature
                if (f.name === feature.name) {
                    state.savedFeatures.unshift(f);
                } else {
                    unsaved.push(f);
                }
            });

            this.setState({unsavedFeatures: unsaved});
        }.bind(this);


        this.state.featureStore.createFeature(feature)
          .then(created)
          .catch(this.handleError);
    },

    newFeature: function() {
        var blankFeature = {
            name: '',
            enabled: false,
            strategy: 'default',
            parameters: {}
        };

        this.state.unsavedFeatures.push(blankFeature);
        this.forceUpdate();
    },

    cancelNewFeature: function (feature) {
        var unsaved = [];

        this.state.unsavedFeatures.forEach(function (f) {
            if (f.name !== feature.name) {
                unsaved.push(f);
            }
        });

        this.setState({unsavedFeatures: unsaved});
    },

    clearErrors: function() {
        this.setState({errors: []});
    },

    render: function() {
        return (
            <div>
              <Menu />
              <ErrorMessages
                 errors={this.state.errors}
                 onClearErrors={this.clearErrors} />
              <FeatureList
                 unsavedFeatures={this.state.unsavedFeatures}
                 savedFeatures={this.state.savedFeatures}
                 onFeatureChanged={this.updateFeature}
                 onFeatureSubmit={this.createFeature}
                 onFeatureCancel={this.cancelNewFeature}
                 onNewFeature={this.newFeature} />
            </div>
        );
    }
});

module.exports = Unleash;