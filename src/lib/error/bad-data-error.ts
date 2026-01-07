import type { ErrorObject } from 'ajv';
import type { ValidationError } from 'joi';
import getProp from 'lodash.get';
import { type ApiErrorSchema, UnleashError } from './unleash-error.js';

type ValidationErrorDescription = {
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

        this.details = errors ?? [{ message: message }];
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
    const message = `The \`${path}\` property is required. It was not present on the data you sent.`;
    return {
        path,
        message,
    };
};

const additionalPropertiesMessage = (
    pathToParentObject: string,
    additionalPropertyName: string,
) => {
    const path = constructPath(pathToParentObject, additionalPropertyName);
    const message = `The ${
        pathToParentObject ? `\`${pathToParentObject}\`` : 'root'
    } object of the request body does not allow additional properties. Your request included the \`${path}\` property.`;

    return {
        path,
        message,
    };
};

const genericErrorMessage = (
    propertyName: string,
    propertyValue: object,
    errorMessage: string = 'is invalid',
) => {
    const youSent = JSON.stringify(propertyValue);
    const message = `The \`${propertyName}\` property ${errorMessage}. You sent ${youSent}.`;
    return {
        message,
        path: propertyName,
    };
};

const oneOfMessage = (
    propertyName: string,
    errorMessage: string = 'is invalid',
) => {
    const errorPosition =
        propertyName === '' ? 'root object' : `"${propertyName}" property`;

    const message = `The ${errorPosition} ${errorMessage}. The data you provided matches more than one option in the schema. These options are mutually exclusive. Please refer back to the schema and remove any excess properties.`;

    return {
        message,
        path: propertyName,
    };
};

const enumMessage = (
    propertyName: string,
    message: string | undefined,
    allowedValues: string[],
    suppliedValue: string | null | undefined,
) => {
    const fullMessage = `The \`${propertyName}\` property ${
        message ?? 'must match one of the allowed values'
    }: ${allowedValues
        .map((value) => `"${value}"`)
        .join(
            ', ',
        )}. You provided "${suppliedValue}", which is not valid. Please use one of the allowed values instead..`;

    return {
        message: fullMessage,
        path: propertyName,
    };
};

export const fromOpenApiValidationError =
    (data: object) =>
    (validationError: ErrorObject): ValidationErrorDescription => {
        const { instancePath, params, message } = validationError;

        const propertyValue = getProp(
            data,
            instancePath.split('/').filter(Boolean),
        );

        switch (validationError.keyword) {
            case 'required':
                return missingRequiredPropertyMessage(
                    instancePath,
                    params.missingProperty,
                );
            case 'additionalProperties':
                return additionalPropertiesMessage(
                    instancePath,
                    params.additionalProperty,
                );
            case 'enum':
                return enumMessage(
                    instancePath.substring(instancePath.lastIndexOf('/') + 1),
                    message,
                    params.allowedValues,
                    propertyValue,
                );

            case 'oneOf':
                return oneOfMessage(instancePath, validationError.message);
            default:
                return genericErrorMessage(
                    instancePath,
                    propertyValue,
                    message,
                );
        }
    };

export const fromOpenApiValidationErrors = (
    data: object,
    validationErrors: [ErrorObject, ...ErrorObject[]],
): BadDataError => {
    const [firstDetail, ...remainingDetails] = validationErrors.map(
        fromOpenApiValidationError(data),
    );

    return new BadDataError(
        "Request validation failed: your request doesn't conform to the schema. Check the `details` property for a list of errors that we found.",
        [firstDetail, ...remainingDetails],
    );
};

export const fromJoiError = (err: ValidationError): BadDataError => {
    const details = err.details.map((detail) => {
        const messageEnd = detail.context?.value
            ? `. You provided ${JSON.stringify(detail.context.value)}.`
            : '.';
        const message = detail.message + messageEnd;
        return {
            message,
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
