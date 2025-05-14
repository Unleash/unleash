import { type ApiErrorSchema, UnleashError } from '../error/unleash-error.js';

interface IBaseOptions {
    type: string;
    path: string;
    message: string;
    defaultHidden?: boolean;
}

interface IOptions extends IBaseOptions {
    options?: IBaseOptions[];
}

export class AuthenticationRequired extends UnleashError {
    statusCode = 401;

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
        super(message);
        this.type = type;
        this.path = path;
        this.options = options;
        this.defaultHidden = defaultHidden;
    }

    toJSON(): ApiErrorSchema {
        return {
            ...super.toJSON(),
            path: this.path,
            type: this.type,
            defaultHidden: this.defaultHidden,
            ...(this.options ? { options: this.options } : {}),
        };
    }
}

export default AuthenticationRequired;
