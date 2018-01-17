'use strict';

const { Router } = require('express');

exports.router = function() {
    const router = Router();

    router.get('/', (req, res) => {
        if (req.user) {
            return res
                .status(200)
                .json(req.user)
                .end();
        } else {
            return res.status(404).end();
        }
    });

    router.get('/logout', (req, res) => {
        if (req.session) {
            req.session = null;
        }
        res.redirect('/');
    });

    return router;
};
