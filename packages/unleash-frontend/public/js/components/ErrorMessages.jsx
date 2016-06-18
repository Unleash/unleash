var React       = require('react');
var Ui          = require('./ErrorMessages.ui');
var ErrorStore  = require('../stores/ErrorStore');
var ErrorActions  = require('../stores/ErrorActions');

var ErrorMessages = React.createClass({
    getInitialState: function() {
      return {
        errors: ErrorStore.getErrors()
      };
    },

    onStoreChange: function() {
      this.setState({
        errors: ErrorStore.getErrors()
      });
    },

    componentDidMount: function() {
      this.unsubscribe = ErrorStore.listen(this.onStoreChange);
    },

    componentWillUnmount: function() {
      this.unsubscribe();
    },

    onClearErrors: function() {
        ErrorActions.clear();
    },

    render: function() {
        return (
            <Ui errors={this.state.errors} onClearErrors={this.onClearErrors}></Ui>
        );
    }
});

module.exports = ErrorMessages;
