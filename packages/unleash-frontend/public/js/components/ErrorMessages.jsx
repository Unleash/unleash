'use strict';

const React       = require('react');
const Ui          = require('./ErrorMessages.ui');
const ErrorStore  = require('../stores/ErrorStore');
const ErrorActions  = require('../stores/ErrorActions');

const ErrorMessages = React.createClass({
    getInitialState () {
        return {
            errors: ErrorStore.getErrors(),
        };
    },

    onStoreChange () {
        this.setState({
            errors: ErrorStore.getErrors(),
        });
    },

    componentDidMount () {
        this.unsubscribe = ErrorStore.listen(this.onStoreChange);
    },

    componentWillUnmount () {
        this.unsubscribe();
    },

    onClearErrors () {
        ErrorActions.clear();
    },

    render () {
        return (
        <Ui errors={this.state.errors} onClearErrors={this.onClearErrors} />
        );
    },
});

module.exports = ErrorMessages;
