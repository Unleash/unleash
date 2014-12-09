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
    },
    {
        name: "deletable",
        description: "deletable"
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
    getStrategy: function(name) {
        var strategy = byName(name);
        if(strategy) {
            return Promise.resolve(strategy);
        } else {
            return Promise.reject("strategy not found");
        }
    }
};