const Controller = require('../controller');

class PasswordProvider extends Controller {
    constructor(config, { userService }) {
        super(config);
        this.logger = config.getLogger('/auth/password-provider.js');
        this.userService = userService;

        this.post('/login', this.login);
    }

    async login(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: 'You must provide username and password',
            });
        }

        const user = await this.userService.loginUser(username, password);
        req.session.user = user;
        return res.status(200).json(user);
    }
}

module.exports = PasswordProvider;
