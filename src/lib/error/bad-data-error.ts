import { ErrorObject } from 'ajv';
import { getPropFromString } from '../util/get-prop-from-string';
import { ApiErrorSchema, UnleashError } from './api-error';

type ValidationErrorDescription = {
    description: string;
    message: string;
    path?: string;
};
class BadDataError extends UnleashError {
    details: ValidationErrorDescription[];

    constructor(
        message: string,
        errors?: [ValidationErrorDescription, ...ValidationErrorDescription[]],
    ) {
        super({
            message:
                'Request validation failed: your request body failed to validate. Refer to the `details` list to see what happened.',
            name: 'BadDataError',
            details: [{ description: 'x', message: 'x' }],
        });

        this.details = errors ?? [{ message, description: message }];
    }

    toJSON(): ApiErrorSchema {
        return {
            ...super.toJSON(),
            details: this.details,
        };
    }
}

export default BadDataError;

export const fromOpenApiValidationError =
    (requestBody: object) =>
    (validationError: ErrorObject): ValidationErrorDescription => {
        // @ts-expect-error Unsure why, but the `dataPath` isn't listed on the type definition for error objects. However, it's always there. Suspect this is a bug in the library.
        const propertyName = validationError.dataPath.substring(
            '.body.'.length,
        );
        if (validationError.keyword === 'required') {
            const path =
                propertyName + '.' + validationError.params.missingProperty;
            const description = `The ${path} property is required. It was not present on the data you sent.`;
            return {
                path,
                description,
                message: description,
            };
        } else if (validationError.keyword === 'additionalProperties') {
            const path =
                (propertyName ? propertyName + '.' : '') +
                validationError.params.additionalProperty;
            const description = `The ${
                propertyName ? `\`${propertyName}\`` : 'root'
            } object of the request body does not allow additional properties. Your request included the \`${path}\` property.`;
            return {
                path,
                description,
                message: description,
            };
        } else {
            const input = getPropFromString(propertyName, requestBody);

            const youSent = JSON.stringify(input);
            const description = `The .${propertyName} property ${validationError.message}. You sent ${youSent}.`;
            return {
                description,
                message: description,
                path: propertyName,
            };
        }
    };

export const fromOpenApiValidationErrors = (
    requestBody: object,
    validationErrors: [ErrorObject, ...ErrorObject[]],
): BadDataError => {
    const [firstDetail, ...remainingDetails] = validationErrors.map(
        fromOpenApiValidationError(requestBody),
    );

    return new BadDataError(
        "Request validation failed: the payload you provided doesn't conform to the schema. Check the `details` property for a list of errors that we found.",
        [firstDetail, ...remainingDetails],
    );
};
