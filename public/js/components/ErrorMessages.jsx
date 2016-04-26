import React from 'react'
import Ui from './ErrorMessages.ui'
import ErrorStore '../stores/ErrorStore'
import ErrorActions from '../stores/ErrorActions'

const ErrorMessages = React.createClass({
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
