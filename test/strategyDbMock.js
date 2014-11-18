var Promise = require("bluebird");

var strategies = [
    {
        name: "default",
        description: "Default on or off Strategy."
    },
    {
        name: "usersWithEmail",
        description: "Active for users defined  in the comma-separated emails-parameter.",
        parametersTemplate: {
            emails: "String"
        }
    }
];

function byName(name) {
    return strategies.filter(function(s) {
        return s.name === name;
    })[0];
}

module.exports = {
    getStrategies: function() {
        return new Promise(function (resolve) {
            resolve(strategies);
        });
    },
    getFeature: function(name) {
        var feature = byName(name);
        if(feature) {
            return Promise.resolve(feature);
        } else {
            return Promise.reject("strategy not found");
        }
    }
};