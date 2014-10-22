module.exports = [
    {
        "name": "featureX",
        "description": "the #1 feature",
        "enabled": true,
        "strategy": "default"
    },
    {
        "name": "featureY",
        "description": "soon to be the #1 feature",
        "enabled": false,
        "strategy": "baz",
        "parameters": {
            "foo": "bar"
        }
    },
    {
        "name": "featureZ",
        "description": "terrible feature",
        "enabled": true,
        "strategy": "baz",
        "parameters": {
            "foo": "rab"
        }
    }
];