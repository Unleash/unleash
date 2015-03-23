var Reflux          = require('reflux');
var FeatureActions  = require('./FeatureToggleActions');
var ErrorActions    = require('./ErrorActions');

// Creates a DataStore
var FeatureStore = Reflux.createStore({
    // Initial setup
    init: function() {
        this.listenTo(FeatureActions.create.failed, this.onError);
        this.listenTo(FeatureActions.init.failed, this.onError);
        this.listenTo(FeatureActions.update.failed, this.onError);
        this.listenTo(FeatureActions.archive.failed, this.onError);
        this.listenTo(FeatureActions.revive.failed, this.onError);
        this.listenTo(ErrorActions.error, this.onError);
        this.listenTo(ErrorActions.clear, this.onClear);
        this.errors = [];
    },

    onError:  function (error) {
        if (this.isClientError(error)) {
            var errors = JSON.parse(error.responseText);
            errors.forEach(function(e) { this.addError(e.msg); }.bind(this));
        } else if (error.status === 0) {
            this.addError("server unreachable");
        } else {
            this.addError(error);
        }
    },

    onClear: function() {
        this.errors = [];
        this.trigger([]);
    },

    addError: function(msg) {
        var errors = this.errors;
        if (errors[errors.length - 1] !== msg) {
            errors.push(msg);
            this.errors = errors;
            this.trigger(errors);
        }
    },

    isClientError: function(error) {
        try {
            return error.status >= 400 &&
            error.status <  500 &&
            JSON.parse(error.responseText);
        } catch (e) {
            if (e instanceof SyntaxError) {
                // fall through;
                console.log("Syntax error!");
            } else {
                throw e;
            }
        }

        return false;
    },

    getErrors: function() {
        return this.errors;
    }
});

module.exports = FeatureStore;
