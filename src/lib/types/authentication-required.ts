import { UnleashError } from '../error/api-error';

interface IBaseOptions {
    type: string;
    path: string;
    message: string;
    defaultHidden?: boolean;
}

interface IOptions extends IBaseOptions {
    options?: IBaseOptions[];
}

class AuthenticationRequired extends UnleashError {
    private type: string;

    private path: string;

    private defaultHidden: boolean;

    private options?: IBaseOptions[];

    constructor({
        type,
        path,
        message,
        options,
        defaultHidden = false,
    }: IOptions) {
        super({ name: 'AuthenticationRequired', message, path, type });
        this.type = type;
        this.path = path;
        this.options = options;
        this.defaultHidden = defaultHidden;
    }
}

export default AuthenticationRequired;
module.exports = AuthenticationRequired;
