'use strict';

const Controller = require('../controller');

class UserController extends Controller {
    constructor() {
        super();
        this.get('/', this.getUser);
        this.get('/logout', this.logout);
    }

    getUser(req, res) {
        if (req.user) {
            return res
                .status(200)
                .json(req.user)
                .end();
        } else {
            return res.status(404).end();
        }
    }

    logout(req, res) {
        if (req.session) {
            req.session = null;
        }
        res.redirect('/');
    }
}

module.exports = UserController;
