import { Ajv2020 } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { BadDataError } from '../../error/index.js';

const SUPPORTED_DRAFT = 'https://json-schema.org/draft/2020-12/schema';

export const validatePayloadSchema = (
    schema: Record<string, unknown>,
): void => {
    if ('$schema' in schema && schema.$schema !== SUPPORTED_DRAFT) {
        throw new BadDataError(
            `Invalid payload schema: only JSON Schema draft 2020-12 is supported (${SUPPORTED_DRAFT}).`,
        );
    }

    // A new instance for every schema: Ajv keeps each schema it compiles and
    // refuses a second one with the same $id.
    const ajv = new Ajv2020({
        //Turn off warning logs
        strictTypes: false,
        strictTuples: false,
    });
    addFormats.default(ajv);

    try {
        ajv.compile(schema);
    } catch (error) {
        throw new BadDataError(
            `Invalid payload schema (JSON Schema draft 2020-12): ${error.message}`,
        );
    }
};
