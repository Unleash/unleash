module.exports = function (app) {
    app.get('/features', function (req, res) {
        res.send('some nice json features here!');
    });
};