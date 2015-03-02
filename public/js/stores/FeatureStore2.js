var reqwest = require('reqwest');
var Reflux = require('reflux');
var FeatureActions = require('./FeatureActions');

var TYPE         = 'json';
var CONTENT_TYPE = 'application/json';

function getFeatures() {
  return reqwest({
      url: 'features',
      method: 'get',
      type: CONTENT_TYPE
  });
}


var _toggles = [];

// Creates a DataStore
var FeatureStore = Reflux.createStore({
  // Initial setup
  init: function() {
    this.listenTo(FeatureActions.addToggle, this.onAddToggle);

    getFeatures()
      .then(function(data) {
        this.setToggles(JSON.parse(data.response).features);
      }.bind(this))
      .catch(this.handleError);
  },

  onAddToggle: function(feature) {
    reqwest({
        url: 'features',
        method: 'post',
        type: TYPE,
        contentType: CONTENT_TYPE,
        data: JSON.stringify(feature),
        error: function (error) {
          FeatureActions.addToggle.failed(error);
        },
        success: function () {
          this.setToggles(_toggles.concat([feature]));
          FeatureActions.addToggle.completed();
        }.bind(this)
    });
  },

  setToggles: function(toggles) {
    _toggles = toggles;
    this.trigger(_toggles);
  },

  handleError: function(er) {
    console.log("error: "+ er);
  },

  //getter for notes
  getToggles: function() {
    return _toggles;
  },

  getInitialState: function() {
    return _toggles;
  }

});

module.exports = FeatureStore;
