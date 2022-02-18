const { createProxyMiddleware } = require('http-proxy-middleware');

const API_URL = process.env.UNLEASH_API || 'http://localhost:4242';

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: API_URL,
            changeOrigin: true,
        })
    );
    app.use(
        '/auth',
        createProxyMiddleware({
            target: API_URL,
            changeOrigin: true,
        })
    );
    app.use(
        '/logout',
        createProxyMiddleware({
            target: API_URL,
            changeOrigin: true,
        })
    );
};
