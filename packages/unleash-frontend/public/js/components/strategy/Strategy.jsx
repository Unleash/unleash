'use strict';
const React          = require('react');

const Strategy = React.createClass({
    propTypes: {
        strategy: React.PropTypes.object.isRequired,
    },

    onRemove(event) {
        event.preventDefault();
        if (window.confirm(`Are you sure you want to delete strategy '${this.props.strategy.name}'?`)) {
            this.props.onRemove(this.props.strategy);
        }
    },

    render() {
        return (
            <div className="line mal">
                <div className="unit">
                    <strong>{this.props.strategy.name} </strong>
                    <a href=""
                        title="Delete strategy"
                        onClick={this.onRemove}>(remove)</a><br />
                    <em>{this.props.strategy.description}</em><br />
                </div>
            </div>
        );
    },
});

module.exports = Strategy;
