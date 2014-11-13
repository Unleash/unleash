var React = require('react');
var FeatureForm = require('./FeatureForm');

var Feature = React.createClass({
    getInitialState: function() {
        return {
            editMode: false
        };
    },

    toggleEditMode: function() {
        this.setState({editMode: !this.state.editMode});
    },

    saveFeature: function(feature) {
        this.props.onChange({
            name: feature.name,
            field: 'enabled',
            value: feature.enabled
        });
        this.toggleEditMode();
    },

    render: function() {
        return this.state.editMode ? this.renderEditMode() : this.renderViewMode();
    },

    renderEditMode: function() {
        return (
            <tr>
                <td colSpan="5">
                    <FeatureForm feature={this.props.feature} onSubmit={this.saveFeature} onCancel={this.toggleEditMode} />
                </td>
            </tr>
            );

    },

    renderViewMode: function() {
        return (
            <tr>
                <td width="20">
                    <span className={this.props.feature.enabled ? "toggle-active" : "toggle-inactive"} title="Status">
                    </span>
                </td>
                <td>
                    {this.props.feature.name}
                </td>

                <td className='opaque smalltext truncate'>
                    {this.props.feature.description || '\u00a0'}
                </td>

                <td>
                    {this.props.feature.strategy}
                </td>

                <td className="rightify">
                    <input type='button' value='Edit' onClick={this.toggleEditMode}/>
                </td>
            </tr>
        );
    }
});

module.exports = Feature;