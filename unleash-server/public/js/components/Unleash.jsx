var React         = require('react');
var reqwest       = require('reqwest');
var Timer         = require('../utils/Timer');
var Menu          = require('./Menu');
var ErrorMessages = require('./ErrorMessages');
var FeatureList   = require('./FeatureList');

var Unleash = React.createClass({
    getInitialState: function() {
        return {
            savedFeatures: [],
            unsavedFeatures: [],
            errors: [],
            timer: null
        };
    },

    componentDidMount: function () {
        this.loadFeaturesFromServer();
        this.state.timer = new Timer(this.loadFeaturesFromServer, this.props.pollInterval);
        this.state.timer.start();
    },

    componentWillUnmount: function () {
        if (this.state.timer != null) {
            this.state.timer.stop();
        }
    },

    loadFeaturesFromServer: function () {
        reqwest('features').then(this.setFeatures, this.handleError);
    },

    setFeatures: function (data) {
        this.setState({savedFeatures: data.features});
    },

    handleError: function (error) {
        this.state.errors.push(error);
    },

    updateFeature: function (changeRequest) {
        var newFeatures = this.state.savedFeatures;
        newFeatures.forEach(function(f){
            if(f.name === changeRequest.name) {
                f[changeRequest.field] = changeRequest.value;
            }
        });

        this.setState({features: newFeatures});
        this.state.timer.stop();

        reqwest({
            url: 'features/' + changeRequest.name,
            method: 'patch',
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify(changeRequest)
        }).then(function() {
            // all good
            this.state.timer.start();
        }.bind(this), this.handleError);
    },

    createFeature: function (feature) {
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

        reqwest({
            url: 'features',
            method: 'post',
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify(feature)
        }).then(function(r) {
            console.log(r.statusText);
        }.bind(this), this.handleError);
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