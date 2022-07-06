import fc, { Arbitrary } from 'fast-check';
import {
    playgroundResponseSchema,
    PlaygroundResponseSchema,
} from '../../../lib/openapi/spec/playground-response-schema';
import { validateSchema } from '../validate';
import {
    generate as generateInput,
    urlFriendlyString,
} from './playground-request-schema.test';

const generate = (): Arbitrary<PlaygroundResponseSchema> =>
    fc.record({
        input: generateInput(),
        toggles: fc.array(
            fc.record({
                isEnabled: fc.boolean(),
                projectId: urlFriendlyString(),
                name: urlFriendlyString(),
                variant: fc.option(urlFriendlyString()),
            }),
        ),
    });

test('playgroundResponseSchema', () =>
    fc.assert(
        fc.property(
            generate(),
            (data: PlaygroundResponseSchema) =>
                validateSchema(playgroundResponseSchema.$id, data) ===
                undefined,
        ),
    ));
