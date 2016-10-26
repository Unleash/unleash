'use strict';

const React               = require('react');
const FeatureList         = require('./FeatureList');
const FeatureForm         = require('./FeatureForm');
const FeatureActions      = require('../../stores/FeatureToggleActions');
const ErrorActions        = require('../../stores/ErrorActions');

const FeatureTogglesComponent = React.createClass({
    getInitialState () {
        return {
            createView: false,
        };
    },

    updateFeature (feature) {
        FeatureActions.update.triggerPromise(feature);
    },

    archiveFeature (feature) {
        FeatureActions.archive.triggerPromise(feature);
    },

    createFeature (feature) {
        FeatureActions.create.triggerPromise(feature)
          .then(this.cancelNewFeature);
    },

    newFeature () {
        this.setState({ createView: true });
    },

    cancelNewFeature () {
        this.setState({ createView: false });
        ErrorActions.clear();
    },

    render () {
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

    renderCreateView () {
        return (<FeatureForm
            onCancel={this.cancelNewFeature}
            onSubmit={this.createFeature}
            strategies={this.props.strategies} />);
    },

    renderCreateButton () {
        return <button className="mal" onClick={this.newFeature}>Create feature toggle</button>;
    },
});

module.exports = FeatureTogglesComponent;
