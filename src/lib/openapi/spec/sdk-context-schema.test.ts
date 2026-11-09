import fc from 'fast-check';
import { validateSchema } from '../validate.js';
import {
    type SdkContextSchema,
    sdkContextSchema,
} from './sdk-context-schema.js';
import { generate } from './sdk-context-schema.arbitraries.js';

test('sdkContextSchema', () =>
    fc.assert(
        fc.property(
            generate(),
            (data: SdkContextSchema) =>
                validateSchema(sdkContextSchema.$id, data) === undefined,
        ),
    ));
