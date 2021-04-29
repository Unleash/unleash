interface IBaseOptions {
    type: string;
    path: string;
    message: string;
}

interface IOptions extends IBaseOptions {
    options: IBaseOptions[];
}

class AuthenticationRequired {
    private type: string;

    private path: string;

    private message: string;

    private options: IBaseOptions[];

    constructor({ type, path, message, options }: IOptions) {
        this.type = type;
        this.path = path;
        this.message = message;
        this.options = options;
    }
}

export default AuthenticationRequired;
module.exports = AuthenticationRequired;
