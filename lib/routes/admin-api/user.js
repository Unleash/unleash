'use strict';

const Controller = require('../controller');

class UserController extends Controller {
    constructor(config) {
        super(config);
        this.get('/', this.getUser);
        this.get('/logout', this.logout);
    }

    getUser(req, res) {
        if (req.user) {
            const user = Object.assign({}, req.user);
            if (!this.config.extendedPermissions) {
                delete user.permissions;
            } else if (!Array.isArray(user.permissions)) {
                user.permissions = [];
            }
            return res
                .status(200)
                .json(user)
                .end();
        } else {
            return res.status(404).end();
        }
    }

    logout(req, res) {
        if (req.session) {
            req.session = null;
        }
        if (req.logout) {
            req.logout();
        }
        res.redirect('/');
    }
}

module.exports = UserController;
