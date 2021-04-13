'use strict';

const Controller = require('../controller');

class UserController extends Controller {
    constructor(config, { userService }) {
        super(config);
        this.userService = userService;
        this.logger = config.getLogger('admin-api/user.js');
        this.get('/', this.getUser);
        this.get('/logout', this.logout);
    }

    getUser(req, res) {
        if (req.user) {
            const user = { ...req.user };
            delete user.permissions; // TODO: remove
            return res
                .status(200)
                .json(user)
                .end();
        }
        return res.status(404).end();
    }

    // Deprecated, use "/logout" instead.  Will be removed in v4.
    logout(req, res) {
        if (req.session) {
            req.session = null;
        }
        if (req.logout) {
            req.logout();
        }
        res.redirect(`${this.config.baseUriPath}/`);
    }
}

module.exports = UserController;
