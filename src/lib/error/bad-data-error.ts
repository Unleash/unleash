import { ErrorObject } from 'ajv';
import { ValidationError } from 'joi';
import getProp from 'lodash.get';
import { ApiErrorSchema, UnleashError } from './unleash-error';

type ValidationErrorDescription = {
    description?: string;
    message: string;
    path?: string;
};
class BadDataError extends UnleashError {
    statusCode = 400;

    details: ValidationErrorDescription[];

    constructor(
        message: string,
        errors?: [ValidationErrorDescription, ...ValidationErrorDescription[]],
    ) {
        const topLevelMessage = `Request validation failed: your request body or params contain invalid data${
            errors
                ? '. Refer to the `details` list for more information.'
                : `: ${message}`
        }`;
        super(topLevelMessage);

        this.details = errors ?? [{ message: message, description: message }];
    }

    toJSON(): ApiErrorSchema {
        return {
            ...super.toJSON(),
            details: this.details,
        };
    }
}

export default BadDataError;

const constructPath = (pathToParent: string, propertyName: string) =>
    [pathToParent, propertyName].filter(Boolean).join('/');

const missingRequiredPropertyMessage = (
    pathToParentObject: string,
    missingPropertyName: string,
) => {
    const path = constructPath(pathToParentObject, missingPropertyName);
    const description = `The \`${path}\` property is required. It was not present on the data you sent.`;
    return {
        path,
        description,
        message: description,
    };
};

const additionalPropertiesMessage = (
    pathToParentObject: string,
    additionalPropertyName: string,
) => {
    const path = constructPath(pathToParentObject, additionalPropertyName);
    const description = `The ${
        pathToParentObject ? `\`${pathToParentObject}\`` : 'root'
    } object of the request body does not allow additional properties. Your request included the \`${path}\` property.`;

    return {
        path,
        description,
        message: description,
    };
};

const genericErrorMessage = (
    requestBody: object,
    propertyName: string,
    errorMessage: string = 'is invalid',
) => {
    const input = getProp(requestBody, propertyName.split('/'));

    const youSent = JSON.stringify(input);
    const description = `The \`${propertyName}\` property ${errorMessage}. You sent ${youSent}.`;
    return {
        description,
        message: description,
        path: propertyName,
    };
};

const oneOfMessage = (
    propertyName: string,
    errorMessage: string = 'is invalid',
) => {
    const errorPosition =
        propertyName === '' ? 'root object' : `"${propertyName}" property`;

    const description = `The ${errorPosition} ${errorMessage}. The data you provided matches more than one option in the schema. These options are mutually exclusive. Please refer back to the schema and remove any excess properties.`;

    return {
        description,
        message: description,
        path: propertyName,
    };
};

const enumMessage = (
    propertyName: string,
    message: string | undefined,
    allowedValues: string[],
    suppliedValue: string | null | undefined,
) => {
    const description = `The \`${propertyName}\` property ${
        message ?? 'must match one of the allowed values'
    }: ${allowedValues
        .map((value) => `"${value}"`)
        .join(
            ', ',
        )}. You provided "${suppliedValue}", which is not valid. Please use one of the allowed values instead..`;

    return {
        description,
        message: description,
        path: propertyName,
    };
};

export const fromOpenApiValidationError =
    (requestBody: object) =>
    (validationError: ErrorObject): ValidationErrorDescription => {
        const { instancePath, params, message } = validationError;
        const propertyName = instancePath.substring('/body/'.length);

        switch (validationError.keyword) {
            case 'required':
                return missingRequiredPropertyMessage(
                    propertyName,
                    params.missingProperty,
                );
            case 'additionalProperties':
                return additionalPropertiesMessage(
                    propertyName,
                    params.additionalProperty,
                );
            case 'enum':
                return enumMessage(
                    instancePath.substring(instancePath.lastIndexOf('/') + 1),
                    message,
                    params.allowedValues,
                    getProp(
                        requestBody,
                        instancePath.substring('/body/'.length).split('/'),
                    ),
                );

            case 'oneOf':
                return oneOfMessage(propertyName, validationError.message);
            default:
                return genericErrorMessage(requestBody, propertyName, message);
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

export const fromJoiError = (err: ValidationError): BadDataError => {
    const details = err.details.map((detail) => {
        const messageEnd = detail.context?.value
            ? `. You provided ${JSON.stringify(detail.context.value)}.`
            : '.';
        const description = detail.message + messageEnd;
        return {
            description,
            message: description,
        };
    });

    const [first, ...rest] = details;

    if (first) {
        return new BadDataError(
            'A validation error occurred while processing your request data. Refer to the `details` property for more information.',
            [first, ...rest],
        );
    } else {
        return new BadDataError(
            'A validation error occurred while processing your request data. Please make sure it conforms to the request data schema.',
        );
    }
};
