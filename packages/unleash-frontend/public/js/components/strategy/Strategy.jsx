var React          = require('react');

var Strategy = React.createClass({
    propTypes: {
        strategy: React.PropTypes.object.isRequired
    },

    onRemove: function(event) {
        event.preventDefault();
        if (window.confirm("Are you sure you want to delete strategy '"+
            this.props.strategy.name+"'?")) {
            this.props.onRemove(this.props.strategy);
        }
    },

    render: function() {
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
    }
});

module.exports = Strategy;
