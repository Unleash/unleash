import fc from 'fast-check';
import {
    playgroundRequestSchema,
    type PlaygroundRequestSchema,
} from '../../../lib/openapi/spec/playground-request-schema.js';
import { validateSchema } from '../validate.js';
import { generate } from './playground-request-schema.arbitraries.js';

test('playgroundRequestSchema', () =>
    fc.assert(
        fc.property(
            generate(),
            (data: PlaygroundRequestSchema) =>
                validateSchema(playgroundRequestSchema.$id, data) === undefined,
        ),
    ));
