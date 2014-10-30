var React = require('react');

var ErrorMessages = React.createClass({
    render: function() {
        if (!this.props.errors.length) {
            return <div/>;
        }

        var errorNodes = this.props.errors.map(function(e) {
            return (<li key={e}>{e}</li>);
        });

        return (
            <div className="alert alert-danger" role="alert">
              <ul>{errorNodes}</ul>
            </div>
        );
    }
});

module.exports = ErrorMessages;