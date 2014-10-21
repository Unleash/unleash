module.exports = [
    {
        "id": 1,
        "created": "2014-08-01 12:22:00",
        "type": "feature-create",
        "user": "John, Doe",
        "comment": "Optional comment",
        "data": {
            "name": "com.example.feature",
            "status": "off",
            "strategy": "default",
            "description": "Feature description"
        }
    },
    {
        "id": 2,
        "created": "2014-09-02 15:23:11",
        "type": "feature-update",
        "user": "User name",
        "comment": "Optional comment",
        "data": {
            "name": "com.example.feature",
            "status": "on"
        }
    },
    {
        "id": 3,
        "created": "1970-01-01 00:00:00",
        "type": "strategy-create",
        "user": "User name",
        "comment": "Optional comment",
        "data": {
            "name": "strategyA",
            "parameters_template": {
                "users": "example values",
                "target_age": "number"
            }
        }
    },
    {
        "id": 4,
        "created": "1970-01-01 00:00:00",
        "type": "strategy-update",
        "user": "localhost.localdomain",
        "comment": "commit message goes here",
        "data": {
            "name": "strategyA",
            "parameters_template": {
                "users": "new default example values"
            }
        }
    }
];