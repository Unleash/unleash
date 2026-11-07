import { BadDataError } from '../../error/index.js';
import { compilePayloadSchema } from './payload-schema-compiler.js';

const SUPPORTED_DRAFT = 'https://json-schema.org/draft/2020-12/schema';

export const validatePayloadSchema = (
    schema: Record<string, unknown>,
): void => {
    if ('$schema' in schema && schema.$schema !== SUPPORTED_DRAFT) {
        throw new BadDataError(
            `Invalid payload schema: only JSON Schema draft 2020-12 is supported (${SUPPORTED_DRAFT}).`,
        );
    }

    try {
        compilePayloadSchema(schema);
    } catch (error) {
        throw new BadDataError(
            `Invalid payload schema (JSON Schema draft 2020-12): ${error.message}`,
        );
    }
};
