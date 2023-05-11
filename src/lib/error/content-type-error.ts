import { UnleashError } from './unleash-error';

class ContentTypeError extends UnleashError {
    constructor(
        acceptedContentTypes: [string, ...string[]],
        providedContentType?: string,
    ) {
        const message = `We do not accept the content-type you provided (${
            providedContentType || "you didn't provide one"
        }). Try using one of the content-types we do accept instead (${acceptedContentTypes.join(
            ', ',
        )}) and make sure the body is in the corresponding format.`;

        super(message);
    }
}

export default ContentTypeError;
module.exports = ContentTypeError;
