var React          = require('react');

var TextInput = React.createClass({
    propTypes: {
        name: React.PropTypes.string.isRequired,
        label: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        placeholder: React.PropTypes.string,
        value: React.PropTypes.string,
        required: React.PropTypes.bool
    },

    getDefaultProps: function() {
        return {
            required: false
        };
    },

    getInitialState: function() {
        return {};
    },

    getValue: function() {
        return this.refs.input.getDOMNode().value.trim();
    },


    render: function() {
        return (
            <div className="formelement">
                <label htmlFor="strategy_name" className="t4">{this.props.label}</label>
                <div className="input">
                    <input type="text"
                        id={this.props.id}
                        name={this.props.name}
                        defaultValue={this.props.value}
                        placeholder={this.props.placeholder}
                        ref="input" />
                </div>
            </div>
        );
    }
});

module.exports = TextInput;