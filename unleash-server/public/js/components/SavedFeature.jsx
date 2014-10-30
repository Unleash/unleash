var React = require('react');

var SavedFeature = React.createClass({
    onChange: function(event) {
        this.props.onChange({
            name: this.props.feature.name,
            field: 'enabled',
            value: event.target.checked
        });
    },

    render: function() {
        return (
            <div className='row'>
                <div className='col-md-1 text-right'>
                    <input
                        type='checkbox'
                        checked={this.props.feature.enabled}
                        onChange={this.onChange} />
                </div>
                <div
                    className='col-md-4'
                    title='{this.props.feature.description}'>{this.props.feature.name}</div>
                <div className='col-md-2 col-md-offset-5'>
                    {this.props.feature.strategy}
                </div>
            </div>
        );
    }
});

module.exports = SavedFeature;