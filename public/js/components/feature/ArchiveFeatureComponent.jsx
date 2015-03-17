var React               = require("react");
var FeatureActions      = require('../../stores/FeatureToggleActions');
var FeatureToggleStore  = require('../../stores/ArchivedToggleStore');

var ArchiveFeatureComponent = React.createClass({
    getInitialState: function() {
        return {
            archivedFeatures: FeatureToggleStore.getArchivedToggles()
        };
    },

    onStoreChange: function() {
        this.setState({
            archivedFeatures: FeatureToggleStore.getArchivedToggles()
        });
    },

    componentDidMount: function() {
        this.unsubscribe = FeatureToggleStore.listen(this.onStoreChange);
    },

    componentWillUnmount: function() {
        this.unsubscribe();
    },

    onRevive: function(item) {
        FeatureActions.revive.triggerPromise(item);
    },

    render: function () {
        return (
            <div>
                <h1>Archived feature toggles</h1>
                <table className="outerborder man">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.archivedFeatures.map(this.renderArchivedItem)}
                    </tbody>
                </table>
            </div>
        );
    },

    renderArchivedItem: function(f) {
        return (
            <tr key={f.name}>
                <td>
                    {f.name}<br />
                <span className="opaque smalltext word-break">{f.description}</span>
            </td>
            <td className="rightify" width="150">
                <button onClick={this.onRevive.bind(this, f)} title="Revive feature toggle">
                    <span className="icon-svar"></span>
                </button>
            </td>
        </tr>);
    }
});

module.exports = ArchiveFeatureComponent;
