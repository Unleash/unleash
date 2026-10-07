import { Ajv2020 } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { BadDataError } from '../../error/index.js';

export const validatePayloadSchema = (
    schema: Record<string, unknown>,
): void => {
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
