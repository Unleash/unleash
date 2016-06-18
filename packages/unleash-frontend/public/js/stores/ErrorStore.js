'use strict';
const Reflux          = require('reflux');
const FeatureActions  = require('./FeatureToggleActions');
const ErrorActions    = require('./ErrorActions');

// Creates a DataStore
const FeatureStore = Reflux.createStore({
    // Initial setup
    init() {
        this.listenTo(FeatureActions.create.failed, this.onError);
        this.listenTo(FeatureActions.init.failed, this.onError);
        this.listenTo(FeatureActions.update.failed, this.onError);
        this.listenTo(FeatureActions.archive.failed, this.onError);
        this.listenTo(FeatureActions.revive.failed, this.onError);
        this.listenTo(ErrorActions.error, this.onError);
        this.listenTo(ErrorActions.clear, this.onClear);
        this.errors = [];
    },

    onError(error) {
        if (this.isClientError(error)) {
            const errors = JSON.parse(error.responseText);
            errors.forEach(e => {
                this.addError(e.msg);
            });
        } else if (error.status === 0) {
            this.addError('server unreachable');
        } else {
            this.addError(error);
        }
    },

    onClear() {
        this.errors = [];
        this.trigger([]);
    },

    addError(msg) {
        const errors = this.errors;
        if (errors[errors.length - 1] !== msg) {
            errors.push(msg);
            this.errors = errors;
            this.trigger(errors);
        }
    },

    isClientError(error) {
        try {
            return error.status >= 400 &&
            error.status <  500 &&
            JSON.parse(error.responseText);
        } catch (e) {
            if (e instanceof SyntaxError) {
                // fall through;
                console.log('Syntax error!');
            } else {
                throw e;
            }
        }

        return false;
    },

    getErrors() {
        return this.errors;
    },
});

module.exports = FeatureStore;
