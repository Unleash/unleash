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
        return (<div className='line mal'>
                {this.state.editMode ? this.renderEditMode() : this.renderViewMode()}
                </div>);
    },

    renderEditMode: function() {
        return (<FeatureForm feature={this.props.feature} onSubmit={this.saveFeature} onCancel={this.toggleEditMode} />);

    },

    renderViewMode: function() {
        var strikeThrough = this.props.feature.enabled ? '' : 'strikethrough';
        return (
            <div>
                <div className={'unit r-size1of5 ' + strikeThrough}>
                  {this.props.feature.name}
                </div>

                <div className='unit r-size2of5 opaque smalltext truncate'>
                  {this.props.feature.description || '\u00a0'}
                </div>

                <div className='unit r-size1of5'>
                    {this.props.feature.strategy}
                </div>

                <div className='unit r-size1of5'>
                    <input type='button' value='Edit' onClick={this.toggleEditMode}/>
                </div>
            </div>
        );
    }
});

module.exports = Feature;