'use strict';
const React          = require('react');

const TextInput = React.createClass({
    propTypes: {
        name: React.PropTypes.string.isRequired,
        label: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        placeholder: React.PropTypes.string,
        value: React.PropTypes.string,
        required: React.PropTypes.bool,
    },

    getDefaultProps () {
        return {
            required: false,
        };
    },

    getInitialState () {
        return {};
    },

    getValue () {
        return this.refs.input.getDOMNode().value.trim();
    },


    render () {
        return (
            <div className="formelement required">
                <label htmlFor={this.props.id} className="t4">{this.props.label}</label>
                <div className="input">
                    <input type="text"
                        id={this.props.id}
                        name={this.props.name}
                        defaultValue={this.props.value}
                        placeholder={this.props.placeholder}
                        disabled={this.props.disabled}
                        ref="input" />
                </div>
            </div>
        );
    },
});

module.exports = TextInput;
