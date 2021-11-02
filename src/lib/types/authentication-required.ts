interface IBaseOptions {
    type: string;
    path: string;
    message: string;
    defaultHidden?: boolean;
}

interface IOptions extends IBaseOptions {
    options?: IBaseOptions[];
}

class AuthenticationRequired {
    private type: string;

    private path: string;

    private message: string;

    private defaultHidden: boolean;

    private options?: IBaseOptions[];

    constructor({
        type,
        path,
        message,
        options,
        defaultHidden = false,
    }: IOptions) {
        this.type = type;
        this.path = path;
        this.message = message;
        this.options = options;
        this.defaultHidden = defaultHidden;
    }
}

export default AuthenticationRequired;
module.exports = AuthenticationRequired;
