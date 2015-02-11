module.exports = function(app) {

    app.get('/health', function(req, res) {
        res.json({health: 'GOOD'});
    });

};