import fc from 'fast-check';
import { validateSchema } from '../validate.js';
import {
    playgroundFeatureSchema,
    type PlaygroundFeatureSchema,
} from './playground-feature-schema.js';
import { generate } from './playground-feature-schema.arbitraries.js';

test('playgroundFeatureSchema', () =>
    fc.assert(
        fc.property(
            generate(),
            fc.context(),
            (data: PlaygroundFeatureSchema, ctx) => {
                const results = validateSchema(
                    playgroundFeatureSchema.$id,
                    data,
                );
                ctx.log(JSON.stringify(results));
                return results === undefined;
            },
        ),
    ));
