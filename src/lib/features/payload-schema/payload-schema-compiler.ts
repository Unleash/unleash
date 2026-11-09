import { Ajv2020 } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

export type PayloadMismatch = (payload: unknown) => string | undefined;

// A new instance for every schema: Ajv keeps each schema it compiles and
// refuses a second one with the same $id.
export const compilePayloadSchema = (
    schema: Record<string, unknown>,
): PayloadMismatch => {
    const ajv = new Ajv2020({
        //Turn off warning logs
        strictTypes: false,
        strictTuples: false,
    });
    addFormats.default(ajv);
    const matchesSchema = ajv.compile(schema);

    return (payload) =>
        matchesSchema(payload)
            ? undefined
            : ajv.errorsText(matchesSchema.errors);
};
