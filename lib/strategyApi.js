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

module.exports = function (app) {

    app.get('/strategies', function (req, res) {
        res.json({strategies: strategies});
    });

    app.get('/strategies/:name', function (req, res) {
        var strategy = byName(req.params.name);
        if (strategy) {
            res.json(strategy);
        } else {
            res.json(404, {error: 'Could not find strategy'});
        }
    });

    app.post('/strategies', function (req, res) {
        res.json(500, {error: 'Not implemented yet'});
    });

};

