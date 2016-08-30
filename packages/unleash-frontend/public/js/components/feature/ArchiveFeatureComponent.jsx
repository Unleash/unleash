'use strict';
const React               = require('react');
const FeatureActions      = require('../../stores/FeatureToggleActions');

const ArchiveFeatureComponent = React.createClass({

    onRevive (item) {
        FeatureActions.revive.triggerPromise(item);
    },

    render () {
        return (
            <div>
                <h1>Archived Feature Toggles</h1>
                <hr />
                <table className="outerborder man">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.archivedFeatures.map(this.renderArchivedItem)}
                    </tbody>
                </table>
            </div>
        );
    },

    renderArchivedItem (f) {
        return (
            <tr key={f.name}>
                <td>
                    {f.name}<br />
                <span className="opaque smalltext word-break">{f.description}</span>
            </td>
            <td className="rightify" width="150">
                <button onClick={this.onRevive.bind(this, f)} title="Revive feature toggle">
                    <span className="icon-svar" />
                </button>
            </td>
        </tr>);
    },
});

module.exports = ArchiveFeatureComponent;
