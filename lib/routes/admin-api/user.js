'use strict';

const Controller = require('../controller');

class UserController extends Controller {
    constructor(perms) {
        super(perms);
        this.get('/', this.getUser);
        this.get('/logout', this.logout);
    }

    getUser(req, res) {
        if (req.user) {
            const user = Object.assign({}, req.user);
            if (!this.extendedPermissions) {
                delete user.permissions;
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
        res.redirect('/');
    }
}

module.exports = UserController;
